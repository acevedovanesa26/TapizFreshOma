import { createClient, SupabaseClient } from '@supabase/supabase-js';

let currentUrl =
  (typeof window !== 'undefined' ? localStorage.getItem('tapiz_supabase_url') : '') ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

let currentKey =
  (typeof window !== 'undefined' ? localStorage.getItem('tapiz_supabase_anon_key') : '') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export let supabaseUrl = currentUrl;
export let supabaseAnonKey = currentKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
};

export let supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

type ConfigListener = () => void;
const configListeners: ConfigListener[] = [];

export function subscribeSupabaseConfig(listener: ConfigListener): () => void {
  configListeners.push(listener);
  return () => {
    const idx = configListeners.indexOf(listener);
    if (idx >= 0) configListeners.splice(idx, 1);
  };
}

function notifyConfigChange() {
  configListeners.forEach((l) => {
    try {
      l();
    } catch {}
  });
}

export function saveSupabaseCredentials(url: string, key: string): void {
  currentUrl = url.trim();
  currentKey = key.trim();
  supabaseUrl = currentUrl;
  supabaseAnonKey = currentKey;

  if (typeof window !== 'undefined') {
    localStorage.setItem('tapiz_supabase_url', currentUrl);
    localStorage.setItem('tapiz_supabase_anon_key', currentKey);
  }

  if (isSupabaseConfigured()) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabase = null;
  }

  notifyConfigChange();

  // Also sync to server so all other devices and IPs receive the configuration
  fetch('/api/config', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ supabaseUrl: currentUrl, supabaseAnonKey: currentKey }),
  }).catch((err) => console.warn('Sync to /api/config failed:', err));
}

/**
 * Loads configuration from server (/api/config) so any mobile phone,
 * computer or external IP immediately receives the shared Supabase configuration.
 */
export async function initSupabaseFromServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return false;
    const data = await res.json();

    let updated = false;

    if (data.supabaseUrl && data.supabaseAnonKey && (!supabaseUrl || !supabaseAnonKey)) {
      currentUrl = data.supabaseUrl;
      currentKey = data.supabaseAnonKey;
      supabaseUrl = currentUrl;
      supabaseAnonKey = currentKey;

      if (typeof window !== 'undefined') {
        localStorage.setItem('tapiz_supabase_url', currentUrl);
        localStorage.setItem('tapiz_supabase_anon_key', currentKey);
      }

      if (isSupabaseConfigured()) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        updated = true;
      }
    }

    if (data.brevoSenderEmail && typeof window !== 'undefined') {
      if (!localStorage.getItem('tapiz_brevo_sender_email')) {
        localStorage.setItem('tapiz_brevo_sender_email', data.brevoSenderEmail);
      }
    }

    if (updated) {
      notifyConfigChange();
    }

    return isSupabaseConfigured();
  } catch (e) {
    console.warn('initSupabaseFromServer notice:', e);
    return isSupabaseConfigured();
  }
}
