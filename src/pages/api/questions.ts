// src/pages/api/questions.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

// Helper function to handle Supabase errors
function handleSupabaseError(error: PostgrestError) {
  return new Response(
    JSON.stringify({
      error: error.message,
    }),
    { status: 500 },
  );
}

// GET /api/questions - Fetch all questions with correct answer IDs
export const GET: APIRoute = async () => {
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .order("order", { ascending: true }); // Use the "order" column

  if (questionsError) {
    return handleSupabaseError(questionsError);
  }

    // Fetch all answers in one go (more efficient than per-question)
    const { data: allAnswers, error: answersError } = await supabase
      .from('answers')
      .select('id, question_id, is_correct');

    if (answersError) {
        return handleSupabaseError(answersError);
    }

    // Create a map of question ID to correct answer ID.  This is highly efficient.
    const correctAnswerMap = new Map<number, number>();
      allAnswers?.forEach(answer => {
          if (answer.is_correct) {
              correctAnswerMap.set(answer.question_id, answer.id);
        }
      });


    // Augment the questions data with the correct answer ID.
    const questionsWithAnswers = questions.map((question) => {
        const correctAnswerId = correctAnswerMap.get(question.id);
        return {
            ...question,
            correctAnswerId: correctAnswerId ?? null, // Use null if no correct answer is found (shouldn't happen, but good practice)
        };
    });


    return new Response(JSON.stringify(questionsWithAnswers));
};

// POST /api/questions - Add a new question (and optionally its answers)
export const POST: APIRoute = async ({ request }) => {
    const { question, fraction, money, case: caseValue, type, order, answers } = await request.json();

  // --- Input Validation (Crucial!) ---
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Question text is required and must be a non-empty string." }), { status: 400 });
  }
  if (fraction && (typeof fraction !== 'string' || fraction.trim().length === 0)) {
      return new Response(JSON.stringify({ error: "If fraction is provided, it must be a non-empty string." }), { status: 400 });
  }
  if (money && typeof money !== 'number') {
      return new Response(JSON.stringify({ error: "If money is provided, it must be a number." }), { status: 400 });
  }
    if (caseValue && (typeof caseValue !== 'string' || caseValue.trim().length === 0)) {
        return new Response(JSON.stringify({ error: "If 'case' is provided, it must be a non-empty string." }), { status: 400 });
    }
    if (type && (typeof type !== 'string' || !['regular', 'special'].includes(type))) {
    return new Response(JSON.stringify({ error: "If type is provided, it must be 'regular' or 'special'." }), { status: 400 });
  }
    if (order && typeof order !== 'number') {
        return new Response(JSON.stringify({ error: "If order is provided, it must be a number." }), { status: 400 });
    }
  if (answers && !Array.isArray(answers)) {
    return new Response(JSON.stringify({ error: "If answers are provided, they must be an array." }), { status: 400 });
  }
    if (answers) {
        for (const answer of answers) {
            if (!answer.answer || typeof answer.answer !== 'string' || answer.answer.trim().length === 0) {
                return new Response(JSON.stringify({ error: "Each answer must have a non-empty string 'answer' property." }), { status: 400 });
            }
            if (typeof answer.is_correct !== 'boolean') {
                return new Response(JSON.stringify({ error: "Each answer must have a boolean 'is_correct' property." }), { status: 400 });
            }
        }
    }

    // --- Insert the Question ---
  const { data: newQuestion, error: questionInsertError } = await supabase
    .from("questions")
    .insert({ question, fraction, money, case: caseValue, type, order })
        .select();


  if (questionInsertError) {
    return handleSupabaseError(questionInsertError);
  }

    // --- Insert Answers (if provided) ---
    if (answers && answers.length > 0) {
      // Add question_id to each answer
        const questionId = newQuestion[0].id;
        const answersWithQuestionId = answers.map((answer: { answer: string, is_correct: boolean }) => ({
            ...answer,
            question_id: questionId,
        }));

        const { error: answersInsertError } = await supabase
          .from('answers')
          .insert(answersWithQuestionId)
          .select();

        if (answersInsertError) {
            //  Rollback question insertion if answer insertion fails
            await supabase.from('questions').delete().eq('id', questionId);
            return handleSupabaseError(answersInsertError);
        }
    }


  return new Response(JSON.stringify(newQuestion), {status: 201});
};