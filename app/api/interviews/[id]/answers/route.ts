import { NextRequest, NextResponse } from 'next/server';
import { upsertInterviewQuestionAnswer } from '@/lib/db';

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
    const { question_id, answer_notes } = body;

    if (!question_id || typeof question_id !== 'number') {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    if (answer_notes !== undefined && typeof answer_notes !== 'string' && answer_notes !== null) {
      return NextResponse.json(
        { error: 'Answer notes must be a string or null' },
        { status: 400 }
      );
    }

    const answer = await upsertInterviewQuestionAnswer(
      interviewId,
      question_id,
      answer_notes === null || answer_notes === '' ? null : answer_notes.trim()
    );
    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error updating answer notes:', error);
    return NextResponse.json(
      { error: 'Failed to update answer notes' },
      { status: 500 }
    );
  }
}


