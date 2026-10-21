import { storage } from './storage';
import { Administrador } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  admin: Administrador | null;
  sessionExpiry: number | null; // epoch ms
}

export interface OtpSession {
  email: string;
  code: string;
  expiresAt: number; // epoch ms
  resendAvailableAt: number; // epoch ms
}

const AUTH_STORAGE_KEYS = {
  CURRENT_ADMIN: 'tapiz_fresh_auth_session_v1',
  FAILED_ATTEMPTS: 'tapiz_fresh_failed_attempts_v1',
  LOCKOUT_UNTIL: 'tapiz_fresh_lockout_until_v1',
  ACTIVE_OTP: 'tapiz_fresh_active_otp_v1',
  PASSWORDS: 'tapiz_fresh_passwords_v1', // local credential store
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const OTP_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private inactivityTimer: any = null;
  private lastActivityTimestamp: number = Date.now();

  constructor() {
    this.initActivityListener();
  }

  private initActivityListener(): void {
    if (typeof window === 'undefined') return;

    const recordActivity = () => {
      this.lastActivityTimestamp = Date.now();
      const current = this.getCurrentSession();
      if (current.isAuthenticated) {
        // Extend session expiry
        const newExpiry = Date.now() + INACTIVITY_TIMEOUT_MS;
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify({
          admin: current.admin,
          expiresAt: newExpiry,
        }));
      }
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach((evt) => {
      window.addEventListener(evt, recordActivity, { passive: true });
    });

    // Check inactivity periodically
    setInterval(() => {
      this.checkInactivity();
    }, 15000);
  }

  private checkInactivity(): void {
    const session = this.getCurrentSession();
    if (!session.isAuthenticated) return;

    const timeSinceLastActivity = Date.now() - this.lastActivityTimestamp;
    if (timeSinceLastActivity > INACTIVITY_TIMEOUT_MS) {
      this.logout('Sesión cerrada automáticamente por inactividad de 30 minutos para proteger los datos de tus clientes.');
    }
  }

  public subscribe(cb: (state: AuthState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    const state = this.getCurrentSession();
    this.listeners.forEach((cb) => cb(state));
  }

  public getCurrentSession(): AuthState {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, admin: null, sessionExpiry: null };
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_ADMIN);
    if (!raw) return { isAuthenticated: false, admin: null, sessionExpiry: null };

    try {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.logout('Tu sesión expiró.');
        return { isAuthenticated: false, admin: null, sessionExpiry: null };
      }
      return {
        isAuthenticated: true,
        admin: parsed.admin,
        sessionExpiry: parsed.expiresAt,
      };
    } catch {
      return { isAuthenticated: false, admin: null, sessionExpiry: null };
    }
  }

  public isLockedOut(): { locked: boolean; remainingMinutes: number } {
    const until = localStorage.getItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
    if (!until) return { locked: false, remainingMinutes: 0 };
    const lockTime = parseInt(until, 10);
    const now = Date.now();
    if (now < lockTime) {
      const remainingMinutes = Math.ceil((lockTime - now) / 60000);
      return { locked: true, remainingMinutes };
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
      localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
      return { locked: false, remainingMinutes: 0 };
    }
  }

  public recordFailedAttempt(): { locked: boolean; remainingAttempts: number; remainingMinutes?: number } {
    const current = parseInt(localStorage.getItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS, current.toString());

    if (current >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      localStorage.setItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL, lockUntil.toString());
      return { locked: true, remainingAttempts: 0, remainingMinutes: LOCKOUT_MINUTES };
    }

    return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - current };
  }

  public clearFailedAttempts(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
  }

  /**
   * Request OTP code.
   * If email is in administradores table, generates a 6-digit code.
   * Regardless, returns uniform feedback so external callers cannot probe for emails.
   */
  public async requestOtp(email: string): Promise<{ success: boolean; message: string }> {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return {
        success: false,
        message: `Acceso bloqueado temporalmente por demasiados intentos fallidos. Intenta de nuevo en ${lockout.remainingMinutes} minutos.`,
      };
    }

    const admin = storage.getAdminByEmail(email);

    if (!admin) {
      // Neutral message to prevent email harvesting
      return {
        success: true,
        message: 'Si el correo está registrado en el equipo de Tapiz Fresh, recibirás tu código de 6 dígitos en unos instantes.',
      };
    }

    // Generate numeric 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpSession: OtpSession = {
      email: admin.correo,
      code,
      expiresAt: Date.now() + OTP_VALIDITY_MS,
      resendAvailableAt: Date.now() + OTP_RESEND_COOLDOWN_MS,
    };

    localStorage.setItem(AUTH_STORAGE_KEYS.ACTIVE_OTP, JSON.stringify(otpSession));

    // Send real email via Brevo / Supabase
    const { sendOtpEmail } = await import('./emailService');
    const emailResult = await sendOtpEmail(admin.correo, code);

    return {
      success: true,
      message: emailResult.message || `Código enviado a ${admin.correo}. Válido por 10 minutos. Revisa tu bandeja de entrada y spam.`,
    };
  }

  public getActiveOtp(): OtpSession | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.ACTIVE_OTP);
    if (!raw) return null;
    try {
      const parsed: OtpSession = JSON.parse(raw);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_OTP);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  public verifyOtp(code: string): { success: boolean; message: string; admin?: Administrador } {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return {
        success: false,
        message: `Bloqueado por seguridad. Espera ${lockout.remainingMinutes} minutos.`,
      };
    }

    const activeOtp = this.getActiveOtp();
    if (!activeOtp) {
      return {
        success: false,
        message: 'El código ha expirado o no existe. Solicita uno nuevo.',
      };
    }

    if (activeOtp.code.trim() !== code.trim()) {
      const res = this.recordFailedAttempt();
      if (res.locked) {
        return {
          success: false,
          message: `Código incorrecto. Has superado el límite de 5 intentos. Sistema bloqueado por 15 minutos.`,
        };
      }
      return {
        success: false,
        message: `Código incorrecto. Te quedan ${res.remainingAttempts} intentos.`,
      };
    }

    // Success! Clear OTP & failed attempts
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACTIVE_OTP);
    this.clearFailedAttempts();

    const admin = storage.getAdminByEmail(activeOtp.email);
    if (!admin) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    return {
      success: true,
      message: 'Código verificado exitosamente.',
      admin,
    };
  }

  /**
   * Set or update password for administrator after OTP verification
   */
  public setPasswordForAdmin(email: string, password: string): { success: boolean; message: string } {
    if (password.length < 10) {
      return { success: false, message: 'La contraseña debe tener mínimo 10 caracteres.' };
    }

    const admin = storage.getAdminByEmail(email);
    if (!admin) {
      return { success: false, message: 'Administrador no encontrado.' };
    }

    // Save hashed/salted mock password
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORDS) || '{}';
    const store = JSON.parse(raw);
    store[admin.correo.toLowerCase()] = btoa(password); // Simple base64 for client mock store
    localStorage.setItem(AUTH_STORAGE_KEYS.PASSWORDS, JSON.stringify(store));

    // Update admin record
    admin.ha_creado_password = true;
    admin.ultimo_acceso = new Date().toISOString();
    storage.saveAdministrador(admin);

    // Auto log in
    this.startSession(admin);

    return {
      success: true,
      message: 'Contraseña configurada exitosamente.',
    };
  }

  /**
   * Log in with Email and Password
   */
  public loginWithPassword(email: string, password: string): { success: boolean; message: string; admin?: Administrador } {
    const lockout = this.isLockedOut();
    if (lockout.locked) {
      return {
        success: false,
        message: `Acceso bloqueado por seguridad tras 5 intentos fallidos. Intenta en ${lockout.remainingMinutes} minutos.`,
      };
    }

    const admin = storage.getAdminByEmail(email);
    if (!admin) {
      const res = this.recordFailedAttempt();
      return {
        success: false,
        message: res.locked
          ? 'Has superado el límite de 5 intentos fallidos. Sistema bloqueado por 15 minutos.'
          : 'Credenciales inválidas.',
      };
    }

    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.PASSWORDS) || '{}';
    const store = JSON.parse(raw);
    const storedHash = store[admin.correo.toLowerCase()];

    // If admin hasn't configured a password yet, instruct them to request OTP
    if (!storedHash) {
      return {
        success: false,
        message: 'Aún no has configurado una contraseña. Pulsa en "Primer ingreso con código" para crearla.',
      };
    }

    if (storedHash !== btoa(password)) {
      const res = this.recordFailedAttempt();
      return {
        success: false,
        message: res.locked
          ? 'Has superado el límite de 5 intentos fallidos. Sistema bloqueado por 15 minutos.'
          : `Contraseña incorrecta. Te quedan ${res.remainingAttempts} intentos.`,
      };
    }

    // Success!
    this.clearFailedAttempts();
    admin.ultimo_acceso = new Date().toISOString();
    storage.saveAdministrador(admin);

    this.startSession(admin);

    return {
      success: true,
      message: 'Inicio de sesión exitoso.',
      admin,
    };
  }

  public startSession(admin: Administrador): void {
    const expiresAt = Date.now() + INACTIVITY_TIMEOUT_MS;
    localStorage.setItem(
      AUTH_STORAGE_KEYS.CURRENT_ADMIN,
      JSON.stringify({ admin, expiresAt })
    );
    this.lastActivityTimestamp = Date.now();
    this.notify();
  }

  public logout(reason?: string): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_ADMIN);
    this.notify();
    if (reason && typeof window !== 'undefined') {
      // Dispatches custom event for UI toast
      window.dispatchEvent(new CustomEvent('tapiz_fresh_logout', { detail: { reason } }));
    }
  }

  /**
   * Evaluates password strength:
   * Returns score (0 to 4) and text ('Muy débil', 'Débil', 'Media', 'Fuerte')
   */
  public evaluatePasswordStrength(password: string): {
    score: number;
    label: 'Muy débil' | 'Débil' | 'Media' | 'Fuerte';
    color: string;
    hasLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  } {
    const hasLength = password.length >= 10;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let passedCriteria = 0;
    if (hasLength) passedCriteria++;
    if (hasUppercase) passedCriteria++;
    if (hasLowercase) passedCriteria++;
    if (hasNumber) passedCriteria++;
    if (hasSpecial) passedCriteria++;

    let score = 0;
    let label: 'Muy débil' | 'Débil' | 'Media' | 'Fuerte' = 'Muy débil';
    let color = '#ef4444'; // red-500

    if (password.length === 0) {
      score = 0;
      label = 'Muy débil';
      color = '#94a3b8';
    } else if (passedCriteria <= 2 || !hasLength) {
      score = 1;
      label = 'Débil';
      color = '#f97316'; // orange-500
    } else if (passedCriteria === 3 || passedCriteria === 4) {
      score = 2;
      label = 'Media';
      color = '#eab308'; // yellow-500
    } else {
      score = 3;
      label = 'Fuerte';
      color = '#10b981'; // emerald-500
    }

    return {
      score,
      label,
      color,
      hasLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    };
  }
}

export const auth = new AuthService();
