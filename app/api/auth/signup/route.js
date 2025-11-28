import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, data } = await req.json();
    const fullName = data?.full_name;

    if (!email || !email.includes('@') || !password || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid input' },
        { status: 422 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'cobuild');

    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const { salt, hash } = hashPassword(password);

    const result = await db.collection('users').insertOne({
      email,
      fullName,
      passwordHash: hash,
      salt,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'User created', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
