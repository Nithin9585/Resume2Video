import Navbar from "@/components/ui/Navbar";
import "./globals.css";
import { Toaster } from "sonner";
export const metadata = {
  title: "Resume2Video - AI-Powered Video Resume Creator",
  description: "Transform your resume into an engaging AI-powered video presentation that stands out to employers",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <Navbar />
        {/* Main Content with proper spacing for fixed navbar */}
        <main className="pt-16">
          {children}
        </main>
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  );
}
