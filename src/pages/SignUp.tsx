
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const SignUp = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      toast({
        title: "CV Uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
      
      navigate('/auth?role=candidate');
    } else {
      toast({
        title: "No file selected",
        description: "Please select a CV file to upload",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInSignUp = () => {
    navigate('/auth?provider=linkedin_oidc');
  };

  const handleEmailSignUp = () => {
    navigate('/auth?tab=signup');
  };

  // Use uploaded image for the carousel
  const carouselImages = [
    "/lovable-uploads/e5694a2a-74ac-4d8c-b3dd-3625fbec54c0.png"
  ];

  return (
    <div className="flex min-h-screen">
      {/* Left side - Logo and image carousel */}
      <div className="w-1/2 bg-gray-100 flex flex-col">
        {/* Logo area */}
        <div className="p-8">
          <img 
            src="/lovable-uploads/bff03cc3-67ae-4b19-b5b5-06a97c28c61a.png" 
            alt="Brand Logo" 
            className="h-8" 
          />
        </div>
        
        {/* Image carousel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Carousel className="h-full" autoplay interval={5000}>
              <CarouselContent className="h-full">
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <AspectRatio ratio={16 / 9} className="h-full">
                      <img 
                        src={image} 
                        alt={`Slide ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          
          {/* Welcome text under carousel */}
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-[#26282B] mb-3 font-helvetica">
              Welcome, you're starting your new career journey here!
            </h1>
            <p className="text-gray-600 font-helvetica">Upload your CV for a quick start.</p>
          </div>
        </div>
      </div>

      {/* Right side - Form placeholder (to be replaced later) */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
              isDragging ? "border-[#007A55] bg-green-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <Upload className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="mb-2 text-sm font-helvetica">Drop your file here or <label htmlFor="cv-upload" className="text-[#3F64DE] cursor-pointer">choose file</label></p>
            <p className="text-xs text-gray-500 font-helvetica">Max 10MB per file</p>
            <input 
              type="file"
              className="hidden"
              id="cv-upload"
              onChange={handleFileChange}
            />
            {file && (
              <div className="mt-4 text-sm text-[#007A55] font-helvetica">
                Selected: {file.name}
              </div>
            )}
          </div>

          <Button 
            onClick={handleUpload}
            className="w-[220px] mx-auto block bg-[#007A55] hover:bg-[#00694A] mb-6 h-12 font-helvetica font-medium"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload
          </Button>

          <div className="text-center mb-6 flex items-center">
            <div className="flex-grow h-px bg-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 font-helvetica">or</span>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleLinkedInSignUp}
            className="w-[220px] mx-auto block mb-4 flex items-center justify-center h-12 border-gray-300 font-helvetica"
          >
            <img src="/lovable-uploads/9405a07c-077e-4655-ba6c-5c796119dfcc.png" alt="LinkedIn" className="h-5 w-5 mr-2" />
            Continue with LinkedIn
          </Button>

          <Button 
            variant="outline" 
            onClick={handleEmailSignUp}
            className="w-[220px] mx-auto block mb-8 flex items-center justify-center h-12 border-gray-300 font-helvetica"
          >
            <img src="/lovable-uploads/b725dadd-2089-4320-94b3-9bd8af324d78.png" alt="Email" className="h-5 w-5 mr-2" />
            Sign up with email
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 font-helvetica">
              Already have an account? <Link to="/auth" className="text-[#007A55] font-medium">click here to login</Link>
            </p>
          </div>

          <div className="text-xs text-gray-500 text-center mt-8 font-helvetica">
            By signing up, you are creating an account and agree to our Terms and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
