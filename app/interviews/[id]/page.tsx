'use client';

import { useEffect, useState, useTransition, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ScoreEditor from '@/components/ScoreEditor';
import type { Interview, Interviewer, Question, InterviewScore, Test, InterviewQuestionAnswer, Category } from '@/lib/types';

interface InterviewWithDetails extends Interview {
  interviewers: Interviewer[];
  scores: InterviewScore[];
  questions: Question[];
  test: Test;
  answers?: InterviewQuestionAnswer[];
}

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = parseInt(params.id as string, 10);
  
  const [interview, setInterview] = useState<InterviewWithDetails | null>(null);
  const [isAddingInterviewer, setIsAddingInterviewer] = useState(false);
  const [newInterviewerName, setNewInterviewerName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [answerNotes, setAnswerNotes] = useState<Record<number, string>>({});
  const [savingAnswers, setSavingAnswers] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<string>('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isNaN(interviewId)) {
      loadInterview();
      loadCategories();
    }
  }, [interviewId]);

  const loadCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const loadInterview = async () => {
    const res = await fetch(`/api/interviews/${interviewId}`);
    const data = await res.json();
    setInterview(data);
    setFeedback(data.feedback || '');
    
    // Initialize answer notes from loaded data
    if (data.answers) {
      const notesMap: Record<number, string> = {};
      data.answers.forEach((answer: InterviewQuestionAnswer) => {
        notesMap[answer.question_id] = answer.answer_notes || '';
      });
      setAnswerNotes(notesMap);
    }
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

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAnswerNotesChange = (questionId: number, notes: string) => {
    setAnswerNotes((prev) => ({
      ...prev,
      [questionId]: notes,
    }));
  };

  const handleSaveAnswerNotes = async (questionId: number) => {
    setSavingAnswers((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch(`/api/interviews/${interviewId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer_notes: answerNotes[questionId] || null,
        }),
      });
      if (res.ok) {
        // Reload interview to get updated answers
        await loadInterview();
      }
    } catch (error) {
      console.error('Error saving answer notes:', error);
    } finally {
      setSavingAnswers((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const getAnswerNotes = (questionId: number): string => {
    return answerNotes[questionId] || '';
  };

  const handleSaveFeedback = async () => {
    setSavingFeedback(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback.trim() || null }),
      });
      if (res.ok) {
        await loadInterview();
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    } finally {
      setSavingFeedback(false);
    }
  };

  const calculateCategoryAverages = () => {
    if (!interview || !categories.length) return {};

    const categoryScores: Record<number, number[]> = {};
    
    // Initialize category scores
    categories.forEach(cat => {
      categoryScores[cat.id] = [];
    });

    // Collect all scores for each category
    interview.questions.forEach(question => {
      const questionScores = interview.scores
        .filter(score => score.question_id === question.id)
        .map(score => score.score);
      
      if (questionScores.length > 0) {
        categoryScores[question.category_id] = [
          ...categoryScores[question.category_id],
          ...questionScores
        ];
      }
    });

    // Calculate averages
    const averages: Record<number, number> = {};
    Object.keys(categoryScores).forEach(catId => {
      const scores = categoryScores[parseInt(catId)];
      if (scores.length > 0) {
        averages[parseInt(catId)] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });

    return averages;
  };

  const calculateOverallAverage = (): number | null => {
    if (!interview || interview.scores.length === 0) return null;
    const total = interview.scores.reduce((sum, score) => sum + score.score, 0);
    return total / interview.scores.length;
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

        {/* Test Info, Feedback, and Score Summary in a single row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Test Info Column */}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Test: {interview.test.name}</h2>
            <p className="text-xs text-gray-500">
              Created: {new Date(interview.created_at).toLocaleString()}
            </p>
          </div>

          {/* Feedback Section Column */}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Summary Feedback</h2>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter summary feedback..."
              className="w-full rounded-lg border-gray-200 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveFeedback}
                disabled={savingFeedback}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
              >
                {savingFeedback ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Score Summary Column */}
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Score Summary</h2>
            <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
              {categories.map(category => {
                const categoryAverages = calculateCategoryAverages();
                const avg = categoryAverages[category.id];
                const categoryQuestions = interview.questions.filter(q => q.category_id === category.id);
                
                if (categoryQuestions.length === 0) return null;

                return (
                  <div key={category.id} className="border border-gray-200 rounded p-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm">{category.name}</span>
                      {avg !== undefined ? (
                        <span className="text-base font-semibold text-gray-900">
                          {avg.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No scores</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {categoryQuestions.length} question{categoryQuestions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-800">Overall</span>
                {calculateOverallAverage() !== null ? (
                  <span className="text-xl font-bold text-purple-600">
                    {calculateOverallAverage()!.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">No scores</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">

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
                  {interview.questions.map((question, index) => {
                    const isExpanded = expandedQuestions.has(question.id);
                    return (
                      <Fragment key={question.id}>
                        <tr 
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleQuestion(question.id)}
                        >
                          <td className="py-4 px-4 text-gray-800">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <FaChevronUp className="text-gray-400" />
                              ) : (
                                <FaChevronDown className="text-gray-400" />
                              )}
                              <div>
                                <div className="font-medium mb-1">Q{index + 1}</div>
                                <div className="text-sm">{question.content}</div>
                              </div>
                            </div>
                          </td>
                          {interview.interviewers.map((interviewer) => (
                            <td key={interviewer.id} className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                        {isExpanded && (
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <td colSpan={interview.interviewers.length + 1} className="py-4 px-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">Question Notes</h4>
                                  <div className="bg-white rounded-lg border border-gray-200 p-3 min-h-[150px]">
                                    {question.notes ? (
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{question.notes}</p>
                                    ) : (
                                      <p className="text-sm text-gray-400 italic">No notes available for this question.</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-700 mb-2">Candidate Answer</h4>
                                  <div className="space-y-2">
                                    <textarea
                                      value={getAnswerNotes(question.id)}
                                      onChange={(e) => handleAnswerNotesChange(question.id, e.target.value)}
                                      placeholder="Enter the candidate's answer to this question..."
                                      className="w-full rounded-lg border-gray-200 p-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[150px]"
                                      rows={6}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveAnswerNotes(question.id);
                                        }}
                                        disabled={savingAnswers[question.id]}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring disabled:opacity-50"
                                      >
                                        {savingAnswers[question.id] ? 'Saving...' : 'Save Answer'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

