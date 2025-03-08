// src/pages/api/questions.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
// import type { PostgrestError } from "@supabase/supabase-js"; // No longer needed
import { handleSupabaseError } from "../../lib/apiHelpers"; // Import the helper

// function handleSupabaseError(error: PostgrestError) { ... } // DELETE THIS

export const GET: APIRoute = async () => {
    const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .order("order", { ascending: true });

    if (questionsError) return handleSupabaseError(questionsError, "Error fetching questions"); // Use the helper

    const { data: allAnswers, error: answersError } = await supabase
        .from("answers")
        .select("id, question_id, is_correct");

    if (answersError) return handleSupabaseError(answersError, "Error fetching answers");

    const correctAnswerMap = new Map<number, number>();
    allAnswers?.forEach((answer) => {
        if (answer.is_correct) correctAnswerMap.set(answer.question_id, answer.id);
    });

    const questionsWithAnswers = questions.map((question) => ({
        ...question,
        correctAnswerId: correctAnswerMap.get(question.id) ?? null,
    }));

    return new Response(JSON.stringify(questionsWithAnswers));
};

export const POST: APIRoute = async () => {
    return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Allow": "GET" } }
    );
}