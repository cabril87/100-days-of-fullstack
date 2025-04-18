import RegisterForm from "@/components/forms/RegisterForm";

export const metadata = {
  title: "Register | TaskTracker",
  description: "Create a new TaskTracker account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">TaskTracker</h1>
        <p className="text-muted-foreground mt-2">Create an account to get started</p>
      </div>
      <RegisterForm />
    </div>
  );
} 