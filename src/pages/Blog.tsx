
import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Loader2 } from 'lucide-react';
import BlogSearch from '@/components/blog/BlogSearch';
import BlogCategories from '@/components/blog/BlogCategories';
import BlogCard from '@/components/blog/BlogCard';
import BlogPagination from '@/components/blog/BlogPagination';
import BlogSEO from '@/components/blog/BlogSEO';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
  profiles: {
    full_name: string | null;
  } | null;
  category?: string;
}

// Mock categories - in a real implementation, you would fetch these from the database
const BLOG_CATEGORIES = [
  { name: 'Tech News' },
  { name: 'Career Advice' },
  { name: 'Tutorials' },
  { name: 'Industry Trends' },
  { name: 'Interviews' }
];

const POSTS_PER_PAGE = 6;

const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'));

  // Calculate total pages
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Update URL when filters change
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (activeCategory) params.set('category', activeCategory);
    
    setSearchParams(params);
  }, [searchQuery, currentPage, activeCategory, setSearchParams]);

  // Fetch posts based on filters
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching blog posts...');
      
      // Calculate pagination offsets
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      // Start building the query
      let query = supabase
        .from('posts')
        .select(`
          id, 
          title, 
          content, 
          created_at, 
          updated_at, 
          user_id,
          is_published,
          profiles (full_name)
        `, { count: 'exact' })
        .eq('is_published', true);
      
      // Add search filter if search query exists
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      // Add pagination
      query = query.order('created_at', { ascending: false })
        .range(from, to);
      
      const { data, error, count } = await query;
      
      console.log('Blog posts query result:', { data, error, count });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      // Update posts and total count
      setPosts(data || []);
      if (count !== null) setTotalPosts(count);
      
      console.log('Successfully loaded posts:', data?.length || 0);
      
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, activeCategory]);

  // Effect to fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  // Effect to update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory(null);
    setCurrentPage(1);
  };

  // Assign mock categories to posts (in a real implementation, posts would have categories)
  const postsWithCategories = posts.map((post, index) => ({
    ...post,
    category: BLOG_CATEGORIES[index % BLOG_CATEGORIES.length].name
  }));

  console.log('Blog component render state:', { loading, error, postsCount: posts.length });

  return (
    <div className="min-h-screen flex flex-col">
      <BlogSEO 
        title="AfricanTechJobs Blog"
        description="Insights, tips and trends for the African tech community"
        url="https://africantechjobs.com/blog"
        type="website"
      />

      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">AfricanTechJobs Blog</h1>
          <p className="text-gray-600 mb-6">Insights, tips and trends for the African tech community</p>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <BlogSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
            />
            
            {(searchQuery || activeCategory) && (
              <Button 
                variant="ghost" 
                onClick={handleResetFilters}
                size="sm"
                className="whitespace-nowrap"
              >
                Clear filters
              </Button>
            )}
          </div>
          
          <BlogCategories 
            categories={BLOG_CATEGORIES}
            activeCategory={activeCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading blog posts...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-red-500 text-lg mb-2">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchPosts()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl mb-2">No blog posts found</p>
            <p className="text-muted-foreground mb-8">
              {searchQuery || activeCategory ? 
                'Try adjusting your search filters.' : 
                'Check back soon for new content!'}
            </p>
            
            {(searchQuery || activeCategory) && (
              <Button onClick={handleResetFilters}>Clear All Filters</Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {postsWithCategories.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <BlogPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;
