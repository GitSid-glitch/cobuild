'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users } from 'lucide-react';
import Header from '@/components/Header';
import { mockUser, mockIdeas } from '@/lib/mock-data';

export default function ExplorePage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    filterIdeas();
  }, [searchQuery, categoryFilter, ideas]);

  const loadIdeas = () => {
    // Add some extra mock ideas for variety
    const extraIdeas = [
      {
        id: 'idea-3',
        owner_id: 'user-3',
        title: 'Virtual Reality Campus Tours',
        description: 'Immersive VR experience for prospective students to explore campus remotely.',
        tags: ['VR', 'Education', 'Technology'],
        category: 'Education',
        status: 'active',
        opportunity_type: 'funding',
        collaborator_count: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'idea-4',
        owner_id: 'user-4',
        title: 'Eco-Friendly Delivery Network',
        description: 'Carbon-neutral delivery service using electric vehicles and optimized routes.',
        tags: ['Sustainability', 'Logistics', 'Green Tech'],
        category: 'Sustainability',
        status: 'active',
        opportunity_type: 'both',
        collaborator_count: 7,
        created_at: new Date().toISOString(),
      },
    ];
    
    const allIdeas = [...mockIdeas, ...extraIdeas];
    setIdeas(allIdeas);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(allIdeas.map(idea => idea.category).filter(Boolean))];
    setCategories(uniqueCategories);
    setLoading(false);
  };

  const filterIdeas = () => {
    let filtered = ideas;

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(idea => idea.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        idea.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredIdeas(filtered);
  };

  const getOpportunityBadge = (opportunityType) => {
    const badges = {
      team: { label: 'Team', variant: 'info' },
      funding: { label: 'Funding', variant: 'success' },
      both: { label: 'Both', variant: 'default' },
    };
    return badges[opportunityType] || badges.team;
  };

  const getInitials = (id) => {
    return id?.charAt(0).toUpperCase() || 'U';
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header showBack />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Ideas</h1>
          <p className="text-gray-600">Discover innovative projects and find opportunities to collaborate or invest</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search ideas, tags, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-gray-600 mb-6">Showing {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''}</p>

        {/* Ideas Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600">No ideas found matching your criteria</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredIdeas.map((idea) => {
              const opportunityBadge = getOpportunityBadge(idea.opportunity_type);
              return (
                <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                            {getInitials(idea.owner_id)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Project Owner</span>
                      </div>
                      <Badge variant={opportunityBadge.variant}>{opportunityBadge.label}</Badge>
                    </div>

                    {/* Idea Title & Description */}
                    <h3 className="font-bold text-lg mb-2">{idea.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{idea.description}</p>

                    {/* Tags */}
                    {idea.tags && idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {idea.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        {idea.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{idea.tags.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {idea.collaborator_count || 0} members
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/idea/${idea.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {idea.opportunity_type === 'funding' ? 'Invest' : idea.opportunity_type === 'both' ? 'View Details' : 'Join'}
                      </Button>
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
