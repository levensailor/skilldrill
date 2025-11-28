'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import CategorySectionAccordion from '@/components/CategorySectionAccordion';
import type { Category, Question } from '@/lib/types';

export default function QuestionsAccordionPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Set first category as expanded when categories are loaded
    if (categories.length > 0 && expandedCategoryId === null) {
      setExpandedCategoryId(categories[0].id);
    }
  }, [categories, expandedCategoryId]);

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
        // Expand the newly created category
        setExpandedCategoryId(newCategory.id);
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

  const handleToggleCategory = (categoryId: number) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  const getQuestionsForCategory = (categoryId: number) => {
    return questions.filter((q) => q.category_id === categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 py-3">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="text-xs" /> Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Questions (Accordion)</h1>
          <div className="w-16"></div>
        </div>

        {isAddingCategory ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-3">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Create New Category</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
              >
                <FaPlus className="text-xs" /> Create
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="mb-3 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring"
          >
            <FaPlus className="text-xs" /> Create Category
          </button>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No categories yet. Create your first category to get started!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {categories.map((category) => (
              <CategorySectionAccordion
                key={category.id}
                category={category}
                questions={getQuestionsForCategory(category.id)}
                isExpanded={expandedCategoryId === category.id}
                onToggle={() => handleToggleCategory(category.id)}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

