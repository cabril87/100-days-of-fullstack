export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            <p>© {currentYear} TaskTracker. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a 
              href="/privacy" 
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Terms of Service
            </a>
            <a 
              href="/contact" 
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 