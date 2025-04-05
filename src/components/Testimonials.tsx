
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  id: number;
  name: string;
  title: string;
  content: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Bodunde",
    title: "Found my tribe",
    content: "I had struggled to find job opportunities that matched my expertise but this platform helped me find numerous businesses who valued my experience and understanging of the African market. Highly recommended!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Jason",
    title: "Discovered top talent",
    content: "AfricanTechJobs.co.uk has emerged as an ideal solution for our hiring demands. The platform facilitated swift connection with candidates possessing the specific mix of technical skills and market insight we sought.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Chiedza",
    title: "The platform is awesome",
    content: "The website helped me overcome the frustrations of continuous job rejections. I found the platform incredibly user-friendly and efficient in landing my dream job. Glad to be helping empower the continent",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?fit=crop&w=800&q=80"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Customers Are Saying</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="mb-4">
                    <Avatar className="h-16 w-16 border-2 border-job-green">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} className="object-cover" />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.title}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-center">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
