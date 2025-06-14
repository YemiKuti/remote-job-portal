
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicProfileById, PublicProfileData } from '@/utils/api/profileApi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Briefcase, Link as LinkIcon, UserCircle, Info, Settings, Code } from 'lucide-react';
import NotFound from './NotFound'; // Import NotFound page

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  
  const { data: profile, isLoading, error, isError } = useQuery<PublicProfileData | null>({
    queryKey: ['publicProfile', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(null); // Should not happen if route is matched
      return fetchPublicProfileById(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (userId) {
      console.log(`Displaying public profile for user ID: ${userId}`);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !profile) {
    console.error(`Error loading profile for ${userId} or profile not found. Error:`, error);
    // Render the NotFound component if profile is not found or there's an error
    return <NotFound />;
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-focus p-8 text-primary-foreground">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <UserAvatar
                  userId={profile.id}
                  src={profile.avatar_url}
                  fallbackText={getInitials(profile.full_name || profile.username)}
                  className="h-24 w-24 md:h-32 md:w-32 border-4 border-background"
                />
                <div className="text-center md:text-left">
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    {profile.full_name || profile.username || 'User Profile'}
                  </CardTitle>
                  {profile.title && (
                    <p className="text-lg opacity-90">{profile.title}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Basic Info */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
                  <UserCircle className="mr-2 h-5 w-5" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  {profile.full_name && (
                    <div>
                      <p className="font-medium text-muted-foreground">Full Name</p>
                      <p>{profile.full_name}</p>
                    </div>
                  )}
                  {profile.username && (
                    <div>
                      <p className="font-medium text-muted-foreground">Username</p>
                      <p>{profile.username}</p>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p>{profile.location}</p>
                    </div>
                  )}
                  {profile.website && (
                    <div className="md:col-span-2 flex items-center">
                      <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {/* Professional Details */}
              {(profile.bio || profile.experience !== undefined || profile.skills) && (
                <section>
                  <h2 className="text-xl font-semibold mb-4 flex items-center text-primary">
                    <Briefcase className="mr-2 h-5 w-5" /> Professional Details
                  </h2>
                  <div className="space-y-4">
                    {profile.bio && (
                      <div>
                        <h3 className="font-medium mb-1 text-muted-foreground flex items-center"><Info className="mr-2 h-4 w-4" /> Bio</h3>
                        <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-line">{profile.bio}</p>
                      </div>
                    )}
                    {profile.experience !== undefined && profile.experience !== null && (
                      <div>
                        <h3 className="font-medium mb-1 text-muted-foreground flex items-center"><Settings className="mr-2 h-4 w-4" /> Experience</h3>
                        <p className="text-sm">{profile.experience} years</p>
                      </div>
                    )}
                    {profile.skills && (
                      <div>
                        <h3 className="font-medium mb-1 text-muted-foreground flex items-center"><Code className="mr-2 h-4 w-4" /> Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.split(',').map((skill, index) => (
                            <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
