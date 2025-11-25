// TypeScript types matching the database schema

export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Question {
  id: number;
  category_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithCategory extends Question {
  category_name?: string;
}

export interface Test {
  id: number;
  name: string;
  created_at: string;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_id: number;
  order_index: number;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface Interview {
  id: number;
  test_id: number;
  candidate_name: string;
  created_at: string;
  updated_at: string;
}

export interface Interviewer {
  id: number;
  interview_id: number;
  name: string;
  created_at: string;
}

export interface InterviewScore {
  id: number;
  interview_id: number;
  interviewer_id: number;
  question_id: number;
  score: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface InterviewWithDetails extends Interview {
  test?: Test;
  interviewers?: Interviewer[];
  scores?: InterviewScore[];
  questions?: Question[];
}

export interface CreateCategoryInput {
  name: string;
}

export interface CreateQuestionInput {
  category_id: number;
  content: string;
}

export interface UpdateQuestionInput {
  content?: string;
  category_id?: number;
}

export interface CreateTestInput {
  name: string;
  question_ids: number[];
}

export interface UpdateTestInput {
  name?: string;
  question_ids?: number[];
}

export interface CreateInterviewInput {
  test_id: number;
  candidate_name: string;
}

export interface AddInterviewerInput {
  interview_id: number;
  name: string;
}

export interface UpdateScoreInput {
  interview_id: number;
  interviewer_id: number;
  question_id: number;
  score: number; // 1-5
}

