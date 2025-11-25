import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview, getInterviewers, getInterviewScores, getTestWithQuestions } from '@/lib/db';

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

    const interview = await getInterview(interviewId);
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Fetch related data
    const [interviewers, scores, testData] = await Promise.all([
      getInterviewers(interviewId),
      getInterviewScores(interviewId),
      getTestWithQuestions(interview.test_id),
    ]);

    return NextResponse.json({
      ...interview,
      interviewers,
      scores,
      test: testData?.test,
      questions: testData?.questions || [],
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { candidate_name } = body;

    if (candidate_name !== undefined) {
      if (typeof candidate_name !== 'string' || candidate_name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Candidate name must be a non-empty string' },
          { status: 400 }
        );
      }
      await updateInterview(interviewId, candidate_name.trim());
    }

    const interview = await getInterview(interviewId);
    return NextResponse.json(interview);
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  }
}

