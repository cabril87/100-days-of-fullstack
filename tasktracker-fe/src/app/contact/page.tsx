export default function Contact() {
  const contactMethods = [
    {
      title: "📧 Email Support",
      description: "Get help with your account or technical issues",
      contact: "support@tasktracker.com",
      responseTime: "Within 24 hours"
    },
    {
      title: "💼 Business Inquiries",
      description: "Partnership, enterprise, or media inquiries",
      contact: "business@tasktracker.com",
      responseTime: "Within 48 hours"
    },
    {
      title: "🔒 Privacy & Legal",
      description: "Privacy concerns or legal questions",
      contact: "legal@tasktracker.com",
      responseTime: "Within 72 hours"
    },
    {
      title: "💡 Feature Requests",
      description: "Suggest new features or improvements",
      contact: "feedback@tasktracker.com",
      responseTime: "We read every suggestion"
    }
  ];

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Productivity Lane\nTech City, CA 94105\nUnited States",
      phone: "+1 (555) 123-4567",
      hours: "Mon-Fri: 9AM-6PM PST"
    },
    {
      city: "New York",
      address: "456 Innovation Ave\nNew York, NY 10001\nUnited States",
      phone: "+1 (555) 987-6543",
      hours: "Mon-Fri: 9AM-6PM EST"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">
          We'd love to hear from you. Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Company"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a subject</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="partnership">Partnership Inquiry</option>
                <option value="media">Media Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>
            
            <div className="flex items-center">
              <input
                id="newsletter"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-700">
                I'd like to receive updates about TaskTracker features and tips
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Contact Methods */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                  <p className="text-gray-600 mb-3">{method.description}</p>
                  <div className="space-y-1">
                    <p className="font-medium text-blue-600">{method.contact}</p>
                    <p className="text-sm text-gray-500">{method.responseTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office Locations */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
            <div className="space-y-6">
              {officeLocations.map((office, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">{office.city}</h3>
                  <div className="space-y-2 text-gray-700">
                    <div>
                      <p className="font-medium">Address:</p>
                      <p className="whitespace-pre-line">{office.address}</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone:</p>
                      <p>{office.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium">Hours:</p>
                      <p>{office.hours}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Link */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Need Quick Answers?</h3>
            <p className="text-blue-100 mb-4">
              Check out our frequently asked questions for instant help with common issues.
            </p>
            <a
              href="/support"
              className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Visit Support Center
            </a>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-6">Follow Us</h2>
        <p className="text-gray-600 mb-8">
          Stay connected with TaskTracker on social media for updates, tips, and community highlights.
        </p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-blue-600 hover:text-blue-800 text-2xl">📘</a>
          <a href="#" className="text-blue-400 hover:text-blue-600 text-2xl">🐦</a>
          <a href="#" className="text-pink-600 hover:text-pink-800 text-2xl">📷</a>
          <a href="#" className="text-blue-700 hover:text-blue-900 text-2xl">💼</a>
          <a href="#" className="text-red-600 hover:text-red-800 text-2xl">📺</a>
        </div>
      </div>
    </div>
  );
} 