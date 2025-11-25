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
    <div className="mb-2 border border-gray-200 rounded bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-base font-semibold text-gray-800">
          {category.name}
        </h2>
        {isExpanded ? (
          <FaChevronUp className="text-xs text-gray-500" />
        ) : (
          <FaChevronDown className="text-xs text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2 border-t border-gray-200">
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
      )}
    </div>
  );
}

