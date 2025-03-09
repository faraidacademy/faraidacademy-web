// src/types.ts
export interface Question {
  id: number;
  question: string;
  money: number | null;
  case: string | null;
}

export interface Answer {
  id: number;
  question_id: number;
  answer: number;
}