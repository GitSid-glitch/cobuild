# 🚀 CoBuild - Complete Deployment Guide

This guide will walk you through deploying the CoBuild platform from start to finish.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Yarn package manager installed
- [ ] Git installed
- [ ] A Supabase account (free tier is fine)
- [ ] Basic understanding of environment variables

---

## 🎯 Quick Start (5 Steps)

### Step 1: Set Up Supabase (15 minutes)

1. **Create Account**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign up or log in

2. **Create Project**
   - Click "New Project"
   - Project Name: `cobuild`
   - Database Password: Choose a strong password (SAVE THIS!)
   - Region: Select closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get API Keys**
   - Go to Settings → API
   - Copy and save:
     ```
     Project URL: https://xxxxxxxxxxxxx.supabase.co
     anon public key: eyJhbGc... (long string)
     service_role key: eyJhbGc... (different long string)
     ```

4. **Enable Authentication**
   - Go to Authentication → Providers
   - Email provider should be enabled by default
   - (Optional) Configure email templates

5. **Create Storage Bucket**
   - Go to Storage
   - Click "Create a new bucket"
   - Name: `attachments`
   - Set as Public: ✓
   - Click Save

6. **Set Up Database**
   - Go to SQL Editor
   - Click "New query"
   - Copy and paste the ENTIRE SQL schema from README.md (Database Schema section)
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for success message

---

### Step 2: Configure Environment Variables (5 minutes)

1. **Copy Example File**
   ```bash
   cd /app
   cp .env.example .env
   ```

2. **Edit .env File**
   ```bash
   nano .env
   # or use your preferred editor
   ```

3. **Fill in Values**
   ```env
   # Replace with YOUR actual Supabase values
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   
   # For local development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ```

4. **Save and Exit**
   - Press Ctrl + X, then Y, then Enter (if using nano)

---

### Step 3: Install Dependencies (2 minutes)

```bash
cd /app
yarn install
```

---

### Step 4: Test Locally (1 minute)

**Option A: Standard Dev Server (No Socket.io)**
```bash
yarn dev
```

**Option B: With Socket.io for Real-time Chat**
```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000)

---

### Step 5: Create Your First Account

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up"
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
4. Click "Sign Up"
5. Check your email for verification (if enabled)

---

## 🌐 Production Deployment Options

### Option 1: Vercel (Easiest - Recommended)

**Best for:** Quick deployment, automatic HTTPS

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cobuild.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Import"

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from your `.env` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     ```
   - For production, update:
     ```
     NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
     NEXT_PUBLIC_SOCKET_URL=https://your-domain.vercel.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

**⚠️ Note:** Socket.io may have limitations on Vercel. For full real-time features, use Railway or self-hosting.

---

### Option 2: Railway (Best for Socket.io)

**Best for:** Full-stack apps with WebSockets

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize**
   ```bash
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
   railway variables set NEXT_PUBLIC_SOCKET_URL=https://your-app.railway.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get URL**
   ```bash
   railway domain
   ```

---

### Option 3: Self-Hosting (VPS/Server)

**Best for:** Full control, custom domains

**Requirements:**
- Ubuntu 20.04+ or similar
- Node.js 18+
- Nginx (for reverse proxy)
- PM2 (for process management)

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Yarn**
   ```bash
   npm install -g yarn
   ```

3. **Install PM2**
   ```bash
   npm install -g pm2
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/cobuild.git
   cd cobuild
   ```

5. **Install Dependencies**
   ```bash
   yarn install
   ```

6. **Create .env File**
   ```bash
   nano .env
   # Add all environment variables
   ```

7. **Build Application**
   ```bash
   yarn build
   ```

8. **Start with PM2**
   ```bash
   pm2 start server.js --name cobuild
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/cobuild
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api/socket {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

10. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/cobuild /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Install SSL (Optional but Recommended)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

## 🧪 Testing Your Deployment

### Test Checklist

- [ ] Landing page loads
- [ ] Can sign up with new account
- [ ] Email verification works (if enabled)
- [ ] Can sign in
- [ ] Dashboard loads with correct user data
- [ ] Can post a new idea
- [ ] Can upload attachments
- [ ] Profile page shows correct info
- [ ] Can edit profile
- [ ] Explore page shows ideas
- [ ] Notifications work
- [ ] Messages page loads
- [ ] Real-time chat works (if using Socket.io)

### Sample Test Flow

1. **Create Account**
   - Sign up with email: `test@example.com`
   - Use password: `test123456`

2. **Post First Idea**
   - Go to Dashboard
   - Click "Post Idea"
   - Title: "Test Project"
   - Description: "This is a test"
   - Add tags: "test", "demo"
   - Upload a file
   - Submit

3. **Test Profile**
   - Go to Profile
   - Click "Edit Profile"
   - Update name and bio
   - Upload avatar
   - Add skills
   - Save

4. **Explore Ideas**
   - Go to Explore
   - Search for your idea
   - Try category filter

---

## 🔧 Common Issues & Solutions

### Issue 1: "Supabase credentials not found"

**Solution:**
- Check `.env` file exists
- Verify all variables are set
- Restart server after changing `.env`

### Issue 2: Database queries fail

**Solution:**
- Run SQL schema in Supabase
- Check RLS policies are enabled
- Verify user is authenticated

### Issue 3: File uploads fail

**Solution:**
- Create `attachments` bucket in Supabase Storage
- Set bucket to public
- Check file size < 10MB

### Issue 4: Socket.io not connecting

**Solution:**
- Use `node server.js` instead of `yarn dev`
- Check `NEXT_PUBLIC_SOCKET_URL` is correct
- Verify CORS settings

### Issue 5: Authentication errors

**Solution:**
- Enable email provider in Supabase
- Check API keys are correct
- Clear browser cache/cookies

---

## 📊 Post-Deployment Checklist

After deploying:

- [ ] Update Supabase Auth redirect URLs
  - Go to Supabase → Authentication → URL Configuration
  - Add your production URL: `https://yourdomain.com/**`
  
- [ ] Configure email templates
  - Go to Authentication → Email Templates
  - Customize signup, password reset emails

- [ ] Set up custom domain (if needed)
  - Configure DNS records
  - Update environment variables

- [ ] Enable email verification
  - Go to Authentication → Policies
  - Enable email confirmation

- [ ] Monitor logs
  - Check Supabase logs
  - Monitor server logs (PM2/Railway)

- [ ] Set up analytics (optional)
  - Google Analytics
  - Mixpanel
  - PostHog

---

## 🎉 Success!

Your CoBuild platform is now live! 🚀

**Next Steps:**
1. Share with your first users
2. Gather feedback
3. Iterate and improve
4. Add AI features when ready

**Need Help?**
- Check the main README.md
- Review Supabase documentation
- Check Next.js docs

**Happy Building! 💪**
