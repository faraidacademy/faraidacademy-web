// src/pages/api/auth/signin.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const provider = formData.get("provider")?.toString();
  const intent = formData.get("intent")?.toString(); // Add this

  if (provider) {
    const baseCallbackUrl = import.meta.env.DEV
      ? "http://localhost:4321/api/auth/callback"
      : "https://faraidacademy.netlify.app/api/auth/callback";

    let redirectToUrl = baseCallbackUrl;
    if (intent === "join_competition") { // Check intent
      redirectToUrl += "?intent=join_competition"; // Append to URL
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectToUrl, // Use the potentially modified URL
      },
    });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return redirect(data.url);
  }

  return new Response("Provider required", { status: 400 });
};