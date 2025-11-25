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

  const handleUpdateTest = async (id: number, name: string) => {
    const res = await fetch(`/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Test</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Test name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                <h3 className="font-semibold mb-3 text-gray-700">Select Questions:</h3>
                {categories.length === 0 ? (
                  <p className="text-gray-500">No categories available. Create categories and questions first.</p>
                ) : (
                  categories.map((category) => {
                    const categoryQuestions = getQuestionsForCategory(category.id);
                    if (categoryQuestions.length === 0) return null;

                    return (
                      <div key={category.id} className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-2 border-b pb-1">
                          {category.name}
                        </h4>
                        <div className="space-y-2 ml-4">
                          {categoryQuestions.map((question) => (
                            <label
                              key={question.id}
                              className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedQuestionIds.includes(question.id)}
                                onChange={() => toggleQuestion(question.id)}
                                className="mt-1"
                              />
                              <span className="text-sm text-gray-700">{question.content}</span>
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
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
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
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="mb-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-md"
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

