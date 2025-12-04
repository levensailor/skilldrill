-- Migration: Add interview_question_answers table
-- This migration creates a table to store the candidate's answer notes for each question in each interview
-- Answer notes are per interview/question, not per interviewer

CREATE TABLE IF NOT EXISTS interview_question_answers (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(interview_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_interview_question_answers_interview_id ON interview_question_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_question_answers_question_id ON interview_question_answers(question_id);

CREATE TRIGGER update_interview_question_answers_updated_at BEFORE UPDATE ON interview_question_answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

