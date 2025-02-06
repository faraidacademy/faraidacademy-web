// src/pages/api/auth/signin.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { Provider, AuthError } from "@supabase/supabase-js";
import { setAuthCookies } from "../../../lib/auth"; // Import

function handleAuthError(error: AuthError) {
    return new Response(error.message, { status: 500 });
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const provider = formData.get("provider")?.toString();

  if (provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: import.meta.env.DEV
          ? "http://localhost:4321/api/auth/callback"
          : "https://faraidacademy.netlify.app/api/auth/callback",
      },
    });

    if (error) {
      return handleAuthError(error);
    }

    return redirect(data.url);
  }

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
     return handleAuthError(error)
  }

  const { access_token, refresh_token } = data.session;
  setAuthCookies(cookies, access_token, refresh_token); // Use helper
  return redirect("/dashboard");
};