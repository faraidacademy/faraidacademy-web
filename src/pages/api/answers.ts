// src/pages/api/answers.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import { handleSupabaseError, handleRequestError } from "../../lib/apiHelpers";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  console.log("API Route /api/answers: locals:", locals); // Keep this log

  try {
    const { questionId, answerId } = await request.json();

    // Validate input (important for security and data integrity)
    if (!questionId || (answerId === undefined)) {
      return new Response(
        JSON.stringify({ error: "questionId and answerId are required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Use upsert to insert or update the result
    const { error } = await supabase
      .from("results")
      .upsert(
        {
          user_id: locals.userId,
          question_id: questionId,
          answer_id: answerId,
        },
        { onConflict: 'user_id,question_id' }
      )
      .select();

    if (error) {
      return handleSupabaseError(error, "Failed to save answer"); // Use the helper
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return handleRequestError(error, "Invalid request body"); // Use new helper
  }
};