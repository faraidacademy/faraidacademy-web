// src/pages/api/auth/signin.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const provider = formData.get("provider")?.toString();
  const intent = formData.get("intent")?.toString();

  if (provider) {
    // Derive the callback origin dynamically from the request where possible.
    // This prevents a hardcoded production redirect domain (which caused users
    // to be redirected to the Netlify site even when using a custom domain).
    const originHeader = request.headers.get("origin") || request.headers.get("referer") || "";
    let origin = "";
    if (originHeader) {
      try {
        // If referer/origin contains a full URL, use its origin.
        origin = new URL(originHeader).origin;
      } catch (e) {
        // Fallback: if header isn't a full URL, ignore and fallback below.
        origin = "";
      }
    }

    if (!origin) {
      // Final fallback: use DEV or environment/site defaults.
      origin = import.meta.env.DEV
        ? "http://localhost:4321"
        : (import.meta.env.SITE || "https://faraidacademy.netlify.app");
    }

    let redirectToUrl = `${origin}/api/auth/callback`;
    if (intent === "join_competition") {
      redirectToUrl += "?intent=join_competition";
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectToUrl,
      },
    });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return redirect(data.url);
  }

  return new Response("Provider required", { status: 400 });
};