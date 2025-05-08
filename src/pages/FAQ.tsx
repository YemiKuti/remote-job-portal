
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqItems = [
    {
      question: "What is AfricanTechJobs?",
      answer: "AfricanTechJobs is a platform dedicated to connecting tech professionals with Africa-focused job opportunities across the world. We curate jobs specifically for the African tech ecosystem, whether they're located in Africa or are remote positions that welcome African talent."
    },
    {
      question: "How do I apply for a job?",
      answer: "To apply for a job, simply browse our listings and click on the job that interests you. Each job posting includes an 'Apply Now' button that will either direct you to the company's application system or allow you to apply directly through our platform."
    },
    {
      question: "Is there a cost to use AfricanTechJobs?",
      answer: "Basic job searching is free for all job seekers. For additional features like unlimited job search results and advanced filtering, we offer premium subscription plans. Employers can post jobs for free with basic listings, or choose paid plans for featured listings and additional recruitment tools."
    },
    {
      question: "How do I post a job on AfricanTechJobs?",
      answer: "Employers can create an account and post jobs by visiting the 'Employer' section of our site. After signing up, you'll be able to create job listings, manage applications, and access various recruitment tools based on your subscription level."
    },
    {
      question: "Can I search for remote jobs specifically?",
      answer: "Yes! Our advanced search filters allow you to specifically search for remote positions. Many of our listed jobs offer remote work options that are available to professionals across Africa and the African diaspora."
    },
    {
      question: "How can I stay updated on new job postings?",
      answer: "You can subscribe to our newsletter to receive regular updates on new job postings that match your skills and interests. Additionally, creating an account allows you to set up job alerts for specific criteria."
    },
    {
      question: "Does AfricanTechJobs offer career resources?",
      answer: "Yes, we provide various career resources through our blog, including resume tips, interview preparation guidance, and insights into the African tech ecosystem. These resources are designed to help you advance your tech career within the African context."
    },
    {
      question: "How can I contact the support team?",
      answer: "You can reach our support team by emailing info@africantechjobs.com. We aim to respond to all inquiries within 48 hours."
    }
  ];

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
            
            <Accordion type="single" collapsible className="bg-white rounded-lg shadow-md p-6">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-medium">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-gray-700">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-10 text-center">
              <p className="text-gray-600">
                Still have questions? Contact us at <a href="mailto:info@africantechjobs.com" className="text-job-blue hover:underline">info@africantechjobs.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
