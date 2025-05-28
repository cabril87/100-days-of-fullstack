export default function Support() {
  const faqs = [
    {
      question: "How do I get started with TaskTracker?",
      answer: "Simply create an account, set up your profile, and start adding tasks. Our onboarding guide will walk you through the basics of gamified task management."
    },
    {
      question: "How does the gamification system work?",
      answer: "You earn XP (experience points) for completing tasks. Different tasks have different XP values based on their difficulty and importance. As you earn XP, you level up and unlock achievements."
    },
    {
      question: "Can I invite family members?",
      answer: "Yes! You can invite family members to join your TaskTracker family. They can share tasks, compete on leaderboards, and collaborate on family goals."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use enterprise-grade security measures to protect your data. All information is encrypted in transit and at rest, and we never sell your personal information."
    },
    {
      question: "Can I use TaskTracker offline?",
      answer: "TaskTracker works best with an internet connection, but you can view and complete tasks offline. Your progress will sync when you reconnect to the internet."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings. Your access to premium features will continue until the end of your billing period."
    }
  ];

  const supportOptions = [
    {
      title: "📧 Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@tasktracker.com",
      availability: "24/7"
    },
    {
      title: "💬 Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available in app",
      availability: "Mon-Fri, 9AM-6PM EST"
    },
    {
      title: "📚 Help Center",
      description: "Browse our comprehensive documentation",
      contact: "help.tasktracker.com",
      availability: "Always available"
    },
    {
      title: "🎥 Video Tutorials",
      description: "Watch step-by-step guides and tutorials",
      contact: "youtube.com/tasktracker",
      availability: "Always available"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-xl text-gray-600">
          We're here to help you get the most out of TaskTracker
        </p>
      </div>

      {/* Support Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {supportOptions.map((option, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">{option.title}</h3>
            <p className="text-gray-600 mb-3">{option.description}</p>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Contact:</span> {option.contact}
              </div>
              <div className="text-sm">
                <span className="font-medium">Availability:</span> {option.availability}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Still Need Help?</h2>
        <p className="text-gray-600 text-center mb-8">
          Send us a message and we'll get back to you as soon as possible.
        </p>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="How can we help?"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your issue or question in detail..."
            ></textarea>
          </div>
          
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 