import { NextRequest, NextResponse } from 'next/server';
import { getTests, createTest, setTestQuestions } from '@/lib/db';

export async function GET() {
  try {
    const tests = await getTests();
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, question_ids } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Test name is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(question_ids)) {
      return NextResponse.json(
        { error: 'question_ids must be an array' },
        { status: 400 }
      );
    }

    const test = await createTest(name.trim());
    
    // Set test questions if provided
    if (question_ids.length > 0) {
      await setTestQuestions(test.id, question_ids);
    }

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}

