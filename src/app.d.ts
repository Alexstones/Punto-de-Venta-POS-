// Reemplaza todo el archivo si ya existe
import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      session: Session | null;
    }
    interface PageData {
      session: Session | null;
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {};
