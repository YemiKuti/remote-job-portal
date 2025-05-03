
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Facebook, Linkedin, Globe, Share } from "lucide-react";

const PostJob = () => {
  const [selectedTab, setSelectedTab] = useState("post");

  const handlePostJob = () => {
    toast.info("The job posting functionality will be implemented in a future update.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-job-blue to-job-lightBlue py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Post a Remote Job
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Reach thousands of qualified remote candidates from around the world
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="post" value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="post">Post a Job</TabsTrigger>
                <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                <TabsTrigger value="company">Company Profile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="post">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6">
                      Our job posting functionality is currently under development. Check back soon to post your remote job opportunities!
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="font-semibold mb-2">Multiple Application Options</h3>
                        <p className="text-sm text-gray-600 mb-4">Allow candidates to apply through multiple channels:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-white rounded border border-gray-200 text-center">
                            <span className="block text-job-blue font-medium">Internal</span>
                            <span className="text-xs text-gray-500">via our platform</span>
                          </div>
                          <div className="p-3 bg-white rounded border border-gray-200 text-center">
                            <span className="block text-job-blue font-medium">External URL</span>
                            <span className="text-xs text-gray-500">your career site</span>
                          </div>
                          <div className="p-3 bg-white rounded border border-gray-200 text-center">
                            <span className="block text-job-blue font-medium">Email</span>
                            <span className="text-xs text-gray-500">direct email</span>
                          </div>
                          <div className="p-3 bg-white rounded border border-gray-200 text-center">
                            <span className="block text-job-blue font-medium">Phone</span>
                            <span className="text-xs text-gray-500">direct call</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="font-semibold mb-2">Application Deadline Setting</h3>
                        <p className="text-sm text-gray-600">Set deadlines to create urgency and manage your hiring pipeline efficiently.</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <h3 className="font-semibold mb-2">Social Media Sharing</h3>
                        <p className="text-sm text-gray-600 mb-3">Expand your reach by sharing your job posting across platforms:</p>
                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Facebook className="mr-2 h-4 w-4" />
                            Facebook
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Linkedin className="mr-2 h-4 w-4" />
                            LinkedIn
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Share className="mr-2 h-4 w-4" />
                            Others
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        className="bg-job-blue hover:bg-job-darkBlue" 
                        onClick={handlePostJob}
                      >
                        Notify Me When Available
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Employer Subscription Plans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-xl font-bold mb-2">Basic</h3>
                        <div className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal text-gray-500">/month</span></div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>5 Job Postings</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>1 Featured Job</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Basic Analytics</span>
                          </li>
                        </ul>
                        <Button className="w-full">Subscribe</Button>
                      </div>
                      
                      <div className="border-2 border-job-blue rounded-lg p-6 bg-white shadow-md relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-job-blue text-white px-3 py-1 rounded text-sm font-medium">Popular</div>
                        <h3 className="text-xl font-bold mb-2">Pro</h3>
                        <div className="text-3xl font-bold mb-4">$199<span className="text-sm font-normal text-gray-500">/month</span></div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>15 Job Postings</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>3 Featured Jobs</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Advanced Analytics</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Candidate Management</span>
                          </li>
                        </ul>
                        <Button className="w-full bg-job-blue hover:bg-job-darkBlue">Subscribe</Button>
                      </div>
                      
                      <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                        <div className="text-3xl font-bold mb-4">$399<span className="text-sm font-normal text-gray-500">/month</span></div>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Unlimited Job Postings</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>10 Featured Jobs</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Premium Analytics</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Priority Support</span>
                          </li>
                          <li className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <span>Branded Company Page</span>
                          </li>
                        </ul>
                        <Button className="w-full">Subscribe</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Company Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-gray-600">
                        Create a compelling company profile to attract top talent. Showcase your company culture, values, and benefits.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h3 className="text-xl font-semibold mb-4">Profile Features</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Company description and mission</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Photo gallery and team highlights</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Benefits and perks showcase</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Company culture and values</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h3 className="text-xl font-semibold mb-4">Benefits of a Great Profile</h3>
                          <ul className="space-y-3">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Attract higher quality candidates</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Reduce time-to-hire</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Improve candidate fit with your culture</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Enhance your employer brand</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mt-4">
                        <Button className="bg-job-blue hover:bg-job-darkBlue">
                          Create Company Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Why Post With Us?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Reach thousands of remote professionals</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Simple, streamlined posting process</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Targeted audience of remote workers</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Our Audience</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Experienced remote professionals</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Global talent pool from 100+ countries</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-job-blue" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Skilled in the latest technologies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* GDPR-compliant cookie notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 md:w-3/4">
            <p>
              We use cookies to enhance your experience on our website. By continuing to browse, you agree to our{' '}
              <a href="#" className="text-job-blue hover:underline">Cookie Policy</a>. You can manage your preferences at any time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Manage Preferences</Button>
            <Button size="sm" className="bg-job-green hover:bg-job-darkGreen">Accept All</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
