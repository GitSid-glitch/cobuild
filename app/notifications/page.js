'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, MessageSquare, Users, Lightbulb, TrendingUp, Award, ArrowUp } from 'lucide-react';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { mockUser, mockNotifications } from '@/lib/mock-data';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUser(mockUser);
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
    toast.success('Marked as read');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'collaboration_request':
        return Users;
      case 'message':
        return MessageSquare;
      case 'idea_approved':
      case 'collaboration_accepted':
        return CheckCircle;
      case 'milestone':
        return TrendingUp;
      case 'upvote':
        return ArrowUp;
      case 'badge':
        return Award;
      default:
        return Lightbulb;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'collaboration_request':
        return 'bg-blue-100 text-blue-700';
      case 'message':
        return 'bg-green-100 text-green-700';
      case 'idea_approved':
      case 'collaboration_accepted':
        return 'bg-green-100 text-green-700';
      case 'milestone':
        return 'bg-purple-100 text-purple-700';
      case 'upvote':
        return 'bg-orange-100 text-orange-700';
      case 'badge':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'new':
        return 'info';
      case 'approved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
      <Header showBack user={user} notificationCount={unreadCount} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-600">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">
                  {filter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <Card 
                  key={notification.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    !notification.is_read ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconColor} flex-shrink-0`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold">{notification.title}</h3>
                          {!notification.is_read && <div className="h-2 w-2 rounded-full bg-blue-600"></div>}
                        </div>
                        <p className="text-gray-700 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {notification.metadata?.status && (
                            <Badge variant={getBadgeVariant(notification.metadata.status)}>
                              {notification.metadata.status}
                            </Badge>
                          )}
                        </div>
                        {notification.metadata?.actions && (
                          <div className="flex gap-2 mt-4">
                            {notification.metadata.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={action.variant || 'default'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (action.href) router.push(action.href);
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
