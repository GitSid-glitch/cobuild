import { NextResponse } from 'next/server';
import { mockIdeas, mockProfile, mockCollaborations } from '@/lib/mock-data';

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // For now, check mock data first
    const idea = mockIdeas.find(i => i.id === id);

    if (idea) {
      // Mock owner and collaborators
      const owner = mockProfile; // Using mock profile as owner for demo
      const collaborators = mockCollaborations.filter(c => c.idea_id === id);
      
      return NextResponse.json({
        idea,
        owner,
        collaborators
      }, { status: 200 });
    }

    // If not in mock data, return 404 for now (or implement DB fetch later)
    return NextResponse.json({ message: 'Idea not found' }, { status: 404 });

  } catch (error) {
    console.error('Idea details fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
