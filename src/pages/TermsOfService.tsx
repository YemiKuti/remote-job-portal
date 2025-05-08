
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <div className="prose max-w-none">
              <p className="mb-4">Last Updated: May 8, 2025</p>

              <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using the AfricanTechJobs website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, you should not access or use our services.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                AfricanTechJobs provides a platform connecting job seekers with employers offering tech opportunities related to Africa. Our services include job listings, job applications, employer profiles, and career resources.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of our service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
              <p className="mb-4">
                You agree to provide accurate and current information during the registration process and to update such information to keep it accurate and current.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
              <p className="mb-4">When using our services, you agree not to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-2">Post false, inaccurate, misleading, or fraudulent content</li>
                <li className="mb-2">Impersonate any person or entity</li>
                <li className="mb-2">Harass, abuse, or harm another person</li>
                <li className="mb-2">Use our services for any illegal purpose</li>
                <li className="mb-2">Attempt to gain unauthorized access to our systems</li>
                <li className="mb-2">Interfere with or disrupt the integrity of our services</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">5. Content</h2>
              <p className="mb-4">
                Users are solely responsible for the content they submit to our platform, including resumes, job listings, and communications. We reserve the right to remove content that violates these Terms or that we determine, in our sole discretion, is harmful, offensive, or otherwise inappropriate.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">6. Intellectual Property Rights</h2>
              <p className="mb-4">
                All content included on the website, such as text, graphics, logos, and software, is the property of AfricanTechJobs or its content suppliers and is protected by copyright laws. You may not copy, reproduce, modify, or distribute any content from our website without our prior written consent.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, AfricanTechJobs shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, our services.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any significant changes by posting a notice on our website. Your continued use of our services after such modifications constitutes your acceptance of the revised Terms.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AfricanTechJobs is registered, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at legal@africantechjobs.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
