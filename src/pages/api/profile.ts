// src/pages/api/profile.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { handleRequestError, handleAuthError } from "../../lib/apiHelpers";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const requestData = await request.json();
    const updateData: { [key: string]: any } = {};
    if ('name' in requestData) updateData.name = requestData.name;
    if ('school' in requestData) updateData.school = requestData.school;
    if ('phone' in requestData) updateData.phone = requestData.phone;
    if ('is_participant' in requestData) updateData.is_participant = requestData.is_participant;
    if ('is_visible' in requestData) updateData.is_visible = requestData.is_visible;

    if (Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ message: "No data provided to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase.auth.updateUser({
      data: updateData,
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