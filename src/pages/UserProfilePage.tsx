
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicProfileById, PublicProfileData } from '@/utils/api/profileApi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Briefcase, Link as LinkIcon, UserCircle, Info, Settings, Code, Calendar, Star, Award } from 'lucide-react';
import NotFound from './NotFound';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  
  const { data: profile, isLoading, error, isError } = useQuery<PublicProfileData | null>({
    queryKey: ['publicProfile', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(null);
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
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading candidate profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !profile) {
    console.error(`Error loading profile for ${userId} or profile not found. Error:`, error);
    return <NotFound />;
  }
  
  const getInitials = (name?: string) => {
    if (!name) return 'P';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const hasProfileData = profile.full_name || profile.username || profile.bio || profile.skills || profile.experience !== undefined;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Header Card */}
          <Card className="overflow-hidden shadow-xl mb-8 border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <UserAvatar
                    userId={profile.id}
                    fallbackText={getInitials(profile.full_name || profile.username)}
                    className="h-28 w-28 md:h-36 md:w-36 border-4 border-white/20 shadow-2xl"
                  />
                  {hasProfileData && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-3 border-white">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center md:text-left flex-1">
                  <CardTitle className="text-3xl md:text-4xl font-bold mb-2">
                    {profile.full_name || profile.username || 'Candidate Profile'}
                  </CardTitle>
                  {profile.title && (
                    <p className="text-xl opacity-90 mb-3">{profile.title}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm opacity-80">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.experience !== undefined && profile.experience !== null && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{profile.experience} years experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Available for opportunities</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              {profile.bio && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Info className="mr-2 h-5 w-5 text-blue-600" /> 
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills Section */}
              {profile.skills && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                      <Code className="mr-2 h-5 w-5 text-green-600" /> 
                      Skills & Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.split(',').map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="px-3 py-1 text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State for Incomplete Profile */}
              {!hasProfileData && (
                <Card className="shadow-lg border-0">
                  <CardContent className="text-center py-12">
                    <UserCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Profile In Progress</h3>
                    <p className="text-gray-500">
                      This candidate is still building their profile. Check back later for more details.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
                    <UserCircle className="mr-2 h-5 w-5 text-purple-600" /> 
                    Quick Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.username && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Username</p>
                      <p className="text-gray-800">@{profile.username}</p>
                    </div>
                  )}
                  
                  {profile.experience !== undefined && profile.experience !== null && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Experience Level</p>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-800">
                          {profile.experience === 0 ? 'Entry Level' :
                           profile.experience <= 2 ? 'Junior Level' :
                           profile.experience <= 5 ? 'Mid Level' :
                           profile.experience <= 8 ? 'Senior Level' : 'Expert Level'}
                        </span>
                      </div>
                    </div>
                  )}

                  {profile.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 break-all transition-colors"
                      >
                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{profile.website}</span>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Interested in this candidate?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect through your hiring platform or reach out directly to discuss opportunities.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500">
                      Profile ID: {profile.id.slice(0, 8)}...
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completeness */}
              {hasProfileData && (
                <Card className="shadow-lg border-0 bg-green-50 border border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-green-800">
                      <Star className="h-5 w-5" />
                      <span className="font-semibold">Complete Profile</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      This candidate has provided comprehensive profile information.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
