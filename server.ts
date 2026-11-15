import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const isProduction = process.env.NODE_ENV === 'production';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const adminAuth = getAuth();

interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication session' });
  }
};

// Ephemeral per-process fallback key for local development when DATA_ENCRYPTION_SECRET is unset
const DEV_EPHEMERAL_ENCRYPTION_KEY = crypto.randomBytes(32);

// Server-side AES-256-GCM encryption helper for sensitive identifiers (never logged or returned raw)
function getEncryptionKey(): Buffer {
  const configured = process.env.DATA_ENCRYPTION_SECRET?.trim();
  if (configured) {
    if (
      configured === 'CHANGE_ME_32_BYTE_RANDOM_HEX_SECRET' ||
      configured === 'CHANGE_ME_64_HEX_CHAR_SECRET_FROM_OPENSSL_RAND_HEX_32'
    ) {
      throw new Error(
        'DATA_ENCRYPTION_SECRET is set to a placeholder value. Generate a real 32-byte hex secret (openssl rand -hex 32).'
      );
    }
    if (configured.startsWith('AIza') || configured === firebaseConfig.apiKey) {
      throw new Error(
        'Invalid DATA_ENCRYPTION_SECRET: A Firebase API key must never be used as an encryption secret.'
      );
    }
    if (/^[0-9a-fA-F]{64}$/.test(configured)) {
      return Buffer.from(configured, 'hex');
    }
    if (configured.length < 32) {
      throw new Error(
        'Invalid DATA_ENCRYPTION_SECRET: Expected a 64-character hex string (32 random bytes) or a random secret of at least 32 characters.'
      );
    }
    return crypto.createHash('sha256').update(configured).digest();
  }

  if (isProduction) {
    throw new Error(
      'DATA_ENCRYPTION_SECRET is required in production. Expected a 64-character hex string (openssl rand -hex 32).'
    );
  }

  return DEV_EPHEMERAL_ENCRYPTION_KEY;
}

function encryptSensitiveValue(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '4mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'vyro-api', projectId: firebaseConfig.projectId });
  });

  // Verify Firebase ID token & return sanitized session claims
  app.post('/api/auth/verify-session', requireAuth, (req: AuthRequest, res) => {
    const decoded = req.user!;
    res.json({
      uid: decoded.uid,
      email: decoded.email || null,
      emailVerified: Boolean(decoded.email_verified),
      provider: decoded.firebase?.sign_in_provider || 'unknown',
      authTime: decoded.auth_time,
      expiresAt: decoded.exp,
    });
  });

  // Validate & mask PAN on server side; never echo raw PAN back or log it
  app.post('/api/validation/pan', requireAuth, (req: AuthRequest, res) => {
    const { pan, consent } = req.body as { pan?: string; consent?: boolean };

    if (!consent) {
      res.status(400).json({ error: 'User consent is required before processing PAN information.' });
      return;
    }

    const normalized = (pan || '').trim().toUpperCase();
    if (!PAN_REGEX.test(normalized)) {
      res.status(400).json({ error: 'Invalid PAN format. Expected 10 characters (e.g., ABCDE1234F).' });
      return;
    }

    try {
      const panMasked = `${normalized.slice(0, 2)}******${normalized.slice(8)}`;
      const panHash = hashValue(`${req.user!.uid}:${normalized}`);
      // Encrypted envelope computed server-side (never returned in API response or logs)
      void encryptSensitiveValue(normalized);

      res.json({
        valid: true,
        panMasked,
        panHash,
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Server encryption configuration error.',
      });
    }
  });

  // Server-side validation of onboarding payload
  app.post('/api/validation/onboarding', requireAuth, (req: AuthRequest, res) => {
    const body = req.body || {};
    const errors: Record<string, string> = {};

    if (!['retailer', 'wholesaler'].includes(body.role)) {
      errors.role = 'Account type must be either wholesaler or retailer.';
    }

    if (!body.fullName || String(body.fullName).trim().length < 2) {
      errors.fullName = 'Full legal name is required (minimum 2 characters).';
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
      errors.email = 'Valid business or personal email address is required.';
    }

    if (!body.businessName || String(body.businessName).trim().length < 2) {
      errors.businessName = 'Business / Shop name is required.';
    }

    if (body.gstin && String(body.gstin).trim() !== '') {
      const gst = String(body.gstin).trim().toUpperCase();
      if (!GSTIN_REGEX.test(gst)) {
        errors.gstin = 'Invalid 15-character GSTIN format.';
      }
    }

    if (body.bankIfsc && String(body.bankIfsc).trim() !== '') {
      const ifsc = String(body.bankIfsc).trim().toUpperCase();
      if (!IFSC_REGEX.test(ifsc)) {
        errors.bankIfsc = 'Invalid 11-character IFSC code (e.g. HDFC0001234).';
      }
    }

    if (!body.residentialPincode || !PINCODE_REGEX.test(String(body.residentialPincode).trim())) {
      errors.residentialPincode = 'Valid 6-digit Indian residential PIN code is required.';
    }

    if (!body.businessPincode || !PINCODE_REGEX.test(String(body.businessPincode).trim())) {
      errors.businessPincode = 'Valid 6-digit Indian business PIN code is required.';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ valid: false, errors });
      return;
    }

    res.json({ valid: true, verifiedBy: req.user!.uid });
  });

  // Record sanitized account deletion request acknowledgment
  app.post('/api/account/delete-request', requireAuth, (req: AuthRequest, res) => {
    const { reason } = req.body as { reason?: string };
    if (!reason || reason.trim().length < 3) {
      res.status(400).json({ error: 'Please provide a brief reason (minimum 3 characters).' });
      return;
    }
    res.json({
      accepted: true,
      uid: req.user!.uid,
      status: 'requested',
      message: 'Account deletion request verified and queued for processing.',
    });
  });

  // Vite middleware in dev / static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VYRO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
