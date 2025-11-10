// env.d.ts
declare namespace App {
  interface Locals {
    email: string;
    name: string;
    avatar_url: string;
    userId: string;
    createdAt: string;
    school: string | undefined;
    phone: string | undefined;
    is_participant: boolean | undefined;
    is_visible: boolean | undefined;
  }
}

// Provide type information for Vite/Astro import.meta.env usage used across the app.
// This prevents TypeScript error: "Property 'env' does not exist on type 'ImportMeta'".
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly SITE?: string;
  // Supabase env variables expected by the app
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  // Optional service role key (DO NOT expose to client)
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  // Allow any other env vars (index signature)
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}