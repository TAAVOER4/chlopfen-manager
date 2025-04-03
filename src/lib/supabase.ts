
import { createClient } from '@supabase/supabase-js';

// Use the configuration from .env.local if available, otherwise use direct values
// These values are automatically injected by Lovable when connected to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Make sure you have connected your Supabase project in Lovable.');
  // Instead of throwing an error which breaks the app, we'll create a dummy client
  // that will gracefully fail but allow the app to load
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
