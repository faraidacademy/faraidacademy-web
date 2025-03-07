 // src/pages/api/answers.ts
 import type { APIRoute } from "astro";
 import { supabase } from "../../lib/supabase";

 export const POST: APIRoute = async ({ request, locals, redirect }) => {
 console.log("API Route /api/answers: locals:", locals); // Keep this log
 // Authentication Check (handled by middleware, but good to double-check)
 if (!locals.userId) {
     return new Response(JSON.stringify({ error: "Unauthorized" }), {
     status: 401,
     headers: { 'Content-Type': 'application/json' }
     });
 }

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
     console.error("Supabase error:", error);
     return new Response(
         JSON.stringify({ error: "Failed to save answer" }),
         { status: 500, headers: { 'Content-Type': 'application/json' } },
     );
     }

     return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
 } catch (error) {
     console.error("Request error:", error);
     return new Response(
     JSON.stringify({ error: "Invalid request body" }),
     { status: 400, headers: { 'Content-Type': 'application/json' } },
     );
 }
 };