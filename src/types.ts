// src/types.ts
export interface Question {
  id: number;
  question: string;
  fraction: string | null;
  money: number | null;
  case: string | null;
  type: string | null;
  order: number | null;
  correctAnswerId?: number | null;
}

export interface Answer {
  id: number;
  question_id: number;
  answer: number;
  is_correct: boolean;
}