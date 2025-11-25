'use client';

import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import type { Interview } from '@/lib/types';

interface InterviewCardProps {
  interview: Interview;
}

export default function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <Link href={`/interviews/${interview.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{interview.candidate_name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Created: {new Date(interview.created_at).toLocaleDateString()}
            </p>
          </div>
          <FaArrowRight className="text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

