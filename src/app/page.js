'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Bot, Film, Zap, Target, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_800px_600px_at_50%_0%,black,transparent)]"></div>
        {/* Mouse Follow Gradient */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none transition-all duration-300 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        ></div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 py-20">
        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 relative">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                Resume2Video
              </span>
              {/* Floating particles around title */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-0 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 leading-relaxed">
              Transform your <span className="text-cyan-400 font-semibold">resume</span> into an engaging
              <span className="text-purple-400 font-semibold"> AI-powered video</span> presentation
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Stand out to employers with professional AI avatars, natural voices, and stunning visual presentations
            </p>
          </div>
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Bot,
                title: "AI-Powered Generation",
                description: "Smart script creation from your resume",
                gradient: "from-cyan-500 to-blue-600",
                delay: "0s"
              },
              {
                icon: Film,
                title: "Professional Avatars",
                description: "Studio-quality digital presenters",
                gradient: "from-blue-500 to-purple-600",
                delay: "0.2s"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Ready in minutes, not hours",
                gradient: "from-purple-500 to-pink-600",
                delay: "0.4s"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20 group-hover:shadow-2xl relative z-10">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} p-3 flex items-center justify-center`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            {[
              { number: "10K+", label: "Videos Created", icon: Film },
              { number: "98%", label: "Success Rate", icon: Target },
              { number: "2 Min", label: "Average Time", icon: Clock },
              { number: "50+", label: "AI Avatars", icon: Users }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider group-hover:text-gray-300 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          {/* CTA Section */}
          <div className="space-y-8">
            <Link href="/resume">
              <Button className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 border-0 rounded-2xl px-12 py-6 text-xl font-bold text-white shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-500 ease-out overflow-hidden">
                {/* Button Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Button Text */}
                <span className="relative z-10 flex items-center gap-3">
                  <span>Create Your Video Resume</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </Button>
            </Link>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Join thousands of professionals who landed their dream jobs
            </p>
          </div>
        </div>
      </div>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
