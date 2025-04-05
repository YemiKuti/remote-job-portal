
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { BarChart, PieChart, LineChart, Line, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Users, 
  BarChart2, 
  Settings, 
  Database, 
  Calendar,
  Search,
  Download,
  Layers,
  Clock,
  RefreshCw
} from "lucide-react";
import { Job } from "@/types";
import { jobs } from "@/data/jobs";
import { ScraperSettings } from "@/types/scraper";
import { mockScrapedJobs } from "@/utils/scraper-utils";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for demonstration
  const recentSearches = [
    { id: 1, keywords: "developer, React", companies: "Google, Microsoft", date: "2025-04-05", results: 42 },
    { id: 2, keywords: "AI, machine learning", companies: "OpenAI, DeepMind", date: "2025-04-04", results: 28 },
    { id: 3, keywords: "blockchain, web3", companies: "", date: "2025-04-03", results: 15 },
    { id: 4, keywords: "African developers", companies: "", date: "2025-04-02", results: 63 },
    { id: 5, keywords: "DevOps engineer", companies: "Amazon, IBM", date: "2025-04-01", results: 37 },
  ];

  const userActivity = [
    { id: 1, user: "john@example.com", searches: 24, downloads: 8, lastActive: "2025-04-05" },
    { id: 2, user: "sarah@example.com", searches: 18, downloads: 5, lastActive: "2025-04-04" },
    { id: 3, user: "michael@example.com", searches: 32, downloads: 12, lastActive: "2025-04-05" },
    { id: 4, user: "emma@example.com", searches: 9, downloads: 2, lastActive: "2025-04-03" },
    { id: 5, user: "david@example.com", searches: 27, downloads: 9, lastActive: "2025-04-05" },
  ];

  const sourceData = [
    { name: 'LinkedIn', value: 45 },
    { name: 'Indeed', value: 30 },
    { name: 'Glassdoor', value: 15 },
    { name: 'Monster', value: 10 },
  ];

  const weeklySearches = [
    { name: 'Mon', searches: 12 },
    { name: 'Tue', searches: 19 },
    { name: 'Wed', searches: 15 },
    { name: 'Thu', searches: 22 },
    { name: 'Fri', searches: 30 },
    { name: 'Sat', searches: 8 },
    { name: 'Sun', searches: 5 },
  ];

  const monthlyStats = [
    { name: 'Jan', searches: 65, exports: 22 },
    { name: 'Feb', searches: 78, exports: 28 },
    { name: 'Mar', searches: 90, exports: 35 },
    { name: 'Apr', searches: 120, exports: 48 },
  ];

  const jobCategories = [
    { name: 'Engineering', value: 35 },
    { name: 'Design', value: 20 },
    { name: 'Marketing', value: 15 },
    { name: 'Product', value: 10 },
    { name: 'Data Science', value: 20 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing dashboard data...");
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard data refreshed successfully");
    }, 1500);
  };

  const handleExportData = (type: string) => {
    toast.success(`${type} data export initiated. Check your downloads folder.`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-job-green">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor and manage your job scraping operations</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="bg-job-green hover:bg-job-darkGreen">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs Scraped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Database className="mr-2 h-4 w-4 text-job-green" />
                <span className="text-2xl font-bold">12,486</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+124 since yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-job-green" />
                <span className="text-2xl font-bold">254</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+12 new this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Searches Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-job-green" />
                <span className="text-2xl font-bold">78</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">+18% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Download className="mr-2 h-4 w-4 text-job-green" />
                <span className="text-2xl font-bold">32</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Today's downloads</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="searches">Recent Searches</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Searches by Day</CardTitle>
                  <CardDescription>Number of searches performed over the past week</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklySearches}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="searches" fill="#4ade80" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Data Sources</CardTitle>
                  <CardDescription>Distribution of job sources</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Searches and exports by month</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="searches" stroke="#4ade80" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="exports" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                  <CardDescription>Distribution by job category</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {jobCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => handleExportData('CSV')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
              <Button variant="outline" onClick={() => handleExportData('PDF')}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="searches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Search Queries</CardTitle>
                <CardDescription>Latest job search operations and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Keywords</TableHead>
                      <TableHead>Companies</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Results</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSearches.map((search) => (
                      <TableRow key={search.id}>
                        <TableCell className="font-medium">{search.id}</TableCell>
                        <TableCell>{search.keywords}</TableCell>
                        <TableCell>{search.companies || "Any"}</TableCell>
                        <TableCell>{search.date}</TableCell>
                        <TableCell className="text-right">{search.results}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View All</Button>
                <Button onClick={() => handleExportData('Searches')}>Export Data</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Monitor user engagement with the scraper tool</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Searches</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivity.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.user}</TableCell>
                        <TableCell>{user.searches}</TableCell>
                        <TableCell>{user.downloads}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View All Users</Button>
                <Button onClick={() => handleExportData('User Activity')}>Export Data</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure scraper operation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Default Scraper Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure default parameters for all scraper operations</p>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Default Settings
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">API Configuration</h3>
                    <p className="text-sm text-muted-foreground">Manage API keys and endpoints for job sources</p>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Configure APIs
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Scheduling</h3>
                    <p className="text-sm text-muted-foreground">Set up automatic scraping schedules</p>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Tasks
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Data Management</h3>
                    <p className="text-sm text-muted-foreground">Manage storage and retention policies</p>
                    <Button variant="outline" className="w-full justify-start">
                      <Layers className="mr-2 h-4 w-4" />
                      Data Policies
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-job-green hover:bg-job-darkGreen">Save All Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
