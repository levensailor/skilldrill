'use client';

import { useState, useTransition, useEffect } from 'react';
import type { InterviewScore } from '@/lib/types';

interface ScoreEditorProps {
  interviewId: number;
  interviewerId: number;
  questionId: number;
  initialScore: number | null;
  onScoreChange: (interviewId: number, interviewerId: number, questionId: number, score: number) => Promise<void>;
}

export default function ScoreEditor({
  interviewId,
  interviewerId,
  questionId,
  initialScore,
  onScoreChange,
}: ScoreEditorProps) {
  const [score, setScore] = useState<number | null>(initialScore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    startTransition(async () => {
      await onScoreChange(interviewId, interviewerId, questionId, newScore);
    });
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleScoreChange(value)}
          disabled={isPending}
          className={`w-10 h-10 rounded-md font-semibold transition-colors ${
            score === value
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

