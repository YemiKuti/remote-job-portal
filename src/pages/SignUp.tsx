
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Upload, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
      // In a real application, you would upload the file to your server here
      toast({
        title: "CV Uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
      
      // After successful upload, navigate to the registration form
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md mx-auto w-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, you're starting your new career journey here!
            </h1>
            <p className="text-gray-600">Upload your CV for a quick start.</p>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center ${
              isDragging ? "border-job-green bg-green-50" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8.414l-4-4H4zm0 2h8v2h2v-0.586L8.414 6H4v0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="mb-2 text-sm">Drop your file here or <span className="text-blue-500 cursor-pointer">choose file</span></p>
            <p className="text-xs text-gray-500">Max 10MB per file</p>
            <input 
              type="file"
              className="hidden"
              id="cv-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <span className="sr-only">Choose file</span>
            </label>
            {file && (
              <div className="mt-4 text-sm text-job-green">
                Selected: {file.name}
              </div>
            )}
          </div>

          <Button 
            onClick={handleUpload}
            className="w-full bg-job-green hover:bg-job-darkGreen mb-4 h-12"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload
          </Button>

          <div className="text-center mb-4">or</div>

          <Button 
            variant="outline" 
            onClick={handleLinkedInSignUp}
            className="w-full mb-4 flex items-center justify-center h-12 border-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#0077B5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
            Continue with LinkedIn
          </Button>

          <Button 
            variant="outline" 
            onClick={handleEmailSignUp}
            className="w-full mb-6 flex items-center justify-center h-12 border-gray-300"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign up with email
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link to="/auth" className="text-job-green font-medium">click here to login</Link>
            </p>
          </div>

          <div className="text-xs text-gray-500 text-center mt-8">
            By signing up, you are creating an account and agree to our Terms and Privacy Policy
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
