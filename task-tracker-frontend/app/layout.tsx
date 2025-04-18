import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { TaskProvider } from "@/context/TaskContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { StatisticsProvider } from "@/context/StatisticsContext";
import MainLayout from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | TaskTracker",
    default: "TaskTracker - Organize your tasks efficiently",
  },
  description: "TaskTracker helps you organize your tasks, track your productivity, and achieve your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <TaskProvider>
            <CategoryProvider>
              <StatisticsProvider>
                <MainLayout>
                  {children}
                </MainLayout>
                <Toaster />
              </StatisticsProvider>
            </CategoryProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
