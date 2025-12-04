import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview, getInterviewers, getInterviewScores, getTestWithQuestions, getInterviewQuestionAnswers } from '@/lib/db';

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
    const [interviewers, scores, testData, answers] = await Promise.all([
      getInterviewers(interviewId),
      getInterviewScores(interviewId),
      getTestWithQuestions(interview.test_id),
      getInterviewQuestionAnswers(interviewId),
    ]);

    return NextResponse.json({
      ...interview,
      interviewers,
      scores,
      test: testData?.test,
      questions: testData?.questions || [],
      answers: answers || [],
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
    const { candidate_name, feedback } = body;

    if (candidate_name !== undefined || feedback !== undefined) {
      const candidateNameValue = candidate_name !== undefined 
        ? (typeof candidate_name === 'string' && candidate_name.trim().length > 0 ? candidate_name.trim() : undefined)
        : undefined;
      
      const feedbackValue = feedback !== undefined
        ? (feedback === null || feedback === '' ? null : (typeof feedback === 'string' ? feedback.trim() : null))
        : undefined;

      await updateInterview(interviewId, candidateNameValue, feedbackValue);
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

