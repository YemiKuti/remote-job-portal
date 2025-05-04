
import React from 'react';
import { Button } from "@/components/ui/button";

type Category = {
  name: string;
  count?: number;
};

interface BlogCategoriesProps {
  categories: Category[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const BlogCategories: React.FC<BlogCategoriesProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button 
        variant={activeCategory === null ? "secondary" : "outline"}
        onClick={() => onSelectCategory(null)}
        size="sm"
      >
        All
      </Button>
      {categories.map((category) => (
        <Button
          key={category.name}
          variant={activeCategory === category.name ? "secondary" : "outline"}
          onClick={() => onSelectCategory(category.name)}
          size="sm"
        >
          {category.name}
          {category.count !== undefined && (
            <span className="ml-1 text-xs rounded-full bg-muted px-1.5 py-0.5">
              {category.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default BlogCategories;
