
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose max-w-none">
              <p className="mb-4">Last Updated: May 8, 2025</p>

              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>
                This Privacy Policy explains how AfricanTechJobs ("we", "our", or "us") collects, uses, shares, and protects your personal information when you visit our website or use our services. We are committed to protecting your privacy and ensuring you have a positive experience on our website.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect several types of information from and about users of our website, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Personal information such as name, email address, phone number, and resume when you create an account or apply for jobs</li>
                <li className="mb-2">Professional information including work history, education, skills, and qualifications</li>
                <li className="mb-2">Log data and usage information collected automatically when you visit our site</li>
                <li className="mb-2">Information about your device and internet connection</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Provide and improve our services</li>
                <li className="mb-2">Process job applications</li>
                <li className="mb-2">Connect job seekers with employers</li>
                <li className="mb-2">Send notifications about relevant job opportunities</li>
                <li className="mb-2">Communicate with you about your account or our services</li>
                <li className="mb-2">Analyze usage patterns to improve user experience</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
              <p className="mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Employers when you apply for their job listings</li>
                <li className="mb-2">Service providers who perform services on our behalf</li>
                <li className="mb-2">Law enforcement agencies when required by law</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">5. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, delete, or restrict processing of your data. To exercise these rights, please contact us at privacy@africantechjobs.com.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@africantechjobs.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
