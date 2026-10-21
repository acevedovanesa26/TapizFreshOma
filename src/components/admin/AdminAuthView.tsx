import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { auth, OtpSession } from '../../services/auth';
import { storage } from '../../services/storage';
import { Administrador } from '../../types';

interface AdminAuthViewProps {
  onSuccess: (admin: Administrador) => void;
  onBackToPublic: () => void;
}

type AuthStep = 'email_or_password' | 'enter_otp' | 'create_password';

export const AdminAuthView: React.FC<AdminAuthViewProps> = ({ onSuccess, onBackToPublic }) => {
  const [step, setStep] = useState<AuthStep>('email_or_password');
  const [mode, setMode] = useState<'otp_request' | 'password_login'>('otp_request');

  const [email, setEmail] = useState('tapizoma2026@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP 6-box input state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback & State
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Lockout state
  const [lockoutStatus, setLockoutStatus] = useState(auth.isLockedOut());

  // Timers
  const [otpExpiresIn, setOtpExpiresIn] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [devSimulatedCode, setDevSimulatedCode] = useState<string | null>(null);

  // Check lockout on mount
  useEffect(() => {
    const updateLockout = () => {
      setLockoutStatus(auth.isLockedOut());
    };
    updateLockout();
    const interval = setInterval(updateLockout, 5000);
    return () => clearInterval(interval);
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (step !== 'enter_otp') return;

    const timer = setInterval(() => {
      const active = auth.getActiveOtp();
      if (active) {
        const remainingMs = active.expiresAt - Date.now();
        const resendMs = active.resendAvailableAt - Date.now();
        setOtpExpiresIn(Math.max(0, Math.floor(remainingMs / 1000)));
        setResendCooldown(Math.max(0, Math.floor(resendMs / 1000)));

        if (remainingMs <= 0) {
          setErrorMsg('El código ha expirado. Por favor solicita uno nuevo.');
        }
      } else {
        setOtpExpiresIn(0);
        setResendCooldown(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // Handle Request OTP
  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = auth.requestOtp(email);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        setLockoutStatus(auth.isLockedOut());
        return;
      }

      setInfoMsg(res.message);
      if (res.generatedCode) {
        setDevSimulatedCode(res.generatedCode);
      }
      setStep('enter_otp');
      setOtpDigits(['', '', '', '', '', '']);

      // Focus first digit box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  // Handle 6-Box OTP input navigation
  const handleOtpDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    const updated = [...otpDigits];

    if (clean.length > 1) {
      // User pasted multiple digits
      const chars = clean.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        updated[i] = chars[i] || '';
      }
      setOtpDigits(updated);
      const nextIndex = Math.min(chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    updated[index] = clean;
    setOtpDigits(updated);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // Submit OTP Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const fullCode = otpDigits.join('');

    if (fullCode.length !== 6) {
      setErrorMsg('Por favor ingresa los 6 dígitos del código.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = auth.verifyOtp(fullCode);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        setLockoutStatus(auth.isLockedOut());
        return;
      }

      // Check if admin already has password configured
      if (res.admin) {
        if (!res.admin.ha_creado_password) {
          // First time entrance: prompt to create a password
          setStep('create_password');
          setInfoMsg('¡Código verificado! Ahora crea tu contraseña de acceso para los próximos ingresos.');
        } else {
          // Directly log in or give option to reset password
          setStep('create_password');
          setInfoMsg('Código correcto. Puedes crear una nueva contraseña para actualizar tu acceso.');
        }
      }
    }, 500);
  };

  // Submit Create / Set Password
  const handleCreatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 10) {
      setErrorMsg('La contraseña debe tener como mínimo 10 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = auth.setPasswordForAdmin(email, password);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      const admin = storage.getAdminByEmail(email);
      if (admin) {
        onSuccess(admin);
      }
    }, 600);
  };

  // Submit Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = auth.loginWithPassword(email, password);
      setLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        setLockoutStatus(auth.isLockedOut());
        return;
      }

      if (res.admin) {
        onSuccess(res.admin);
      }
    }, 500);
  };

  const passwordStrength = auth.evaluatePasswordStrength(password);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#EBF7F8] via-white to-[#F4FAF9] overflow-hidden">
      {/* Floating Animated Bubbles Background */}
      <div className="bubble-particle" style={{ width: 80, height: 80, left: '10%', animationDelay: '0s' }}></div>
      <div className="bubble-particle" style={{ width: 120, height: 120, left: '75%', animationDelay: '4s' }}></div>
      <div className="bubble-particle" style={{ width: 60, height: 60, left: '40%', animationDelay: '8s' }}></div>
      <div className="bubble-particle" style={{ width: 90, height: 90, left: '85%', animationDelay: '2s' }}></div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Back to public site button */}
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al sitio web de clientes</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#78BDC4] to-[#4F9DA6] mx-auto flex items-center justify-center text-white shadow-lg shadow-[#78BDC4]/35 mb-3 relative">
            <span className="text-2xl font-black">TF</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white/40 rounded-full blur-[1px]"></div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tapiz Fresh • Gestión de Clientes, Cotizaciones y Agenda
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutStatus.locked && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-xs">
              <span className="font-bold block">Acceso bloqueado por seguridad</span>
              Superaste el límite de 5 intentos fallidos. Intenta nuevamente en{' '}
              <strong>{lockoutStatus.remainingMinutes} minutos</strong>.
            </div>
          </div>
        )}

        {/* Dev hint / test credentials banner */}
        <div className="mb-5 p-3 rounded-2xl bg-[#EBF7F8] border border-[#78BDC4]/40 flex items-center justify-between text-xs text-[#2F6F77]">
          <div>
            <span className="font-bold block">Administrador Propietaria:</span>
            <code className="text-[11px] font-mono text-slate-700">tapizoma2026@gmail.com</code>
          </div>
          {devSimulatedCode && step === 'enter_otp' && (
            <button
              onClick={() => {
                setOtpDigits(devSimulatedCode.split(''));
              }}
              className="px-2.5 py-1 bg-[#78BDC4] text-white rounded-lg font-bold text-[11px] hover:bg-[#4F9DA6] cursor-pointer"
            >
              Autollenar ({devSimulatedCode})
            </button>
          )}
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Email or Password Form */}
        {step === 'email_or_password' && (
          <div>
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setMode('otp_request');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'otp_request'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Código por Correo (OTP)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('password_login');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'password_login'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Contraseña
              </button>
            </div>

            {mode === 'otp_request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo del Administrador
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tapizoma2026@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={lockoutStatus.locked}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20 disabled:bg-slate-100"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Solo administradores registrados en el sistema tienen autorización de acceso.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutStatus.locked}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Enviando código...' : 'Enviarme un código'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="tapizoma2026@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={lockoutStatus.locked}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('otp_request');
                        handleRequestOtp();
                      }}
                      className="text-[11px] font-semibold text-[#4F9DA6] hover:underline cursor-pointer"
                    >
                      Olvidé mi contraseña
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Tu contraseña (mínimo 10 caracteres)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={lockoutStatus.locked}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20 disabled:bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutStatus.locked}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: 6-Digit OTP Box Entry */}
        {step === 'enter_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500">
                Código enviado a: <strong className="text-slate-800">{email}</strong>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ingresa los 6 dígitos numéricos recibidos.
              </p>
            </div>

            {/* 6 separate digit boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePasteOtp : undefined}
                  disabled={lockoutStatus.locked}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border-2 border-slate-200 focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20 outline-none transition-all bg-white"
                />
              ))}
            </div>

            {/* Timers & Resend button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#4F9DA6]" />
                <span>
                  Vence en:{' '}
                  <strong className="text-slate-800">
                    {Math.floor(otpExpiresIn / 60)}:
                    {(otpExpiresIn % 60).toString().padStart(2, '0')}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading || lockoutStatus.locked}
                onClick={() => handleRequestOtp()}
                className="text-[#4F9DA6] font-bold hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar código'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6 || lockoutStatus.locked}
              className="w-full py-3.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Comprobando código...' : 'Verificar Código'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email_or_password');
                setErrorMsg('');
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cambiar correo electrónico
            </button>
          </form>
        )}

        {/* STEP 3: Create / Set New Password */}
        {step === 'create_password' && (
          <form onSubmit={handleCreatePassword} className="space-y-4">
            <div className="text-center mb-1">
              <span className="text-xs font-bold text-slate-700 block">
                Crea tu Contraseña Maestra
              </span>
              <p className="text-[11px] text-slate-500">
                Mínimo 10 caracteres con indicador de fortaleza para máxima seguridad.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 10 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength visual bar */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500 font-medium">Fortaleza:</span>
                  <span
                    className="font-bold uppercase tracking-wider"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(passwordStrength.score / 3) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 mt-2">
                  <span className={passwordStrength.hasLength ? 'text-emerald-600 font-bold' : ''}>
                    {passwordStrength.hasLength ? '✓' : '•'} 10+ caracteres
                  </span>
                  <span className={passwordStrength.hasUppercase ? 'text-emerald-600 font-bold' : ''}>
                    {passwordStrength.hasUppercase ? '✓' : '•'} Mayúscula
                  </span>
                  <span className={passwordStrength.hasNumber ? 'text-emerald-600 font-bold' : ''}>
                    {passwordStrength.hasNumber ? '✓' : '•'} Número
                  </span>
                  <span className={passwordStrength.hasSpecial ? 'text-emerald-600 font-bold' : ''}>
                    {passwordStrength.hasSpecial ? '✓' : '•'} Símbolo (!@#$)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la contraseña exactamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#78BDC4] focus:ring-2 focus:ring-[#78BDC4]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="text-[11px] text-rose-500 font-semibold block mt-1">
                  ⚠️ Las contraseñas no coinciden.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 10 || password !== confirmPassword}
              className="w-full py-3.5 px-4 rounded-xl bg-[#78BDC4] hover:bg-[#4F9DA6] text-white font-extrabold text-sm shadow-md shadow-[#78BDC4]/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Guardando contraseña...' : 'Guardar y Entrar al Panel'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
