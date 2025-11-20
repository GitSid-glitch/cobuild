// Mock user data for demo without authentication
export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@cobuild.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null,
  },
};

export const mockProfile = {
  id: 'demo-user-123',
  full_name: 'Demo User',
  bio: 'Passionate about building innovative solutions and collaborating with talented individuals.',
  avatar_url: null,
  skills: ['React', 'Python', 'Machine Learning', 'UI/UX Design', 'Node.js', 'Product Management'],
  reputation_points: 1250,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockIdeas = [
  {
    id: 'idea-1',
    owner_id: 'demo-user-123',
    title: 'AI-Powered Study Scheduler',
    description: 'An intelligent app that optimizes study schedules based on learning patterns and deadlines. Uses machine learning to adapt to individual learning styles.',
    tags: ['AI', 'Education', 'Mobile App'],
    category: 'Education',
    attachment_urls: [],
    status: 'active',
    opportunity_type: 'team',
    collaborator_count: 3,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'idea-2',
    owner_id: 'demo-user-123',
    title: 'Campus Food Sharing Platform',
    description: 'Connect students to share extra meal swipes and reduce food waste on campus. Build a community around sustainable food practices.',
    tags: ['Social Impact', 'Mobile App', 'Sustainability'],
    category: 'Social Impact',
    attachment_urls: [],
    status: 'active',
    opportunity_type: 'both',
    collaborator_count: 5,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockCollaborations = [
  {
    id: 'collab-1',
    idea_id: 'external-idea-1',
    user_id: 'demo-user-123',
    role: 'Frontend Developer',
    status: 'active',
    progress_percentage: 65,
    last_active: new Date().toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    ideas: {
      id: 'external-idea-1',
      title: 'Student Marketplace App',
      description: 'A platform for students to buy and sell items within campus.',
      owner_id: 'other-user-1',
      status: 'active',
    },
  },
  {
    id: 'collab-2',
    idea_id: 'external-idea-2',
    user_id: 'demo-user-123',
    role: 'UI/UX Designer',
    status: 'active',
    progress_percentage: 40,
    last_active: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    ideas: {
      id: 'external-idea-2',
      title: 'Virtual Campus Tour Platform',
      description: 'VR-based campus tours for prospective students.',
      owner_id: 'other-user-2',
      status: 'active',
    },
  },
  {
    id: 'collab-3',
    idea_id: 'external-idea-3',
    user_id: 'demo-user-123',
    role: 'Backend Developer',
    status: 'active',
    progress_percentage: 80,
    last_active: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ideas: {
      id: 'external-idea-3',
      title: 'Peer Tutoring Network',
      description: 'Connect students who need help with those who can tutor.',
      owner_id: 'other-user-3',
      status: 'active',
    },
  },
];

export const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'demo-user-123',
    type: 'collaboration_request',
    title: 'New Collaboration Request',
    message: 'Alex Kim wants to join your project: AI-Powered Study Scheduler as a Backend Developer',
    metadata: {
      status: 'pending',
      actions: [
        { label: 'Accept', variant: 'default', href: '/idea/idea-1' },
        { label: 'Decline', variant: 'outline', href: '/idea/idea-1' },
      ],
    },
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'demo-user-123',
    type: 'investor_interest',
    title: 'Investor Interest',
    message: 'Rachel Green is interested in investing in your Campus Food Sharing Platform',
    metadata: {
      status: 'new',
    },
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'demo-user-123',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Chen sent you a message: "Great work on the latest update!"',
    metadata: {
      status: 'new',
    },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'demo-user-123',
    type: 'idea_approved',
    title: 'Idea Approved',
    message: 'Your idea "Virtual Reality Campus Tours" has been approved and is now live!',
    metadata: {
      status: 'approved',
    },
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockConversations = [
  {
    id: 'chat-1',
    participant1_id: 'demo-user-123',
    participant2_id: 'user-sarah',
    last_message: 'Sounds good! Let\'s discuss tomorrow.',
    last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'user-sarah',
      full_name: 'Sarah Chen',
      email: 'sarah@example.com',
    },
  },
  {
    id: 'chat-2',
    participant1_id: 'demo-user-123',
    participant2_id: 'user-mike',
    last_message: 'Thanks for the collaboration!',
    last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'user-mike',
      full_name: 'Mike Johnson',
      email: 'mike@example.com',
    },
  },
];

export const mockMessages = [
  {
    id: 'msg-1',
    chat_id: 'chat-1',
    sender_id: 'user-sarah',
    receiver_id: 'demo-user-123',
    content: 'Hey! How\'s the project going?',
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-2',
    chat_id: 'chat-1',
    sender_id: 'demo-user-123',
    receiver_id: 'user-sarah',
    content: 'Going great! Just finished the new feature.',
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-3',
    chat_id: 'chat-1',
    sender_id: 'user-sarah',
    receiver_id: 'demo-user-123',
    content: 'That\'s awesome! Can we schedule a call to review it?',
    read_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg-4',
    chat_id: 'chat-1',
    sender_id: 'demo-user-123',
    receiver_id: 'user-sarah',
    content: 'Sounds good! Let\'s discuss tomorrow.',
    read_at: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];
