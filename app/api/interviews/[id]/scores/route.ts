import { NextRequest, NextResponse } from 'next/server';
import { upsertInterviewScore, getInterviewScore } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const interviewId = parseInt(id, 10);

    if (isNaN(interviewId)) {
      return NextResponse.json(
        { error: 'Invalid interview ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { interviewer_id, question_id, score } = body;

    if (!interviewer_id || typeof interviewer_id !== 'number') {
      return NextResponse.json(
        { error: 'Interviewer ID is required' },
        { status: 400 }
      );
    }

    if (!question_id || typeof question_id !== 'number') {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    if (!score || typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'Score must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const interviewScore = await upsertInterviewScore(
      interviewId,
      interviewer_id,
      question_id,
      score
    );
    return NextResponse.json(interviewScore);
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PUT is the same as POST for upsert
  return POST(request, { params });
}

