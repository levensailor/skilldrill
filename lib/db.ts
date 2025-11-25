import { sql } from '@vercel/postgres';
import type {
  Category,
  Question,
  Test,
  TestQuestion,
  Interview,
  Interviewer,
  InterviewScore,
} from './types';

// Database query functions

export async function getCategories(): Promise<Category[]> {
  const { rows } = await sql<Category>`
    SELECT * FROM categories ORDER BY name ASC
  `;
  return rows;
}

export async function createCategory(name: string): Promise<Category> {
  const { rows } = await sql<Category>`
    INSERT INTO categories (name) VALUES (${name}) RETURNING *
  `;
  return rows[0];
}

export async function getQuestions(categoryId?: number): Promise<Question[]> {
  if (categoryId) {
    const { rows } = await sql<Question>`
      SELECT * FROM questions WHERE category_id = ${categoryId} ORDER BY created_at ASC
    `;
    return rows;
  }
  const { rows } = await sql<Question>`
    SELECT * FROM questions ORDER BY category_id, created_at ASC
  `;
  return rows;
}

export async function getQuestion(id: number): Promise<Question | null> {
  const { rows } = await sql<Question>`
    SELECT * FROM questions WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createQuestion(categoryId: number, content: string): Promise<Question> {
  const { rows } = await sql<Question>`
    INSERT INTO questions (category_id, content) VALUES (${categoryId}, ${content}) RETURNING *
  `;
  return rows[0];
}

export async function updateQuestion(id: number, content: string, categoryId?: number): Promise<Question> {
  if (categoryId !== undefined) {
    const { rows } = await sql<Question>`
      UPDATE questions SET content = ${content}, category_id = ${categoryId} WHERE id = ${id} RETURNING *
    `;
    return rows[0];
  }
  const { rows } = await sql<Question>`
    UPDATE questions SET content = ${content} WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}

export async function deleteQuestion(id: number): Promise<void> {
  await sql`DELETE FROM questions WHERE id = ${id}`;
}

export async function getTests(): Promise<Test[]> {
  const { rows } = await sql<Test>`
    SELECT * FROM tests ORDER BY created_at DESC
  `;
  return rows;
}

export async function getTest(id: number): Promise<Test | null> {
  const { rows } = await sql<Test>`
    SELECT * FROM tests WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createTest(name: string): Promise<Test> {
  const { rows } = await sql<Test>`
    INSERT INTO tests (name) VALUES (${name}) RETURNING *
  `;
  return rows[0];
}

export async function updateTest(id: number, name: string): Promise<Test> {
  const { rows } = await sql<Test>`
    UPDATE tests SET name = ${name} WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}

export async function deleteTest(id: number): Promise<void> {
  await sql`DELETE FROM tests WHERE id = ${id}`;
}

export async function getTestQuestions(testId: number): Promise<TestQuestion[]> {
  const { rows } = await sql<TestQuestion>`
    SELECT * FROM test_questions WHERE test_id = ${testId} ORDER BY order_index ASC
  `;
  return rows;
}

export async function getTestWithQuestions(testId: number): Promise<{ test: Test; questions: Question[] } | null> {
  const test = await getTest(testId);
  if (!test) return null;

  const testQuestions = await getTestQuestions(testId);
  const questionIds = testQuestions.map(tq => tq.question_id);
  
  if (questionIds.length === 0) {
    return { test, questions: [] };
  }

  // Get all questions
  const { rows: allQuestions } = await sql<Question>`
    SELECT * FROM questions WHERE id = ANY(${questionIds})
  `;
  
  // Sort questions according to test_questions order
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  const questions = questionIds
    .map(id => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);
  
  return { test, questions };
}

export async function setTestQuestions(testId: number, questionIds: number[]): Promise<void> {
  // Delete existing test questions
  await sql`DELETE FROM test_questions WHERE test_id = ${testId}`;
  
  // Insert new test questions one by one
  if (questionIds.length > 0) {
    for (let index = 0; index < questionIds.length; index++) {
      await sql`
        INSERT INTO test_questions (test_id, question_id, order_index) 
        VALUES (${testId}, ${questionIds[index]}, ${index})
      `;
    }
  }
}

export async function getInterviews(): Promise<Interview[]> {
  const { rows } = await sql<Interview>`
    SELECT * FROM interviews ORDER BY created_at DESC
  `;
  return rows;
}

export async function getInterview(id: number): Promise<Interview | null> {
  const { rows } = await sql<Interview>`
    SELECT * FROM interviews WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createInterview(testId: number, candidateName: string): Promise<Interview> {
  const { rows } = await sql<Interview>`
    INSERT INTO interviews (test_id, candidate_name) VALUES (${testId}, ${candidateName}) RETURNING *
  `;
  return rows[0];
}

export async function updateInterview(id: number, candidateName?: string): Promise<Interview> {
  if (candidateName !== undefined) {
    const { rows } = await sql<Interview>`
      UPDATE interviews SET candidate_name = ${candidateName} WHERE id = ${id} RETURNING *
    `;
    return rows[0];
  }
  const { rows } = await sql<Interview>`
    SELECT * FROM interviews WHERE id = ${id}
  `;
  return rows[0];
}

export async function getInterviewers(interviewId: number): Promise<Interviewer[]> {
  const { rows } = await sql<Interviewer>`
    SELECT * FROM interviewers WHERE interview_id = ${interviewId} ORDER BY created_at ASC
  `;
  return rows;
}

export async function createInterviewer(interviewId: number, name: string): Promise<Interviewer> {
  const { rows } = await sql<Interviewer>`
    INSERT INTO interviewers (interview_id, name) VALUES (${interviewId}, ${name}) RETURNING *
  `;
  return rows[0];
}

export async function getInterviewScores(interviewId: number): Promise<InterviewScore[]> {
  const { rows } = await sql<InterviewScore>`
    SELECT * FROM interview_scores WHERE interview_id = ${interviewId}
  `;
  return rows;
}

export async function getInterviewScore(
  interviewId: number,
  interviewerId: number,
  questionId: number
): Promise<InterviewScore | null> {
  const { rows } = await sql<InterviewScore>`
    SELECT * FROM interview_scores 
    WHERE interview_id = ${interviewId} 
      AND interviewer_id = ${interviewerId} 
      AND question_id = ${questionId}
  `;
  return rows[0] || null;
}

export async function upsertInterviewScore(
  interviewId: number,
  interviewerId: number,
  questionId: number,
  score: number
): Promise<InterviewScore> {
  const existing = await getInterviewScore(interviewId, interviewerId, questionId);
  
  if (existing) {
    const { rows } = await sql<InterviewScore>`
      UPDATE interview_scores 
      SET score = ${score} 
      WHERE id = ${existing.id} 
      RETURNING *
    `;
    return rows[0];
  } else {
    const { rows } = await sql<InterviewScore>`
      INSERT INTO interview_scores (interview_id, interviewer_id, question_id, score)
      VALUES (${interviewId}, ${interviewerId}, ${questionId}, ${score})
      RETURNING *
    `;
    return rows[0];
  }
}

