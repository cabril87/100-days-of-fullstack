import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "TaskTracker - Organize your tasks efficiently",
  description: "TaskTracker helps you organize your tasks, track your productivity, and achieve your goals.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">TaskTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Organize your tasks <span className="text-primary">efficiently</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            TaskTracker helps you organize your tasks, track your productivity, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="font-medium px-8">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="font-medium px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to stay organized
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and track your tasks with ease. Set priorities,
                due dates, and categories to keep everything in order.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Productivity Analytics</h3>
              <p className="text-muted-foreground">
                Track your progress with detailed analytics. See your completion
                rates, task distributions, and productivity trends over time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card p-6 rounded-lg shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Organization</h3>
              <p className="text-muted-foreground">
                Categorize your tasks, set priorities, and organize your workflow
                to maximize your efficiency and productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to start organizing your tasks?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join TaskTracker today and take control of your productivity.
          </p>
          <Link href="/register">
            <Button size="lg" className="font-medium px-8">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">TaskTracker</h2>
              <p className="text-muted-foreground">
                &copy; {new Date().getFullYear()} TaskTracker. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
                Login
              </Link>
              <Link href="/register" className="text-muted-foreground hover:text-foreground transition">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
