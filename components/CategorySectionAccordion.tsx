'use client';

import { useState, useTransition } from 'react';
import { FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import QuestionCard from './QuestionCard';
import type { Category, Question } from '@/lib/types';

interface CategorySectionAccordionProps {
  category: Category;
  questions: Question[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddQuestion: (categoryId: number, content: string) => Promise<void>;
  onUpdateQuestion: (id: number, content: string) => Promise<void>;
  onDeleteQuestion: (id: number) => Promise<void>;
}

export default function CategorySectionAccordion({
  category,
  questions,
  isExpanded,
  onToggle,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: CategorySectionAccordionProps) {
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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 p-4 text-left text-gray-900 transition hover:bg-gray-100"
      >
        <h2 className="text-base font-medium text-gray-900">
          {category.name}
        </h2>
        <span className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <FaChevronDown className="size-4 text-gray-500" />
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mb-2">
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
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <textarea
                value={newQuestionContent}
                onChange={(e) => setNewQuestionContent(e.target.value)}
                placeholder="Enter question content..."
                className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={2}
                autoFocus
              />
              <div className="mt-2 flex gap-2">
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
      )}
    </div>
  );
}

