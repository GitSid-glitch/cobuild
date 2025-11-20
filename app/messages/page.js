'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, Plus } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase-client';
import { getSocket } from '@/lib/socket-client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    checkUser();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin');
      return;
    }
    setUser(user);
    await fetchConversations(user.id);
    initializeSocket(user.id);
  };

  const initializeSocket = (userId) => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('user_online', userId);
    });

    socket.on('new_message', (message) => {
      if (selectedConversation && message.chat_id === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
        markAsRead(message.id);
      }
      // Update conversations list
      fetchConversations(userId);
    });

    socket.on('user_typing', ({ userId: typingUserId, chatId }) => {
      if (selectedConversation && chatId === selectedConversation.id && typingUserId !== userId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });
  };

  const fetchConversations = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*, profiles!chats_participant1_id_fkey(full_name, email), profiles!chats_participant2_id_fkey(full_name, email)')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark all messages as read
      data?.filter(m => m.receiver_id === user.id && !m.read_at).forEach(m => {
        markAsRead(m.id);
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const message = {
      id: crypto.randomUUID(),
      chat_id: selectedConversation.id,
      sender_id: user.id,
      receiver_id: selectedConversation.participant1_id === user.id 
        ? selectedConversation.participant2_id 
        : selectedConversation.participant1_id,
      content: messageInput,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('messages')
        .insert([message]);

      if (error) throw error;

      setMessages([...messages, message]);
      setMessageInput('');

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('send_message', message);
      }

      // Update chat last_message_at
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('typing', {
        userId: user.id,
        chatId: selectedConversation.id,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null;
    return conversation.participant1_id === user.id
      ? { id: conversation.participant2_id, ...conversation.profiles }
      : { id: conversation.participant1_id, ...conversation.profiles };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack={!selectedConversation} user={user} />

      <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className={`w-full md:w-80 bg-white border-r ${
          selectedConversation ? 'hidden md:block' : 'block'
        }`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-9rem)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                <p>No conversations yet</p>
                <Button className="mt-4" onClick={() => router.push('/explore')}>
                  Find People to Chat
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const participant = getOtherParticipant(conversation);
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(participant?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {participant?.full_name || participant?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                      </div>
                      {conversation.last_message_at && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${
          selectedConversation ? 'block' : 'hidden md:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    ←
                  </Button>
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(getOtherParticipant(selectedConversation)?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {getOtherParticipant(selectedConversation)?.full_name || 
                       getOtherParticipant(selectedConversation)?.email?.split('@')[0] || 
                       'User'}
                    </p>
                    {isTyping && <p className="text-xs text-gray-600">typing...</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="text-center">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Today</span>
                  </div>
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender_id === user.id;
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {getInitials(getOtherParticipant(selectedConversation)?.email)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwnMessage && !showAvatar && <div className="w-8" />}
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="bg-white border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
                  <Button type="button" variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleTyping}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-xl mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
