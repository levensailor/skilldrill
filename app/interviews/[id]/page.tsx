'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import ScoreEditor from '@/components/ScoreEditor';
import type { Interview, Interviewer, Question, InterviewScore, Test } from '@/lib/types';

interface InterviewWithDetails extends Interview {
  interviewers: Interviewer[];
  scores: InterviewScore[];
  questions: Question[];
  test: Test;
}

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = parseInt(params.id as string, 10);
  
  const [interview, setInterview] = useState<InterviewWithDetails | null>(null);
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [newInterviewerName, setNewInterviewerName] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isNaN(interviewId)) {
      loadInterview();
    }
  }, [interviewId]);

  const loadInterview = async () => {
    const res = await fetch(`/api/interviews/${interviewId}`);
    const data = await res.json();
    setInterview(data);
  };

  const handleAddInterviewer = async () => {
    if (newInterviewerName.trim()) {
      startTransition(async () => {
        const res = await fetch(`/api/interviews/${interviewId}/interviewers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newInterviewerName.trim() }),
        });
        const newInterviewer = await res.json();
        if (interview) {
          setInterview({
            ...interview,
            interviewers: [...interview.interviewers, newInterviewer],
          });
        }
        setNewInterviewerName('');
        setIsAddingInterviewer(false);
      });
    }
  };

  const handleScoreChange = async (
    interviewId: number,
    interviewerId: number,
    questionId: number,
    score: number
  ) => {
    await fetch(`/api/interviews/${interviewId}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewer_id: interviewerId,
        question_id: questionId,
        score,
      }),
    });
    
    // Reload interview to get updated scores
    await loadInterview();
  };

  const getScore = (interviewerId: number, questionId: number): number | null => {
    if (!interview) return null;
    const score = interview.scores.find(
      (s) => s.interviewer_id === interviewerId && s.question_id === questionId
    );
    return score ? score.score : null;
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/interviews"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft /> Back to Interviews
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Interview: {interview.candidate_name}</h1>
          <div className="w-32"></div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Test: {interview.test.name}</h2>
            <p className="text-sm text-gray-500">
              Created: {new Date(interview.created_at).toLocaleString()}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Interviewers</h3>
            {isAddingInterviewer ? (
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={newInterviewerName}
                  onChange={(e) => setNewInterviewerName(e.target.value)}
                  placeholder="Interviewer name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddInterviewer();
                    if (e.key === 'Escape') {
                      setIsAddingInterviewer(false);
                      setNewInterviewerName('');
                    }
                  }}
                />
                <button
                  onClick={handleAddInterviewer}
                  disabled={isPending || !newInterviewerName.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaPlus /> Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingInterviewer(false);
                    setNewInterviewerName('');
                  }}
                  disabled={isPending}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingInterviewer(true)}
                className="mb-3 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
              >
                <FaPlus /> Add Interviewer
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              {interview.interviewers.map((interviewer) => (
                <span
                  key={interviewer.id}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {interviewer.name}
                </span>
              ))}
            </div>
          </div>

          {interview.interviewers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Add at least one interviewer to start scoring questions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Question</th>
                    {interview.interviewers.map((interviewer) => (
                      <th
                        key={interviewer.id}
                        className="text-center py-3 px-4 font-semibold text-gray-700 min-w-[200px]"
                      >
                        {interviewer.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interview.questions.map((question, index) => (
                    <tr key={question.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4 text-gray-800">
                        <div className="font-medium mb-1">Q{index + 1}</div>
                        <div className="text-sm">{question.content}</div>
                      </td>
                      {interview.interviewers.map((interviewer) => (
                        <td key={interviewer.id} className="py-4 px-4 text-center">
                          <ScoreEditor
                            interviewId={interviewId}
                            interviewerId={interviewer.id}
                            questionId={question.id}
                            initialScore={getScore(interviewer.id, question.id)}
                            onScoreChange={handleScoreChange}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

