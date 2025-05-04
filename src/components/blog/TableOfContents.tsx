
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from markdown content
  useEffect(() => {
    // Regular expression to match markdown headings
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const headings: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      if (level >= 2 && level <= 4) {
        headings.push({ id, text, level });
      }
    }

    setToc(headings);
  }, [content]);

  // Track active heading based on scroll position
  useEffect(() => {
    if (toc.length === 0) return;
    
    const handleScroll = () => {
      const headingElements = toc.map(item => 
        document.getElementById(item.id)
      ).filter(Boolean);
      
      let activeHeading = headingElements[0]?.id || '';
      
      const scrollPos = window.scrollY + 100;
      
      for (const headingElement of headingElements) {
        if (!headingElement) continue;
        
        if (headingElement.offsetTop <= scrollPos) {
          activeHeading = headingElement.id;
        } else {
          break;
        }
      }
      
      setActiveId(activeHeading);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  if (toc.length < 3) return null;

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <h3 className="text-sm font-bold mb-3">Table of Contents</h3>
      <nav>
        <ul className="space-y-1 text-sm">
          {toc.map((item) => (
            <li 
              key={item.id} 
              style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    window.scrollTo({
                      top: element.offsetTop - 80, // Adjust for header height
                      behavior: 'smooth'
                    });
                  }
                }}
                className={cn(
                  "block py-1 hover:text-primary transition-colors truncate",
                  activeId === item.id ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
