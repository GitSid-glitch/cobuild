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
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    setUser(user);
    await fetchProfileData(user.id);
  };

  const fetchProfileData = async (userId) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);

      // Fetch ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .eq('owner_id', userId);

      if (ideasError) throw ideasError;
      setIdeas(ideasData || []);

      // Fetch collaborations
      const { data: collabData, error: collabError } = await supabase
        .from('collaborations')
        .select('*, ideas(*)')
        .eq('user_id', userId);

      if (collabError) throw collabError;
      setCollaborations(collabData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const badges = [
    { title: 'Early Adopter', icon: Star, color: 'bg-yellow-100 text-yellow-700' },
    { title: 'Team Player', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { title: 'Innovator', icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
    { title: 'Contributor', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  ];

  const skills = profile?.skills || ['React', 'Python', 'Machine Learning', 'UI/UX Design', 'Node.js', 'Product Management'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header showBack user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold mb-1">{user?.user_metadata?.full_name || 'User'}</h1>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  <p className="text-gray-700 mb-4">{profile?.bio || 'No bio yet'}</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold">{profile?.reputation_points || 1250} Reputation Points</span>
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
              {skills.map((skill, index) => (
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
            <h2 className="text-xl font-bold mb-4">Ideas Posted ({ideas.length})</h2>
            <div className="space-y-4">
              {ideas.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No ideas posted yet</p>
              ) : (
                ideas.map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push(`/idea/${idea.id}`)}>
                    <div className="flex items-center gap-4">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{idea.title}</p>
                        <p className="text-sm text-gray-600">{idea.collaborator_count || 0} collaborators</p>
                      </div>
                    </div>
                    <Badge variant={idea.status === 'active' ? 'success' : 'secondary'}>{idea.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Collaborations Joined */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Collaborations Joined ({collaborations.length})</h2>
            <div className="space-y-4">
              {collaborations.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Not collaborating on any projects yet</p>
              ) : (
                collaborations.map((collab) => (
                  <div key={collab.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => router.push(`/idea/${collab.idea_id}`)}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{collab.ideas?.title || 'Project'}</p>
                        <p className="text-sm text-gray-600">Role: {collab.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={collab.progress_percentage || 0} className="flex-1" />
                      <span className="text-sm font-semibold text-gray-700">{collab.progress_percentage || 0}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
