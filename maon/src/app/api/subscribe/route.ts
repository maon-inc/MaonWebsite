import { NextRequest, NextResponse } from 'next/server';
import { insertEmail, createEmailsTable } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Ensure the table exists
    await createEmailsTable();

    // Insert the email
    const result = await insertEmail(email);

    if (result.success) {
      return NextResponse.json(
        { message: 'Email subscribed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to subscribe email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in subscribe API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 