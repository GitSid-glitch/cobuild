'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Users, Calendar, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';

import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [idea, setIdea] = useState(null);
  const [owner, setOwner] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/signin');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    await fetchIdeaDetails(params.id, userData.email);
  };

  const fetchIdeaDetails = async (ideaId, userEmail) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`);
      if (!response.ok) throw new Error('Failed to fetch idea details');
      
      const data = await response.json();
      
      setIdea(data.idea);
      setOwner(data.owner);
      setCollaborators(data.collaborators || []);
      
      // Check ownership (mock logic for now)
      // In real app, compare IDs. Here we just check if current user is owner
      setIsOwner(false); // Default to false for demo unless we match IDs

      // Check if requested
      const existingRequest = data.collaborators?.find(c => c.user_id === userEmail); // Using email as ID for mock
      setHasRequested(!!existingRequest);

    } catch (error) {
      console.error('Error fetching idea details:', error);
      toast.error('Failed to load idea details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    // Mock join request
    setHasRequested(true);
    toast.success('Join request sent!');
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

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

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Idea not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header showBack user={user} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Idea Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Lightbulb className="h-8 w-8 text-white" fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                          {getInitials(owner?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {owner?.full_name || owner?.email?.split('@')[0] || 'User'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
              {!isOwner && (
                <Button
                  onClick={handleJoinRequest}
                  disabled={hasRequested}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {hasRequested ? 'Request Sent' : 'Join Project'}
                </Button>
              )}
              {isOwner && (
                <Button variant="outline" onClick={() => router.push(`/idea/${idea.id}/edit`)}>
                  Edit Idea
                </Button>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <Badge variant="success">{idea.status}</Badge>
              <Badge>{idea.category}</Badge>
              {idea.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{idea.description}</p>

            {idea.attachment_urls && idea.attachment_urls.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {idea.attachment_urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Attachment {index + 1}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{collaborators.length}</p>
              <p className="text-sm text-gray-600">Collaborators</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600">Discussions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-gray-600">Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team">Team ({collaborators.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            {/* Owner */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Project Owner</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {getInitials(owner?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{owner?.full_name || owner?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-sm text-gray-600">Project Creator</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/messages`)}>
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Collaborators */}
            {collaborators.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Collaborators</h3>
                  <div className="space-y-4">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(collab.profiles?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">
                            {collab.profiles?.full_name || collab.profiles?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-sm text-gray-600">{collab.role}</p>
                        </div>
                        <Badge variant={collab.status === 'active' ? 'success' : 'warning'}>
                          {collab.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/messages`)}>
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600 text-center py-8">No activity yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Category</p>
                    <p className="text-lg">{idea.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Status</p>
                    <p className="text-lg">{idea.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Created</p>
                    <p className="text-lg">{new Date(idea.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
