import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { TaskProvider } from "@/lib/providers/TaskProvider";
import { ToastProvider } from "@/lib/providers/ToastProvider";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskTracker - Secure Task Management",
  description: "A secure, feature-rich task management application",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  other: {
    "Content-Security-Policy": 
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' " +
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TaskProvider>
            <ToastProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-6">
                {children}
              </main>
            </ToastProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
