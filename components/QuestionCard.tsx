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
    <div className="bg-white rounded shadow-sm p-2 border border-gray-200 hover:shadow transition-shadow">
      {isEditing ? (
        <div className="space-y-1.5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            autoFocus
          />
          <div className="flex gap-1 justify-end">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
              title="Save"
            >
              <FaCheck className="text-xs" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center"
              title="Cancel"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-sm text-gray-800 leading-snug">{question.content}</p>
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
              title="Edit"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
              title="Delete"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

