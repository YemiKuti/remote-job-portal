
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BlogSEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  keywords?: string[];
}

const BlogSEO: React.FC<BlogSEOProps> = ({
  title,
  description = "AfricanTechJobs Blog - Insights and trends for the African tech community",
  image = "/lovable-uploads/c3d4b18f-b8eb-4077-bed6-b984759a5c02.png",
  url,
  type = "article",
  publishedTime,
  modifiedTime,
  authorName,
  keywords = [],
}) => {
  const siteName = "AfricanTechJobs Blog";
  const twitterHandle = "@africantechjobs";
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{`${title} | ${siteName}`}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article Specific Tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {authorName && <meta property="article:author" content={authorName} />}
      
      {/* Additional Tags */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default BlogSEO;
