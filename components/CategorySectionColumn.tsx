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
      <h2 className="text-base font-semibold text-gray-800 mb-2 pb-1 border-b border-gray-300">
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
        <div className="bg-gray-50 rounded p-2 border border-dashed border-gray-300">
          <textarea
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            placeholder="Enter question content..."
            className="w-full p-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent mb-1.5"
            rows={2}
            autoFocus
          />
          <div className="flex gap-1">
            <button
              onClick={handleAddQuestion}
              disabled={isPending || !newQuestionContent.trim()}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
            >
              <FaPlus className="text-xs" /> Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewQuestionContent('');
              }}
              disabled={isPending}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-dashed border-gray-300 flex items-center justify-center gap-1 transition-colors"
        >
          <FaPlus className="text-xs" /> Add Question
        </button>
      )}
    </div>
  );
}

