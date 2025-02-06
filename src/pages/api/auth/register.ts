// src/pages/api/auth/register.ts
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { AuthError } from "@supabase/supabase-js";

// Helper for auth errors
function handleAuthError(error: AuthError) {
    let errorMessage = "An error occurred during registration.";
    if (error.message.includes("already registered")) {
      errorMessage = "This email address is already registered.";
    } else if (error.message.includes("Password")) {
      errorMessage = "Invalid password. Please choose a stronger password.";
    }
    return new Response(errorMessage, { status: 500 });
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }
  if (password.length < 8) {
    return new Response("Password must be at least 8 characters long", { status: 400 });
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return handleAuthError(error);
  }

  return redirect("/signin");
};