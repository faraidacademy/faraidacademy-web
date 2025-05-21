// src/pages/api/auth/callback.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code");
  const intent = url.searchParams.get("intent"); // intent from URL

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

  // If intent is to join competition, update user metadata
  if (intent === "join_competition" && user) {
    const { error: updateError } = await supabase.auth.updateUser({
      data: { is_participant: true }
    });
    if (updateError) {
      // Log error. The user will still be logged in, might see the WelcomeCompetitionPrompt as a fallback.
      console.error("Failed to auto-set is_participant in callback:", updateError.message);
    }
    // User's session will be updated on the next request by the middleware (checkAndSetSession)
  }

  // Create a new URL object for the /dashboard page
  const redirectUrl = new URL('/dashboard', url.origin);

  // Redirect to the cleaned URL
  return redirect(redirectUrl.toString());
};