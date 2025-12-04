-- Migration: Add feedback column to interviews table
-- This migration adds a field to store summary feedback for the interview

ALTER TABLE interviews ADD COLUMN IF NOT EXISTS feedback TEXT;

