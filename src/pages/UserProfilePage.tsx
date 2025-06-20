
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicProfileById, fetchCandidateResumes, PublicProfileData, Resume } from '@/utils/api/profileApi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Briefcase, Link as LinkIcon, UserCircle, Info, Settings, Code, Calendar, Star, Award, FileText, Download, Eye } from 'lucide-react';
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

  const { data: resumes = [], isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ['candidateResumes', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return fetchCandidateResumes(userId);
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

  // More strict profile completeness check - require substantial information across multiple areas
  const hasBasicInfo = !!(profile.full_name && profile.username);
  const hasProfessionalInfo = !!(profile.title && profile.bio && profile.skills && (profile.experience !== undefined && profile.experience !== null));
  const hasContactInfo = !!(profile.location && profile.website);
  
  // A profile is considered complete only if it has ALL basic info AND substantial professional info AND contact info
  const hasComprehensiveProfile = hasBasicInfo && hasProfessionalInfo && hasContactInfo;
  
  // Check if profile has at least some meaningful content
  const hasMinimalProfileData = profile.full_name || profile.username || profile.bio || profile.skills || profile.title || profile.location;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadResume = (resume: Resume) => {
    // In a real implementation, this would handle secure file download
    alert(`Resume download would be implemented with proper security. File: ${resume.name}`);
  };

  const handleViewResume = (resume: Resume) => {
    // In a real implementation, this would open the resume in a viewer
    alert(`Resume viewer would be implemented. File: ${resume.name}`);
  };

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
                  {hasComprehensiveProfile && (
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

              {/* Professional Information Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                    <Briefcase className="mr-2 h-5 w-5 text-purple-600" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.title && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Current Title</h4>
                        <p className="text-gray-900">{profile.title}</p>
                      </div>
                    )}
                    
                    {profile.experience !== undefined && profile.experience !== null && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Experience Level</h4>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="text-gray-900">
                            {profile.experience === 0 ? 'Entry Level' :
                             profile.experience <= 2 ? 'Junior Level' :
                             profile.experience <= 5 ? 'Mid Level' :
                             profile.experience <= 8 ? 'Senior Level' : 'Expert Level'}
                            {' '}({profile.experience} years)
                          </span>
                        </div>
                      </div>
                    )}

                    {profile.location && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Location</h4>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{profile.location}</span>
                        </div>
                      </div>
                    )}

                    {profile.website && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Website</h4>
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{profile.website}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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

              {/* Resume/CV Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center text-gray-800">
                    <FileText className="mr-2 h-5 w-5 text-red-600" />
                    Resume / CV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {resumesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Loading resumes...</span>
                    </div>
                  ) : resumes.length > 0 ? (
                    <div className="space-y-4">
                      {resumes.map((resume) => (
                        <div key={resume.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-8 w-8 text-red-500" />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-900">{resume.name}</span>
                                  {resume.is_default && (
                                    <Badge variant="secondary" className="text-xs">Default</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatFileSize(resume.file_size)} • Uploaded {new Date(resume.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResume(resume)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadResume(resume)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 font-medium">No Resume Available</p>
                      <p className="text-sm text-gray-400">This candidate hasn't uploaded a resume yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Empty State for Incomplete Profile */}
              {!hasMinimalProfileData && resumes.length === 0 && (
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

                  {resumes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Available Documents</p>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="text-gray-800">{resumes.length} Resume{resumes.length > 1 ? 's' : ''}</span>
                      </div>
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

              {/* Profile Completeness - Only show for truly comprehensive profiles */}
              {hasComprehensiveProfile && (
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
