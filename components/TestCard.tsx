'use client';

import { useState, useTransition } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import type { Test } from '@/lib/types';

interface TestCardProps {
  test: Test;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function TestCard({ test, onUpdate, onDelete }: TestCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(test.name);
  const [isPending, startTransition] = useTransition();

  const handleSave = async () => {
    startTransition(async () => {
      await onUpdate(test.id, name);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setName(test.name);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this test?')) {
      startTransition(async () => {
        await onDelete(test.id);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">{test.name}</h3>
          <div className="flex gap-2">
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

