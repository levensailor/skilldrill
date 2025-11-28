'use client';

import { useState, useTransition, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import type { Test, Category, Question } from '@/lib/types';

interface TestCardProps {
  test: Test;
  categories: Category[];
  questions: Question[];
  onUpdate: (id: number, name: string, questionIds: number[]) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TestCard({ test, categories, questions, onUpdate, onDelete }: TestCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(test.name);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isEditing) {
      loadTestQuestions();
    }
  }, [isEditing, test.id]);

  const loadTestQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const res = await fetch(`/api/tests/${test.id}?include_questions=true`);
      const data = await res.json();
      if (data.questions) {
        setSelectedQuestionIds(data.questions.map((q: Question) => q.id));
      }
    } catch (error) {
      console.error('Error loading test questions:', error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSave = async () => {
    startTransition(async () => {
      await onUpdate(test.id, name, selectedQuestionIds);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setName(test.name);
    setSelectedQuestionIds([]);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this test?')) {
      startTransition(async () => {
        await onDelete(test.id);
      });
    }
  };

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getQuestionsForCategory = (categoryId: number) => {
    return questions.filter((q) => q.category_id === categoryId);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {isEditing ? (
        <div className="p-4 space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="Test name..."
            autoFocus
          />

          {isLoadingQuestions ? (
            <div className="text-sm text-gray-500">Loading questions...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Select Questions:</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available.</p>
              ) : (
                categories.map((category) => {
                  const categoryQuestions = getQuestionsForCategory(category.id);
                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-4">
                      <h4 className="mb-2 border-b pb-1 text-sm font-medium text-gray-800">
                        {category.name}
                      </h4>
                      <div className="ml-4 space-y-2">
                        {categoryQuestions.map((question) => (
                          <label
                            key={question.id}
                            className="flex cursor-pointer items-start gap-2 rounded p-2 text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedQuestionIds.includes(question.id)}
                              onChange={() => toggleQuestion(question.id)}
                              className="mt-1"
                            />
                            <span className="text-sm">{question.content}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSave}
              disabled={isPending || !name.trim() || selectedQuestionIds.length === 0}
              className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring disabled:opacity-50"
            >
              <FaCheck /> Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring disabled:opacity-50"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring"
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

