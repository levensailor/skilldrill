'use client';

import { useState, useTransition } from 'react';
import { FaPlus } from 'react-icons/fa';
import QuestionCard from './QuestionCard';
import type { Category, Question } from '@/lib/types';

interface CategorySectionProps {
  category: Category;
  questions: Question[];
  onAddQuestion: (categoryId: number, content: string) => Promise<void>;
  onUpdateQuestion: (id: number, content: string) => Promise<void>;
  onDeleteQuestion: (id: number) => Promise<void>;
}

export default function CategorySection({
  category,
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: CategorySectionProps) {
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
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-300">
        {category.name}
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <textarea
            value={newQuestionContent}
            onChange={(e) => setNewQuestionContent(e.target.value)}
            placeholder="Enter question content..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddQuestion}
              disabled={isPending || !newQuestionContent.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <FaPlus /> Add Question
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewQuestionContent('');
              }}
              disabled={isPending}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 transition-colors"
        >
          <FaPlus /> Add New Question
        </button>
      )}
    </div>
  );
}

