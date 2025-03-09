// src/pages/api/profile.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { handleRequestError, handleAuthError } from "../../lib/apiHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { name, school, phone } = await request.json();

    if (typeof name !== 'string' || name.length < 4) {
      return handleRequestError(new Error("Invalid name"), "Name must be at least 4 characters");
    }
    if (typeof school !== 'string' || school.length < 4) {
      return handleRequestError(new Error("Invalid school"), "School must be at least 4 characters");
    }
    if (typeof phone !== 'string' || phone.length < 4) {
      return handleRequestError(new Error("Invalid phone"), "Phone must be at least 4 characters");
    }
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        name: name,
        school: school,
        phone: phone,
      },
    });

    if (error) {
      return handleAuthError(error, "Failed to update profile");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
     return handleRequestError(error, "Invalid request body");
  }
};