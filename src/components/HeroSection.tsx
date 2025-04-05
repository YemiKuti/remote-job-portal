
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-br from-job-green to-job-lightGreen py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Africa-focused Job Opportunities Worldwide
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Sponsored and Remote Jobs in the UK, US, Canada and more
            </p>
            <Button size="lg" className="bg-white hover:bg-gray-100 text-job-green hover:text-job-darkGreen">
              <Link to="/pricing">Get Started</Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="relative overflow-hidden rounded-lg shadow-xl w-full max-w-lg">
              <img
                src="/lovable-uploads/10546286-a51b-4135-b6b2-2176e520e068.png"
                alt="Professional team of African tech professionals"
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
