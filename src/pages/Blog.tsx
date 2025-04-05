
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Top 10 Tech Skills in Demand Across Africa",
    excerpt: "Discover the most sought-after technical skills that employers are looking for in the African tech ecosystem.",
    author: "Samuel Olanrewaju",
    date: "April 3, 2025",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 2,
    title: "How to Prepare for Technical Interviews",
    excerpt: "Expert tips on acing your next technical interview with African tech companies.",
    author: "Amina Khalid",
    date: "March 28, 2025",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Remote Work Opportunities for African Developers",
    excerpt: "Learn about the growing trend of remote work and how African developers can take advantage.",
    author: "David Mensah",
    date: "March 20, 2025",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 4,
    title: "Building Your Tech Portfolio: A Guide for African Developers",
    excerpt: "How to create an impressive portfolio that showcases your skills to potential employers.",
    author: "Ngozi Okonkwo",
    date: "March 15, 2025",
    imageUrl: "/placeholder.svg"
  }
];

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-job-green mb-2">AfricanTechJobs Blog</h1>
          <p className="text-gray-600">Insights, tips and trends for the African tech community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="h-40 bg-gray-200 rounded-t-lg mb-4"></div>
                <CardTitle className="text-xl hover:text-job-green transition-colors">{post.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  By {post.author} • {post.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.excerpt}</p>
                <button className="mt-4 text-job-green hover:text-job-darkGreen font-medium">
                  Read more →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
