'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaCheck } from 'react-icons/fa';
import TestCard from '@/components/TestCard';
import type { Test, Category, Question } from '@/lib/types';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [testName, setTestName] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [testsRes, categoriesRes, questionsRes] = await Promise.all([
      fetch('/api/tests'),
      fetch('/api/categories'),
      fetch('/api/questions'),
    ]);
    const testsData = await testsRes.json();
    const categoriesData = await categoriesRes.json();
    const questionsData = await questionsRes.json();
    setTests(testsData);
    setCategories(categoriesData);
    setQuestions(questionsData);
  };

  const handleCreateTest = async () => {
    if (testName.trim() && selectedQuestionIds.length > 0) {
      startTransition(async () => {
        const res = await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: testName.trim(),
            question_ids: selectedQuestionIds,
          }),
        });
        const newTest = await res.json();
        setTests([newTest, ...tests]);
        setTestName('');
        setSelectedQuestionIds([]);
        setIsCreating(false);
      });
    }
  };

  const handleUpdateTest = async (id: number, name: string, questionIds: number[]) => {
    const res = await fetch(`/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, question_ids: questionIds }),
    });
    const updatedTest = await res.json();
    setTests(tests.map((t) => (t.id === id ? updatedTest : t)));
  };

  const handleDeleteTest = async (id: number) => {
    await fetch(`/api/tests/${id}`, {
      method: 'DELETE',
    });
    setTests(tests.filter((t) => t.id !== id));
  };

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Tests</h1>
          <div className="w-24"></div>
        </div>

        {isCreating ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mb-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create New Test</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test name..."
                className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
                autoFocus
              />

              <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Select Questions:</h3>
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available. Create categories and questions first.</p>
                ) : (
                  categories.map((category) => {
                    const categoryQuestions = getQuestionsForCategory(category.id);
                    if (categoryQuestions.length === 0) return null;

                    return (
                      <div key={category.id} className="mb-4">
                        <h4 className="mb-2 border-b pb-1 text-sm font-medium text-gray-800">
                          {category.name}
                        </h4>
                        <div className="ml-4 space-y-2">
                          {categoryQuestions.map((question) => (
                            <label
                              key={question.id}
                              className="flex cursor-pointer items-start gap-2 rounded p-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedQuestionIds.includes(question.id)}
                                onChange={() => toggleQuestion(question.id)}
                                className="mt-1"
                              />
                              <span className="text-sm">{question.content}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateTest}
                  disabled={isPending || !testName.trim() || selectedQuestionIds.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring disabled:opacity-50"
                >
                  <FaCheck /> Create Test
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setTestName('');
                    setSelectedQuestionIds([]);
                  }}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring"
          >
            <FaPlus /> Create New Test
          </button>
        )}

        {tests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No tests yet. Create your first test to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                categories={categories}
                questions={questions}
                onUpdate={handleUpdateTest}
                onDelete={handleDeleteTest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

