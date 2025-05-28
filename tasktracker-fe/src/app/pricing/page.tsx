export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals and small families",
      features: [
        "Up to 5 family members",
        "Unlimited tasks",
        "Basic gamification",
        "Mobile app access",
        "Email support"
      ],
      buttonText: "Get Started Free",
      buttonStyle: "border border-gray-300 hover:border-gray-400 text-gray-700",
      popular: false
    },
    {
      name: "Family Pro",
      price: "$9.99",
      period: "per month",
      description: "Advanced features for growing families",
      features: [
        "Up to 15 family members",
        "Advanced analytics",
        "Custom templates",
        "Priority support",
        "Family leaderboards",
        "Achievement badges",
        "Focus mode timers"
      ],
      buttonText: "Start Free Trial",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large families and organizations",
      features: [
        "Unlimited family members",
        "Advanced security",
        "Custom integrations",
        "Dedicated support",
        "Admin dashboard",
        "API access",
        "White-label options"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "border border-gray-300 hover:border-gray-400 text-gray-700",
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Start free and upgrade as your family grows
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-lg shadow-lg p-6 border-2 ${
              plan.popular ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period !== "pricing" && (
                  <span className="text-gray-500 ml-1">/{plan.period}</span>
                )}
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${plan.buttonStyle}`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-left">
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              All paid plans come with a 14-day free trial. No credit card required to start.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for annual plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 