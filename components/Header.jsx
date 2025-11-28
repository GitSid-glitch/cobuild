'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, User, ArrowLeft, Lightbulb, Menu, LogOut, Home, PlusCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function Header({ showBack = false, notificationCount = 0, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    if (!user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  const getInitials = (email) => {
    if (!email) return 'D';
    return email.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/signin');
  };

  // Check if we're on the landing page
  const isLandingPage = pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {!isLandingPage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-6 mt-8">
                  <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link href="/post-idea" className="flex items-center gap-2 text-lg font-semibold">
                    <PlusCircle className="h-5 w-5" />
                    Post Idea
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 text-lg font-semibold">
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link href="/notifications" className="flex items-center gap-2 text-lg font-semibold">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-lg font-semibold text-red-600 text-left">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hidden md:flex">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href={isLandingPage ? "/" : "/dashboard"} className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Lightbulb className="h-6 w-6 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold hidden md:block">CoBuild</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLandingPage && (
            <>
              <Link href="/notifications" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs" variant="destructive">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src={currentUser?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {getInitials(currentUser?.email)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
