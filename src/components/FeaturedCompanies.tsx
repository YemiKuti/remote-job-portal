
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const companyLogos = [
  {
    id: 1,
    name: "SmileID",
    logo: "/lovable-uploads/5cc72427-a1c8-44ad-9de1-14e88a1efbfa.png"
  },
  {
    id: 2,
    name: "LEMI",
    logo: "/lovable-uploads/9f7cc61f-374d-4a05-9681-cc9c3f780b37.png"
  },
  {
    id: 3,
    name: "FirstBank UK",
    logo: "/lovable-uploads/2b0fb428-f8f7-4252-a66a-2fd35c22ad60.png"
  },
  {
    id: 4,
    name: "UBA UK",
    logo: "/lovable-uploads/2e5980fc-7922-4b79-9d52-3107161a2f9d.png"
  },
  {
    id: 5,
    name: "Seamfix",
    logo: "/lovable-uploads/b20586f5-af75-4873-9c17-dd9fbf6d013b.png"
  },
  {
    id: 6,
    name: "Verto",
    logo: "/lovable-uploads/7a6b753c-0f66-4ec9-a44b-9fa91ef02e8f.png"
  },
  {
    id: 7,
    name: "Flutterwave",
    logo: "/lovable-uploads/7f1966e7-b0e9-4a35-a0e2-147d15722478.png"
  }
];

const FeaturedCompanies: React.FC = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-center text-job-green">Featured Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {companyLogos.map((company) => (
            <div 
              key={company.id} 
              className="flex items-center justify-center p-2 bg-white rounded-md border hover:shadow-md transition-shadow duration-200"
            >
              <img 
                src={company.logo} 
                alt={`${company.name} logo`} 
                className="h-12 object-contain" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedCompanies;
