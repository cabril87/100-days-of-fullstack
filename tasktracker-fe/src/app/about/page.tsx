export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About TaskTracker</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          TaskTracker is designed to help individuals and teams manage their tasks efficiently.
          Our mission is to provide a simple yet powerful task management solution that makes
          organizing work easier and more productive.
        </p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Simple and intuitive task management</li>
          <li>Categorize tasks by priority and status</li>
          <li>Track task completion and progress</li>
          <li>Visualize workload with task statistics</li>
          <li>Mobile-friendly interface for productivity on the go</li>
        </ul>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Technology</h2>
        <p className="text-gray-700 mb-4">
          TaskTracker is built using modern web technologies:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Next.js for the frontend</li>
          <li>React for component-based UI</li>
          <li>Tailwind CSS for styling</li>
          <li>.NET Core backend (in development)</li>
          <li>SQL Server for data storage</li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          For questions or support, please email us at support@tasktracker-demo.com
        </p>
      </div>
    </div>
  );
} 