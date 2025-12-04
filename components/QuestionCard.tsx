'use client';

import { useState, useTransition, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaStickyNote } from 'react-icons/fa';
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
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(question.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(question.notes || '');
  }, [question.notes]);

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

  const handleToggleNotes = () => {
    setShowNotes(!showNotes);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || null }),
      });
      if (res.ok) {
        const updatedQuestion = await res.json();
        // Update local state with the response
        setNotes(updatedQuestion.notes || '');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {isEditing ? (
        <div className="p-3 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={2}
            autoFocus
          />
          <div className="flex gap-1 justify-end">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700 focus:outline-none focus:ring disabled:opacity-50"
              title="Save"
            >
              <FaCheck className="text-xs" />
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring disabled:opacity-50"
              title="Cancel"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-2">
          <p className="text-sm text-gray-700 leading-snug">{question.content}</p>
          {showNotes && (
            <div className="mt-2 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this question..."
                className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex gap-1 justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="inline-flex items-center justify-center rounded-lg bg-green-600 px-2 py-1 text-xs text-white transition hover:bg-green-700 focus:outline-none focus:ring disabled:opacity-50"
                  title="Save Notes"
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-1 justify-end">
            <button
              onClick={handleToggleNotes}
              className={`inline-flex items-center justify-center rounded-lg p-1.5 text-white transition focus:outline-none focus:ring ${
                notes ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title="Notes"
            >
              <FaStickyNote className="text-xs" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-1.5 text-white transition hover:bg-blue-700 focus:outline-none focus:ring"
              title="Edit"
            >
              <FaEdit className="text-xs" />
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 p-1.5 text-white transition hover:bg-red-700 focus:outline-none focus:ring"
              title="Delete"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

