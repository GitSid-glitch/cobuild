# CoBuild - Collaborate. Build. Grow.

![CoBuild Logo](https://via.placeholder.com/800x200/4C6FFF/FFFFFF?text=CoBuild+-+Connecting+Innovators)

## 🚀 Overview

CoBuild is a full-stack collaboration platform that connects innovators, collaborators, and investors. Transform your ideas into successful projects with the right team and resources.

### ✨ Key Features

- 💡 **Idea Posting**: Share your innovative project ideas with the community
- 🤝 **Collaboration**: Find and connect with skilled collaborators
- 💬 **Real-time Chat**: Communicate with your team using Socket.io
- 🔔 **Notifications**: Stay updated on collaboration requests and project updates
- 🎯 **Project Management**: Track progress, milestones, and achievements
- 🏆 **Badges & Reputation**: Build your reputation and earn achievement badges
- 🔍 **Explore Ideas**: Discover innovative projects and investment opportunities
- 💾 **File Uploads**: Attach documents and images to your ideas

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide Icons** - Modern icon library
- **Socket.io Client** - Real-time communication

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time subscriptions
- **Socket.io Server** - WebSocket server for real-time chat

### Libraries
- **date-fns** - Date formatting
- **uuid** - Unique ID generation
- **sonner** - Toast notifications
- **zod** - Schema validation

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Schema](#database-schema)
4. [Local Development](#local-development)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)
7. [Features Guide](#features-guide)
8. [Troubleshooting](#troubleshooting)

---

## 📚 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **Yarn** package manager
- **Supabase account** (free tier available)
- **Git** for version control

---

## 🔧 Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `cobuild` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

### Step 2: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)

### Step 3: Set Up Authentication

1. Go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. (Optional) Enable **Google OAuth** for social login:
   - Follow Supabase guide for Google OAuth setup

### Step 4: Set Up Storage

1. Go to **Storage** → **Create a new bucket**
2. Create bucket named: `attachments`
3. Set as **Public bucket** (for file access)
4. Click **Save**

---

## 📦 Database Schema

### Step 5: Create Database Tables

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[],
  reputation_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[],
  category TEXT,
  attachment_urls TEXT[],
  status TEXT DEFAULT 'active',
  opportunity_type TEXT DEFAULT 'team', -- 'team', 'funding', 'both'
  collaborator_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborations table
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  status TEXT DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX ideas_owner_id_idx ON ideas(owner_id);
CREATE INDEX collaborations_user_id_idx ON collaborations(user_id);
CREATE INDEX collaborations_idea_id_idx ON collaborations(idea_id);
CREATE INDEX messages_chat_id_idx ON messages(chat_id);
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX chats_participants_idx ON chats(participant1_id, participant2_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for ideas
CREATE POLICY "Ideas are viewable by everyone" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for collaborations
CREATE POLICY "Collaborations are viewable by participants" ON collaborations
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT owner_id FROM ideas WHERE id = idea_id)
  );

CREATE POLICY "Users can create collaborations" ON collaborations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for chats
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 6: Insert Sample Data (Optional)

For testing, you can add sample data:

```sql
-- This will be inserted after you create your first user account
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

INSERT INTO ideas (id, owner_id, title, description, tags, category, status, collaborator_count)
VALUES 
  (
    uuid_generate_v4(),
    'YOUR_USER_ID',
    'AI-Powered Study Scheduler',
    'An app that uses AI to optimize study schedules based on learning patterns and deadlines.',
    ARRAY['AI', 'Education', 'Mobile App'],
    'Education',
    'active',
    3
  ),
  (
    uuid_generate_v4(),
    'YOUR_USER_ID',
    'Campus Food Sharing Platform',
    'Connect students to share extra meal swipes and reduce food waste on campus.',
    ARRAY['Social Impact', 'Mobile App', 'Sustainability'],
    'Social Impact',
    'active',
    5
  );
```

---

## 💻 Local Development

### Step 1: Clone and Install

```bash
cd /app
yarn install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Step 3: Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run with Socket.io Server

For real-time chat functionality, use the custom server:

```bash
node server.js
```

---

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | `eyJhbGc...` |
| `NEXT_PUBLIC_BASE_URL` | Your app's public URL | Production: `https://yourdomain.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | Same as BASE_URL |

---

## 🚀 Deployment

### Option 1: Vercel (Recommended for Next.js)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables from `.env`
   - Click "Deploy"

3. **Note**: For Socket.io, you may need a separate backend or use Vercel's Serverless Functions with limitations.

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   # Add all other variables
   ```

### Option 3: Digital Ocean / AWS / Heroku

1. **Build the application**
   ```bash
   yarn build
   ```

2. **Start production server**
   ```bash
   node server.js
   ```

3. **Set environment variables** on your hosting platform

4. **Configure domain and SSL** through your hosting provider

---

## 📖 Features Guide

### User Authentication
- Sign up with email and password
- Email verification (configure in Supabase)
- Password reset flow
- Profile creation on signup

### Posting Ideas
1. Navigate to **Dashboard**
2. Click **"Post Idea"**
3. Fill in:
   - Project title
   - Description
   - Tags
   - Category
   - Attachments (optional)
4. Click **"Submit Idea"**

### Finding Collaborators
1. Go to **Explore** page
2. Use search bar to find ideas
3. Filter by category
4. Click **"Join"** on ideas you're interested in

### Real-time Chat
1. Navigate to **Messages**
2. Select a conversation
3. Type and send messages
4. See typing indicators in real-time

### Notifications
- Collaboration requests
- Message notifications
- Idea approvals
- Milestone completions
- Badge earnings

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Supabase credentials not found"
**Solution**: Make sure `.env` file exists and contains correct Supabase credentials.

#### 2. Authentication errors
**Solution**: 
- Check if email provider is enabled in Supabase
- Verify API keys are correct
- Check browser console for detailed errors

#### 3. Database queries failing
**Solution**:
- Verify RLS policies are created
- Check if tables exist in Supabase
- Ensure user is authenticated

#### 4. File uploads not working
**Solution**:
- Verify `attachments` bucket exists in Supabase Storage
- Check bucket is set to public
- Verify file size is under 10MB

#### 5. Socket.io not connecting
**Solution**:
- Use `node server.js` instead of `yarn dev`
- Check CORS configuration
- Verify `NEXT_PUBLIC_SOCKET_URL` is correct

### Get Help

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Socket.io Docs**: [https://socket.io/docs](https://socket.io/docs)

---

## 📝 Project Structure

```
/app
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── explore/          # Explore ideas page
│   ├── messages/         # Chat page
│   ├── notifications/    # Notifications page
│   ├── post-idea/        # Post idea page
│   ├── profile/          # Profile page
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   ├── layout.js         # Root layout
│   ├── page.js           # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn components
│   └── Header.jsx        # Global header
├── lib/
│   ├── supabase-client.js  # Supabase client
│   ├── socket-client.js    # Socket.io client
│   └── utils.js            # Utility functions
├── server.js           # Custom server with Socket.io
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Next Steps

### Enhancements to Add

1. **AI Features** (when ready)
   - Smart tag suggestions
   - Collaborator matching
   - Idea recommendations

2. **Advanced Features**
   - Video calls integration
   - Project milestones tracking
   - Investment management
   - Advanced search filters

3. **UI Improvements**
   - Dark mode toggle
   - Mobile app (React Native)
   - Progressive Web App (PWA)

4. **Social Features**
   - User following
   - Idea upvoting/liking
   - Comments on ideas
   - Activity feed

---

## 📜 License

MIT License - feel free to use this project for learning and building!

---

## 👏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Socket.io](https://socket.io/)

---

## ❤️ Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features

**Happy Building! 🚀**
