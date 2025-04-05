
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Africantechjobs</h4>
            <p className="text-gray-600">
              Your gateway to the best Africa-focused job opportunities across the world.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-job-green">Home</Link>
              </li>
              <li>
                <Link to="/post-job" className="text-gray-600 hover:text-job-green">Post a Job</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-job-green">Pricing</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-600">
              Email: info@africantechjobs.com<br />
              Follow us on Twitter: @africantechjobs
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Africantechjobs. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
