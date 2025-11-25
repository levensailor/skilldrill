'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaCheck } from 'react-icons/fa';
import InterviewCard from '@/components/InterviewCard';
import type { Interview, Test } from '@/lib/types';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [interviewsRes, testsRes] = await Promise.all([
      fetch('/api/interviews'),
      fetch('/api/tests'),
    ]);
    const interviewsData = await interviewsRes.json();
    const testsData = await testsRes.json();
    setInterviews(interviewsData);
    setTests(testsData);
  };

  const handleCreateInterview = async () => {
    if (candidateName.trim() && selectedTestId) {
      startTransition(async () => {
        const res = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_id: selectedTestId,
            candidate_name: candidateName.trim(),
          }),
        });
        const newInterview = await res.json();
        setInterviews([newInterview, ...interviews]);
        setCandidateName('');
        setSelectedTestId(null);
        setIsCreating(false);
      });
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <div className="w-24"></div>
        </div>

        {isCreating ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Interview</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter candidate name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Test
                </label>
                <select
                  value={selectedTestId || ''}
                  onChange={(e) => setSelectedTestId(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a test...</option>
                  {tests.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateInterview}
                  disabled={isPending || !candidateName.trim() || !selectedTestId}
                  className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaCheck /> Create Interview
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setCandidateName('');
                    setSelectedTestId(null);
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
            className="mb-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 shadow-md"
          >
            <FaPlus /> Create New Interview
          </button>
        )}

        {interviews.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No interviews yet. Create your first interview to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

