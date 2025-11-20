'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, Plus } from 'lucide-react';
import Header from '@/components/Header';
import { mockUser, mockConversations, mockMessages } from '@/lib/mock-data';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = () => {
    setConversations(mockConversations);
    setLoading(false);
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Filter messages for this conversation
    const convMessages = mockMessages.filter(m => m.chat_id === conversation.id);
    setMessages(convMessages);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      chat_id: selectedConversation.id,
      sender_id: mockUser.id,
      receiver_id: selectedConversation.participant2_id,
      content: messageInput,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    toast.success('Message sent (Demo Mode)');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBack />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBack={!selectedConversation} />

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
              conversations.map((conversation) => (
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
                        {getInitials(conversation.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {conversation.profiles?.full_name || 'User'}
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
              ))
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
                      {getInitials(selectedConversation.profiles?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedConversation.profiles?.full_name || 'User'}
                    </p>
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
                    const isOwnMessage = message.sender_id === mockUser.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                              {getInitials(selectedConversation.profiles?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
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
                <p className="text-sm">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
