import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { createErrorResponse } from "../../lib/helpers";

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from("guestbook")
    .select("*")
    .order("created_at", { ascending: true });

    if (error) {
      return createErrorResponse(error.message, 500);
    }
  
  return new Response(JSON.stringify(data));
};

export const POST: APIRoute = async ({ request }) => {
  const { name, message } = await request.json();
  const { data, error } = await supabase
    .from("guestbook")
    .insert({ name, message })
    .select();

    if (error) {
      return createErrorResponse(error.message, 500);
    }

  return new Response(JSON.stringify(data));
};
