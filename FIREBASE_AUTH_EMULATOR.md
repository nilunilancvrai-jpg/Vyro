# VYRO Local Firebase Authentication Emulator Guide

This guide explains how to test VYRO's Mobile OTP authentication locally using the **Firebase Authentication Emulator** without needing Blaze billing or sending paid SMS messages.

> **Production Safety**: Production builds (`NODE_ENV=production` / `vite build`) and non-local hostnames strictly ignore all emulator flags and never connect to the emulator or accept emulator tokens.

---

## 1. Prerequisites

- Node.js `v20+` (Java is **not** required for the Authentication Emulator)
- Firebase CLI installed (`npx firebase --version` or `firebase --version`)
- Dependencies installed (`npm install`)

---

## 2. Configure Local Environment Variables (`.env.local`)

Create a `.env.local` file in the project root (already gitignored via `.env*`):

```bash
VITE_USE_FIREBASE_AUTH_EMULATOR="true"
VITE_FIREBASE_AUTH_EMULATOR_URL="http://127.0.0.1:9099"
FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
```

Do **not** commit `.env.local` and do **not** use these emulator flags in production deployment settings.

---

## 3. Start the Firebase Auth Emulator

In Terminal 1, start the Firebase Auth Emulator:

```bash
npm run emulators:auth
```

This starts:
- **Auth Emulator**: `http://127.0.0.1:9099`
- **Firebase Emulator UI**: `http://127.0.0.1:4000`

---

## 4. Start VYRO Dev Server with Emulator Mode

In Terminal 2, start VYRO (either with `.env.local` configured or directly via the helper script):

```bash
npm run dev:emulator
```

Open **`http://localhost:3000`** in your browser.

---

## 5. Test the Complete Phone OTP Login Flow

1. On the VYRO Welcome page, click **Continue with Mobile Number**.
2. Select either **Retailer** or **Wholesaler**.
3. Enter a valid 10-digit Indian mobile number (for example, `9845023145`) and click **Send 6-Digit OTP**.
   - In emulator mode, Firebase SDK's `connectAuthEmulator` connects `RecaptchaVerifier` to its mock verifier automatically (in production builds, standard invisible `RecaptchaVerifier` runs unchanged).
4. **Retrieve the 6-digit test OTP code** from either:
   - Terminal 1 where `npm run emulators:auth` is running (look for `SMS verification code for +919845023145: XXXXXX`), **or**
   - The Auth Emulator REST endpoint:
     ```bash
     curl http://127.0.0.1:9099/emulator/v1/projects/light-eye-r7cvm/verificationCodes
     ```
   - Or the Emulator UI at `http://127.0.0.1:4000/auth`.
5. Enter the 6-digit OTP on VYRO's verification screen and click **Verify & Continue**.
6. VYRO calls `POST /api/auth/verify-session`, which validates the emulator ID token via `firebase-admin/auth` (`FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`).

### Note on Cloud Firestore During Local Auth Emulator Testing
- Because `light-eye-r7cvm` Firestore is a live Cloud Firestore database (`ai-studio-vyro-c8e72333-38ed-4c88-992f-bfede58db875`) and local Firestore Emulator requires Java JDK 21+, live Cloud Firestore rejects unsigned Auth Emulator JWTs with `PERMISSION_DENIED`.
- To test full Firestore onboarding & dashboards against live Cloud Firestore without upgrading to Blaze Phone SMS, use **Continue with Google Account** on the login screen (with `VITE_USE_FIREBASE_AUTH_EMULATOR="false"`).

---

## 6. `DATA_ENCRYPTION_SECRET` Requirement

- **Purpose**: Server-side secret key material used in `server.ts` (`POST /api/validation/pan`) to encrypt sensitive taxpayer fields (such as raw PAN) with **AES-256-GCM** before masking/hashing.
- **Expected Format**: A **64-character hexadecimal string** representing 32 random bytes (256 bits), generated via:
  ```bash
  openssl rand -hex 32
  ```
- **Security Rules**:
  - Keep it strictly server-side (`DATA_ENCRYPTION_SECRET`, never `VITE_*`).
  - **Never** use a Firebase Web API key (`AIza...`) as `DATA_ENCRYPTION_SECRET` (rejected by the server).
  - Required in production (`NODE_ENV=production`); local development automatically uses an ephemeral random 32-byte key if unset.
