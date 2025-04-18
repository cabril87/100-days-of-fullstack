import LoginForm from "@/components/forms/LoginForm";

export const metadata = {
  title: "Login | TaskTracker",
  description: "Login to your TaskTracker account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">TaskTracker</h1>
        <p className="text-muted-foreground mt-2">Manage your tasks efficiently</p>
      </div>
      <LoginForm />
    </div>
  );
} 