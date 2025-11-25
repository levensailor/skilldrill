import { NextRequest, NextResponse } from 'next/server';
import { getInterviews, createInterview } from '@/lib/db';

export async function GET() {
  try {
    const interviews = await getInterviews();
    return NextResponse.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test_id, candidate_name } = body;

    if (!test_id || typeof test_id !== 'number') {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    if (!candidate_name || typeof candidate_name !== 'string' || candidate_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Candidate name is required' },
        { status: 400 }
      );
    }

    const interview = await createInterview(test_id, candidate_name.trim());
    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}

