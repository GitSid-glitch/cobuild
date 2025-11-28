import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'cobuild');

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Don't return sensitive data
    const { passwordHash, salt, ...profile } = user;

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { email, full_name, bio, skills, avatar_url } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'cobuild');

    const updateDoc = {
      $set: {
        fullName: full_name,
        bio,
        skills,
        avatar_url,
        updatedAt: new Date(),
      },
    };

    const result = await db.collection('users').updateOne({ email }, updateDoc);

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
