'use client';

import { useState, useTransition } from 'react';
import { FaPlus } from 'react-icons/fa';
import QuestionCard from './QuestionCard';
import type { Category, Question } from '@/lib/types';

interface CategorySectionColumnProps {
  category: Category;
  questions: Question[];
  onAddQuestion: (categoryId: number, content: string) => Promise<void>;
  onUpdateQuestion: (id: number, content: string) => Promise<void>;
  onDeleteQuestion: (id: number) => Promise<void>;
}

export default function CategorySectionColumn({
  category,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: CategorySectionColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestionContent, setNewQuestionContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleAddQuestion = async () => {
    if (newQuestionContent.trim()) {
      startTransition(async () => {
        await onAddQuestion(category.id, newQuestionContent.trim());
        setNewQuestionContent('');
        setIsAdding(false);
      });
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {category.name}
      </h2>
      
      <div className="max-h-[280px] overflow-y-auto mb-2 space-y-2 pr-1">
        {questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            onUpdate={onUpdateQuestion}
            onDelete={onDeleteQuestion}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
          <textarea
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            placeholder="Enter question content..."
            className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-2"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddQuestion}
              disabled={isPending || !newQuestionContent.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
            >
              <FaPlus className="text-xs" /> Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewQuestionContent('');
              }}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <FaPlus className="text-xs" /> Add Question
        </button>
      )}
    </div>
  );
}

