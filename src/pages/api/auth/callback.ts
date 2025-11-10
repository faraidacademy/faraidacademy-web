// src/pages/api/auth/callback.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");
  // intent handling has been removed to require explicit user consent (join action)

  if (!authCode) {
    return new Response("No code provided", { status: 400 });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const { access_token, refresh_token, user } = data.session;

  cookies.set("sb-access-token", access_token, {
    path: "/",
    secure: !import.meta.env.DEV, // only in production
    httpOnly: true,
    sameSite: "lax", // 'lax' or 'strict' based on your needs
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    secure: !import.meta.env.DEV, // only in production
    httpOnly: true,
    sameSite: "lax", // 'lax' or 'strict'
  });

  // NOTE: We intentionally do not auto-enroll users via callback. Joining the competition
  // must be an explicit action taken on the dashboard (WelcomeCompetitionPrompt).

  // Create a new URL object for the /dashboard page
  const redirectUrl = new URL('/dashboard', url.origin);

  // Redirect to the cleaned URL
  return redirect(redirectUrl.toString());
};