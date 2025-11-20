'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function Header({ showBack = false, notificationCount = 0 }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Mock user data for demo
  const mockUser = {
    email: 'demo@cobuild.com',
    user_metadata: {
      full_name: 'Demo User',
      avatar_url: null
    }
  };

  const getInitials = (email) => {
    if (!email) return 'D';
    return email.charAt(0).toUpperCase();
  };

  // Check if we're on the landing page
  const isLandingPage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href={isLandingPage ? "/" : "/dashboard"} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Lightbulb className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold">CoBuild</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLandingPage && (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs" variant="destructive">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={mockUser.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getInitials(mockUser.email)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
