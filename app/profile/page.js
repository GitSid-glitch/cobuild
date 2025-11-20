'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Star, Users, TrendingUp, Award } from 'lucide-react';
import Header from '@/components/Header';
import { mockUser, mockProfile, mockIdeas, mockCollaborations } from '@/lib/mock-data';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const badges = [
    { title: 'Early Adopter', icon: Star, color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Team Player', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { title: 'Innovator', icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
    { title: 'Contributor', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  ];

  const getInitials = (email) => {
    if (!email) return 'D';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header showBack />

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={mockProfile.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {getInitials(mockUser.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{mockProfile.full_name}</h1>
                  <p className="text-gray-600 mb-2">{mockUser.email}</p>
                  <p className="text-gray-700 mb-4">{mockProfile.bio}</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">{mockProfile.reputation_points} Reputation Points</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push('/profile/edit')}>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Skills & Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {mockProfile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-4 py-2">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Badges */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Achievements & Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className={`${badge.color} rounded-lg p-6 text-center`}>
                    <Icon className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-semibold text-sm">{badge.title}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Ideas Posted */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Ideas Posted ({mockIdeas.length})</h2>
            <div className="space-y-4">
              {mockIdeas.map((idea) => (
                <div key={idea.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push(`/idea/${idea.id}`)}>
                  <div className="flex items-center gap-4">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{idea.title}</p>
                      <p className="text-sm text-gray-600">{idea.collaborator_count} collaborators</p>
                    </div>
                  </div>
                  <Badge variant={idea.status === 'active' ? 'success' : 'secondary'}>{idea.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Joined */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Collaborations Joined ({mockCollaborations.length})</h2>
            <div className="space-y-4">
              {mockCollaborations.map((collab) => (
                <div key={collab.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push(`/idea/${collab.idea_id}`)}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{collab.ideas.title}</p>
                      <p className="text-sm text-gray-600">Role: {collab.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={collab.progress_percentage} className="flex-1" />
                    <span className="text-sm font-semibold text-gray-700">{collab.progress_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
