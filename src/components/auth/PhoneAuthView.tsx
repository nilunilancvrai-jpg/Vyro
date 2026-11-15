import React, { useState, useEffect, useRef } from 'react';
import { ConfirmationResult, User } from 'firebase/auth';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types';
import { COUNTRY_CODES, validateMobileDigits } from '../../data/indianAddressData';
import {
  AuthErrorGuidance,
  destroyActiveRecaptcha,
  ensureRecaptchaVerifier,
  isRecaptchaAlreadyRenderedError,
  mapFirebaseAuthError,
  sendPhoneOtp,
  signInWithGoogleFallback,
  verifyPhoneOtp,
} from '../../services/authService';
import { VyroLogo } from '../VyroLogo';

interface PhoneAuthViewProps {
  selectedRole: UserRole;
  onBackToRole: () => void;
  onAuthenticated: (user: User, phoneNumber: string) => Promise<void>;
}

export const PhoneAuthView: React.FC<PhoneAuthViewProps> = ({
  selectedRole,
  onBackToRole,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [mobileDigits, setMobileDigits] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<AuthErrorGuidance | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaHostRef = useRef<HTMLDivElement | null>(null);
  const sendInFlightRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);
  const authTimerRef = useRef<number | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  // Initialize single RecaptchaVerifier after DOM mount (StrictMode-safe) and tear down on unmount
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;
    const hostEl = recaptchaHostRef.current;

    // Defer slightly via microtask so React StrictMode's simulated unmount cancels the first mount cleanly
    queueMicrotask(() => {
      if (cancelled || !hostEl || !hostEl.isConnected) return;
      void ensureRecaptchaVerifier(hostEl, {
        onExpired: () => {
          if (isMountedRef.current) {
            setIsRecaptchaReady(false);
            setErrorInfo({
              code: 'recaptcha-expired',
              message: 'Security verification expired. Please tap Send 6-Digit OTP again.',
            });
          }
        },
        onError: () => {
          if (isMountedRef.current) {
            setIsRecaptchaReady(false);
          }
        },
      })
        .then(() => {
          if (!cancelled && isMountedRef.current) {
            setIsRecaptchaReady(true);
          }
        })
        .catch(() => {
          if (!cancelled && isMountedRef.current) {
            setIsRecaptchaReady(false);
          }
        });
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      if (authTimerRef.current !== null) {
        window.clearTimeout(authTimerRef.current);
        authTimerRef.current = null;
      }
      destroyActiveRecaptcha(hostEl);
    };
  }, []);

  const fullPhone = `${countryCode}${mobileDigits.replace(/\D/g, '')}`;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sendInFlightRef.current) return;

    setErrorInfo(null);

    const validationError = validateMobileDigits(countryCode, mobileDigits);
    if (validationError) {
      setErrorInfo({ code: 'validation', message: validationError });
      return;
    }

    const hostEl = recaptchaHostRef.current;
    if (!hostEl || !hostEl.isConnected) {
      setErrorInfo({
        code: 'container-missing',
        message: 'Security verification container is not ready yet. Please wait a moment and try again.',
      });
      return;
    }

    sendInFlightRef.current = true;
    setIsSending(true);
    try {
      const lifecycleCallbacks = {
        onExpired: () => {
          if (isMountedRef.current) {
            setIsRecaptchaReady(false);
            setErrorInfo({
              code: 'recaptcha-expired',
              message: 'Security verification expired. Please tap Send 6-Digit OTP again.',
            });
          }
        },
        onError: () => {
          if (isMountedRef.current) {
            setIsRecaptchaReady(false);
          }
        },
      };

      // Reuse existing verifier if valid, or initialize a single verifier once
      let verifier = await ensureRecaptchaVerifier(hostEl, lifecycleCallbacks);
      setIsRecaptchaReady(true);

      let result: ConfirmationResult;
      try {
        result = await sendPhoneOtp(fullPhone, verifier);
      } catch (firstErr) {
        // If reCAPTCHA widget was invalidated/expired externally, reset once onto a fresh slot and retry
        const errCode = (firstErr as { code?: string })?.code;
        if (
          isRecaptchaAlreadyRenderedError(firstErr) ||
          errCode === 'auth/captcha-check-failed' ||
          errCode === 'auth/internal-error'
        ) {
          destroyActiveRecaptcha(hostEl);
          verifier = await ensureRecaptchaVerifier(hostEl, lifecycleCallbacks);
          result = await sendPhoneOtp(fullPhone, verifier);
        } else {
          throw firstErr;
        }
      }

      if (!isMountedRef.current) return;
      confirmationRef.current = result;
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(60);
      setStep('otp');
      window.setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      if (!isMountedRef.current) return;
      const errCode = (err as { code?: string })?.code;
      if (isRecaptchaAlreadyRenderedError(err) || errCode === 'auth/captcha-check-failed') {
        destroyActiveRecaptcha(hostEl);
        setIsRecaptchaReady(false);
      }
      setErrorInfo(mapFirebaseAuthError(err));
    } finally {
      sendInFlightRef.current = false;
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Handle multi-digit paste or fast typing
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(chars.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    setErrorInfo(null);

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    const chars = pasted.slice(0, 6).split('');
    const next = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      next[i] = c;
    });
    setOtpDigits(next);
    const focusIdx = Math.min(chars.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;
    setErrorInfo(null);

    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorInfo({ code: 'validation', message: 'Please enter all 6 digits of the SMS OTP.' });
      return;
    }
    if (!confirmationRef.current) {
      setErrorInfo({ code: 'expired', message: 'OTP session expired. Please request a new OTP.' });
      return;
    }

    setIsVerifying(true);
    try {
      const user = await verifyPhoneOtp(confirmationRef.current, code);
      if (!isMountedRef.current) return;
      setStep('verified');
      authTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          void onAuthenticated(user, user.phoneNumber || fullPhone);
        }
      }, 450);
    } catch (err) {
      if (isMountedRef.current) {
        setErrorInfo(mapFirebaseAuthError(err));
      }
    } finally {
      if (isMountedRef.current) {
        setIsVerifying(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (isVerifying || isSending) return;
    setErrorInfo(null);
    setIsVerifying(true);
    try {
      const user = await signInWithGoogleFallback();
      if (!isMountedRef.current) return;
      setStep('verified');
      authTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          void onAuthenticated(user, fullPhone.length >= 10 ? fullPhone : user.phoneNumber || '');
        }
      }, 450);
    } catch (err) {
      if (isMountedRef.current) {
        setErrorInfo(mapFirebaseAuthError(err));
      }
    } finally {
      if (isMountedRef.current) {
        setIsVerifying(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Single persistent host container for Firebase invisible reCAPTCHA */}
      <div id="vyro-recaptcha-container" ref={recaptchaHostRef} />

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'otp') {
                setStep('phone');
                setErrorInfo(null);
              } else {
                onBackToRole();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#102A56] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 'otp' ? 'Change mobile number' : 'Change account type'}</span>
          </button>
          <VyroLogo size="xs" showTagline={false} />
        </div>

        {/* Step A: Phone Input */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#1769E0] capitalize">
                {selectedRole} Authentication · Mobile OTP
              </p>
              <h1 className="text-2xl font-extrabold text-[#102A56] tracking-tight">
                Enter your mobile number
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                We will send a 6-digit verification code via SMS to verify your identity and load or create your{' '}
                <strong className="text-[#102A56] capitalize">{selectedRole}</strong> account.
              </p>
            </div>

            {errorInfo && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{errorInfo.message}</span>
                </div>
                {errorInfo.needsConsoleConfig && (
                  <p className="text-[11px] text-red-700 pl-6 leading-relaxed">
                    Firebase Console Setup: Open <strong>Authentication → Sign-in method → Phone</strong>, enable Phone
                    sign-in, add this app domain under <strong>Authorized domains</strong>, and add test numbers (e.g.,{' '}
                    <code className="font-mono">+91 9845023145</code> with code <code className="font-mono">123456</code>
                    ) for instant free testing.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="mobile-number-input" className="block text-xs font-bold text-[#102A56]">
                Mobile Number <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  aria-label="Country code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 px-2.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#102A56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="mobile-number-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={countryCode === '+91' ? 10 : 14}
                    value={mobileDigits}
                    onChange={(e) => {
                      setMobileDigits(e.target.value.replace(/\D/g, ''));
                      setErrorInfo(null);
                    }}
                    placeholder={countryCode === '+91' ? '9845023145' : 'Enter digits'}
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tabular-nums font-semibold text-[#102A56] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {countryCode === '+91'
                  ? 'Enter your 10-digit Indian mobile number (starts with 6–9).'
                  : 'Enter your mobile number without leading zero.'}
              </p>
            </div>

            <button
              type="submit"
              id="send-otp-btn"
              disabled={isSending}
              className="w-full py-3.5 px-4 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending OTP via SMS...</span>
                </>
              ) : (
                <>
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Protected by Firebase Phone Auth &amp; reCAPTCHA</span>
                <ShieldCheck className="w-4 h-4 text-[#0EA5A4]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isVerifying}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Or continue with Google Account</span>
              </button>
            </div>
          </form>
        )}

        {/* Step B: 6-Digit OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#1769E0]">Verify Mobile Number</p>
              <h1 className="text-2xl font-extrabold text-[#102A56] tracking-tight">Enter 6-digit OTP</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sent to <strong className="font-mono text-[#102A56]">{countryCode} {mobileDigits}</strong>. Enter or
                paste the 6-digit code below.
              </p>
            </div>

            {errorInfo && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorInfo.message}</span>
              </div>
            )}

            {/* Six Individual OTP Boxes */}
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5" role="group" aria-label="6-digit OTP input">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                  maxLength={6}
                  aria-label={`OTP digit ${idx + 1}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  className="h-12 sm:h-14 w-full text-center text-lg sm:text-xl font-mono tabular-nums font-bold text-[#102A56] bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#1769E0] focus:outline-none transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              id="verify-otp-btn"
              disabled={isVerifying || otpDigits.join('').length < 6}
              className="w-full py-3.5 px-4 bg-[#1769E0] hover:bg-[#102A56] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorInfo(null);
                }}
                className="font-semibold text-slate-600 hover:text-[#102A56] cursor-pointer"
              >
                Change mobile number
              </button>

              {countdown > 0 ? (
                <span className="text-slate-500 font-mono tabular-nums">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  id="resend-otp-btn"
                  onClick={() => void handleSendOtp()}
                  disabled={isSending}
                  className="inline-flex items-center gap-1 font-bold text-[#1769E0] hover:text-[#102A56] disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  <span>{isSending ? 'Resending OTP...' : 'Resend OTP'}</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* Step C: Verification Success Animation */}
        {step === 'verified' && (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-[#102A56]">Verification Successful</h2>
              <p className="text-xs text-slate-600">
                Checking your VYRO account and business registration status...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
