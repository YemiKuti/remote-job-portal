
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c3d4b18f-b8eb-4077-bed6-b984759a5c02.png" 
              alt="Africantechjobs Logo" 
              className="h-12 mr-2" 
            />
          </Link>
          <div className="flex gap-2 sm:gap-4">
            <Button variant="outline" size="sm" className="border-job-green text-job-green hover:bg-job-hover">
              <Link to="/blog">Blog</Link>
            </Button>
            <Button variant="outline" size="sm" className="border-job-green text-job-green hover:bg-job-hover">
              <Link to="/job-scraper">Scraper Tool</Link>
            </Button>
            <Button variant="outline" size="sm" className="border-job-green text-job-green hover:bg-job-hover">
              <Link to="/post-job">Post a Job</Link>
            </Button>
            <Button size="sm" className="bg-job-green hover:bg-job-darkGreen">
              <Link to="/pricing">Subscribe</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
