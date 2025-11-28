'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import Header from '@/components/Header';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    skills: [],
    avatar_url: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
    await fetchProfile(userData.email);
  };

  const fetchProfile = async (email) => {
    try {
      const response = await fetch(`/api/profile?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      
      if (data) {
        setProfile({
          full_name: data.fullName || '',
          bio: data.bio || '',
          skills: data.skills || [],
          avatar_url: data.avatar_url || '',
        });
        setAvatarPreview(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSkillInput = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!profile.skills.includes(skillInput.trim())) {
        setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({ ...profile, skills: profile.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar image must be under 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setProfile(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          full_name: profile.full_name,
          bio: profile.bio,
          skills: profile.skills,
          avatar_url: profile.avatar_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header showBack user={user} />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {getInitials(user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" onClick={() => document.getElementById('avatar-upload').click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Avatar
                    </Button>
                  </label>
                  <p className="text-sm text-gray-600 mt-2">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={profile.full_name}
                  onChange={handleChange}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillInput}
                />
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
