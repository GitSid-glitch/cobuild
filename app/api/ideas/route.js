import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { title, description, category, tags, attachments, owner_id } = await req.json();

    if (!title || !description || !owner_id) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'cobuild');

    const newIdea = {
      id: uuidv4(),
      title,
      description,
      category,
      tags,
      attachment_urls: attachments, // Storing Base64 strings directly for now
      owner_id,
      created_at: new Date(),
      status: 'active',
      collaborator_count: 0,
    };

    const result = await db.collection('ideas').insertOne(newIdea);

    return NextResponse.json({ message: 'Idea created', ideaId: newIdea.id }, { status: 201 });
  } catch (error) {
    console.error('Create idea error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
