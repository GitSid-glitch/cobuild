import clientPromise from '@/lib/mongodb';
import { verifyPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Invalid input' },
        { status: 422 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'cobuild');

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real app, you would set a session cookie here.
    // For this simple implementation, we'll just return success.
    // The frontend can handle redirection.

    return NextResponse.json(
      { message: 'Logged in successfully', user: { email: user.email, name: user.fullName } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
