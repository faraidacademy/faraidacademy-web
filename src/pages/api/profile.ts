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
    const requestData = await request.json();

    const name = 'name' in requestData ? requestData.name : locals.name;
    const school = 'school' in requestData ? requestData.school : locals.school;
    const phone = 'phone' in requestData ? requestData.phone : locals.phone;
    const is_participant = 'is_participant' in requestData ? requestData.is_participant : locals.is_participant;
    const is_visible = 'is_visible' in requestData ? requestData.is_visible : locals.is_visible;

    const { error } = await supabase.auth.updateUser({
      data: {
        name: name,
        school: school,
        phone: phone,
        is_participant: is_participant,
        is_visible: is_visible,
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