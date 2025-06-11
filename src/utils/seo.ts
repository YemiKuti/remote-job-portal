
// SEO utilities for job postings
export const seoHelpers = {
  // Generate structured data for job posting
  generateJobStructuredData: (job: any) => {
    return {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      identifier: {
        '@type': 'PropertyValue',
        name: job.company,
        value: job.id
      },
      datePosted: job.created_at || job.postedDate,
      validThrough: job.expires_at,
      employmentType: job.employment_type?.toUpperCase() || 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        sameAs: job.company_website
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location
        }
      },
      baseSalary: job.salary_min && job.salary_max ? {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency || 'USD',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: 'YEAR'
        }
      } : undefined
    };
  },

  // Generate meta tags for job posting
  generateJobMetaTags: (job: any) => {
    const title = `${job.title} at ${job.company} | Remote Job Board`;
    const description = job.description?.substring(0, 160) + '...';
    
    return {
      title,
      description,
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:url': `${window.location.origin}/jobs/${job.id}`,
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description
    };
  },

  // Generate sitemap entry
  generateSitemapEntry: (job: any) => {
    return {
      url: `/jobs/${job.id}`,
      lastModified: job.updated_at || job.created_at,
      changeFrequency: 'weekly',
      priority: 0.8
    };
  }
};

// Update document head with meta tags
export const updateMetaTags = (tags: Record<string, string>) => {
  Object.entries(tags).forEach(([name, content]) => {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        meta.setAttribute('property', name);
      } else {
        meta.setAttribute('name', name);
      }
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
};

// Add structured data to page
export const addStructuredData = (data: any) => {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  if (!script) {
    script = document.createElement('script') as HTMLScriptElement;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};
