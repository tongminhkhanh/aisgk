
export type Tab = 'question_generator' | 'product_feedback' | 'text_question_generator';

export interface Student {
  id: number;
  name: string;
  class: string;
  comment: string;
  score?: number;
  rank?: 'C' | 'H';
}

export interface GeneratedProductFeedback {
  general: string;
  strengths: string;
  suggestions: string;
  encouragement: string;
}

export interface GeneratedQuestion {
    type: 'multiple_choice' | 'essay';
    question: string;
    options?: string[];
    correctAnswer?: string;
}

export interface GeneratedTextQuestionResponse {
  summary: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestionLevel {
    levelName: string;
    questions: GeneratedQuestion[];
}

export interface QuestionCounts {
  [key: string]: {
    mcq: number;
    essay: number;
  };
}

export const TABS: { id: Tab; label: string }[] = [
  { id: 'question_generator', label: 'Tạo câu hỏi từ SGK' },
  { id: 'product_feedback', label: 'Nhận xét sản phẩm' },
  { id: 'text_question_generator', label: 'Tạo câu hỏi từ Văn bản' },
];
