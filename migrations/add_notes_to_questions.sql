-- Migration: Add notes column to questions table
-- This migration adds an optional notes field to store additional information about questions

ALTER TABLE questions ADD COLUMN IF NOT EXISTS notes TEXT;

