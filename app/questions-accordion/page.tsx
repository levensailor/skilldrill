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
          <div className="bg-white rounded shadow-sm p-2 mb-3">
            <h2 className="text-sm font-semibold mb-2">Create New Category</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
              >
                <FaPlus className="text-xs" /> Create
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
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
            onClick={() => setIsAddingCategory(true)}
            className="mb-3 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
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

