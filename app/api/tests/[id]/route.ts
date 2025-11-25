import { NextRequest, NextResponse } from 'next/server';
import { getTest, getTestWithQuestions, updateTest, deleteTest, setTestQuestions } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testId = parseInt(id, 10);

    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Invalid test ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeQuestions = searchParams.get('include_questions') === 'true';

    if (includeQuestions) {
      const result = await getTestWithQuestions(testId);
      if (!result) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    }

    const test = await getTest(testId);
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test' },
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
    const testId = parseInt(id, 10);

    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Invalid test ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, question_ids } = body;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Test name must be a non-empty string' },
          { status: 400 }
        );
      }
      await updateTest(testId, name.trim());
    }

    if (question_ids !== undefined) {
      if (!Array.isArray(question_ids)) {
        return NextResponse.json(
          { error: 'question_ids must be an array' },
          { status: 400 }
        );
      }
      await setTestQuestions(testId, question_ids);
    }

    const test = await getTest(testId);
    return NextResponse.json(test);
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testId = parseInt(id, 10);

    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Invalid test ID' },
        { status: 400 }
      );
    }

    await deleteTest(testId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}

