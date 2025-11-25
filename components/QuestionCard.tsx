'use client';

import { useState, useTransition } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import type { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  onUpdate: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function QuestionCard({ question, onUpdate, onDelete }: QuestionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(question.content);
  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    startTransition(async () => {
      await onUpdate(question.id, content);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setContent(question.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this question?')) {
      startTransition(async () => {
        await onDelete(question.id);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
            >
              <FaCheck /> Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center gap-1"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-800">{question.content}</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
            >
              <FaTrash /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

