// src/lib/apiHelpers.ts
import type { PostgrestError } from "@supabase/supabase-js";

export function handleSupabaseError(error: PostgrestError, message: string) {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      error: message,
      details: error.message, // Include the specific error message
    }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );
}

export function handleCountError(error: any, message: string) {
    console.error(message, error);
    return new Response(
        JSON.stringify({
            error: message,
            details: error.message || "Unknown error",
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
}

export function handleRequestError(error: any, message: string) {
    console.error(message, error);
    return new Response(
        JSON.stringify({
          error: message,
          details: error.message || 'Invalid Request',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }