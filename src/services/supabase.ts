import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Also support saving credentials directly from Admin Settings
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('tapiz_supabase_url') || '' : '';
const localKey = typeof window !== 'undefined' ? localStorage.getItem('tapiz_supabase_anon_key') || '' : '';

export const supabaseUrl = envUrl || localUrl;
export const supabaseAnonKey = envKey || localKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function saveSupabaseCredentials(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tapiz_supabase_url', url.trim());
    localStorage.setItem('tapiz_supabase_anon_key', key.trim());
  }
}
