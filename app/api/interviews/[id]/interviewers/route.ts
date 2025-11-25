import { NextRequest, NextResponse } from 'next/server';
import { createInterviewer, getInterviewers } from '@/lib/db';

export async function GET(
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

    const interviewers = await getInterviewers(interviewId);
    return NextResponse.json(interviewers);
  } catch (error) {
    console.error('Error fetching interviewers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviewers' },
      { status: 500 }
    );
  }
}

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
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Interviewer name is required' },
        { status: 400 }
      );
    }

    const interviewer = await createInterviewer(interviewId, name.trim());
    return NextResponse.json(interviewer, { status: 201 });
  } catch (error) {
    console.error('Error creating interviewer:', error);
    return NextResponse.json(
      { error: 'Failed to create interviewer' },
      { status: 500 }
    );
  }
}

