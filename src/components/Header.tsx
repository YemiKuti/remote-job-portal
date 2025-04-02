
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-job-blue">RemoteJobBoard</h1>
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" className="border-job-blue text-job-blue hover:bg-job-hover">
              <Link to="/post-job">Post a Job</Link>
            </Button>
            <Button className="bg-job-blue hover:bg-job-darkBlue">
              <Link to="/pricing">Subscribe</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
