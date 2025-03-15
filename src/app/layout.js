import Navbar from "@/components/ui/Navbar";
import "./globals.css";
import Spline from "@splinetool/react-spline";
import { Toaster } from "sonner";
export const metadata = {
  title: "Resume2Video",
  description: "Convert your resume into a video",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className=" min-h-screen pt-[60px]">
        <Spline
          className="fixed inset-0 -z-10 w-full h-full scale-[1.2]"
          scene="https://prod.spline.design/8ClKNawJFyEhRMoY/scene.splinecode" 
          />

        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar />
        </div>

        <div className="relative z-10">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
