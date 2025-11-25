'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import CategorySection from '@/components/CategorySection';
import type { Category, Question } from '@/lib/types';

export default function QuestionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [categoriesRes, questionsRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/questions'),
    ]);
    const categoriesData = await categoriesRes.json();
    const questionsData = await questionsRes.json();
    setCategories(categoriesData);
    setQuestions(questionsData);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      startTransition(async () => {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });
        const newCategory = await res.json();
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setIsAddingCategory(false);
      });
    }
  };

  const handleAddQuestion = async (categoryId: number, content: string) => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: categoryId, content }),
    });
    const newQuestion = await res.json();
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = async (id: number, content: string) => {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const updatedQuestion = await res.json();
    setQuestions(questions.map((q) => (q.id === id ? updatedQuestion : q)));
  };

  const handleDeleteQuestion = async (id: number) => {
    await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    });
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const getQuestionsForCategory = (categoryId: number) => {
    return questions.filter((q) => q.category_id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <div className="w-24"></div>
        </div>

        {isAddingCategory ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }
                }}
              />
              <button
                onClick={handleAddCategory}
                disabled={isPending || !newCategoryName.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <FaPlus /> Create
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                disabled={isPending}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 shadow-md"
          >
            <FaPlus /> Create New Category
          </button>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No categories yet. Create your first category to get started!</p>
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              questions={getQuestionsForCategory(category.id)}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          ))
        )}
      </div>
    </div>
  );
}

