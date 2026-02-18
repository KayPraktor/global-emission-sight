/**
 * @file Supabase Client Wrapper
 * @description Thin re-export of the auto-generated Supabase client.
 *
 * **Current state (Lovable Cloud):**
 * The client at `@/integrations/supabase/client` is auto-generated and reads
 * `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `import.meta.env`.
 * Do NOT edit that file directly — Lovable Cloud regenerates it on every deploy.
 *
 * **Post-migration (standalone Vite / Next.js / Node):**
 * Replace the re-export below with a direct `createClient` call:
 *
 * ```ts
 * import { createClient } from '@supabase/supabase-js';
 * import type { Database } from '@/integrations/supabase/types';
 *
 * export const supabase = createClient<Database>(
 *   process.env.VITE_SUPABASE_URL!,
 *   process.env.VITE_SUPABASE_ANON_KEY!,
 *   {
 *     auth: {
 *       storage: typeof window !== 'undefined' ? localStorage : undefined,
 *       persistSession: true,
 *       autoRefreshToken: true,
 *     },
 *   }
 * );
 * ```
 *
 * @env VITE_SUPABASE_URL       — Project URL (e.g. https://<ref>.supabase.co)
 * @env VITE_SUPABASE_ANON_KEY  — Publishable anon key (safe for client-side)
 */
export { supabase } from '@/integrations/supabase/client';
