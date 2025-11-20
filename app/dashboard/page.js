'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, MessageSquare, Lightbulb, TrendingUp, Bell } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    postedIdeas: 0,
    activeProjects: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    // Use mock user
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@cobuild.com',
      user_metadata: {
        full_name: 'Demo User',
      },
    };
    setUser(demoUser);
    fetchDashboardData(demoUser.id);
  };

  const fetchDashboardData = async (userId) => {
    try {
      // Fetch user's ideas
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (ideasError) throw ideasError;
      setIdeas(ideasData || []);

      // Fetch collaborations
      const { data: collabData, error: collabError } = await supabase
        .from('collaborations')
        .select('*, ideas(*)')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (collabError) throw collabError;
      setCollaborations(collabData || []);

      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Calculate stats
      const unreadCount = notifData?.filter(n => !n.is_read).length || 0;
      const activeCount = ideasData?.filter(i => i.status === 'active').length || 0;

      setStats({
        postedIdeas: ideasData?.length || 0,
        activeProjects: activeCount,
        unreadNotifications: unreadCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notificationCount={stats.unreadNotifications} />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your projects today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/post-idea')}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Post Idea</p>
                <p className="text-sm text-gray-600">Share your vision</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/explore')}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Find Collaborators</p>
                <p className="text-sm text-gray-600">Discover talent</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/messages')}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Messages</p>
                <p className="text-sm text-gray-600">Chat with team</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.postedIdeas}</p>
                <p className="text-sm text-gray-600">Posted Ideas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadNotifications}</p>
                <p className="text-sm text-gray-600">New Notifications</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="ideas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ideas">Your Ideas ({ideas.length})</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations ({collaborations.length})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications ({stats.unreadNotifications})</TabsTrigger>
          </TabsList>

          <TabsContent value="ideas" className="space-y-4">
            {ideas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't posted any ideas yet</p>
                  <Button onClick={() => router.push('/post-idea')}>
                    <Plus className="mr-2 h-4 w-4" /> Post Your First Idea
                  </Button>
                </CardContent>
              </Card>
            ) : (
              ideas.map((idea) => (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Lightbulb className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-lg">{idea.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-4">{idea.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>👥 {idea.collaborator_count || 0} collaborators</span>
                          <span>📅 {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                          <Badge variant={idea.status === 'active' ? 'success' : 'secondary'}>{idea.status}</Badge>
                        </div>
                      </div>
                      <Button onClick={() => router.push(`/idea/${idea.id}`)}>Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="collaborations" className="space-y-4">
            {collaborations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">You're not collaborating on any projects yet</p>
                  <Button onClick={() => router.push('/explore')}>
                    <Users className="mr-2 h-4 w-4" /> Find Projects
                  </Button>
                </CardContent>
              </Card>
            ) : (
              collaborations.map((collab) => (
                <Card key={collab.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{collab.ideas?.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">Role: {collab.role}</p>
                        <p className="text-sm text-gray-500">
                          Last active: {formatDistanceToNow(new Date(collab.last_active), { addSuffix: true })}
                        </p>
                      </div>
                      <Button onClick={() => router.push(`/idea/${collab.idea_id}`)}>View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <Card key={notif.id} className={!notif.is_read ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{notif.title}</p>
                        <p className="text-sm text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.is_read && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {notifications.length > 5 && (
              <div className="text-center">
                <Button variant="outline" onClick={() => router.push('/notifications')}>
                  View All Notifications
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
