
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-job-green py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Text content centered */}
          <div className="text-white text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Africa-focused job<br />opportunities worldwide
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Sponsored and Remote jobs in the UK, US, Canada and more
            </p>
            <Button size="lg" className="bg-white hover:bg-gray-100 text-job-green hover:text-job-darkGreen">
              <Link to="/pricing">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
