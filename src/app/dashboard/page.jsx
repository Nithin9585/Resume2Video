'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Film, Download, Edit3, Target, Bot, Zap, CheckCircle, Eye, TrendingUp, Clock } from 'lucide-react';
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/Login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen px-4 py-8">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {user?.displayName || user?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-gray-400">
            Ready to create more amazing video resumes?
          </p>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Create New Video",
              description: "Start a new video resume project",
              icon: Film,
              action: () => router.push('/resume'),
              gradient: "from-cyan-500 to-blue-600",
              primary: true
            },
            {
              title: "View Downloads",
              description: "Access your completed videos",
              icon: Download,
              action: () => router.push('/Downloadpage'),
              gradient: "from-blue-500 to-purple-600"
            },
            {
              title: "Preview & Edit",
              description: "Review your video selections",
              icon: Edit3,
              action: () => router.push('/PreviewSelection'),
              gradient: "from-purple-500 to-pink-600"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden cursor-pointer"
              onClick={item.action}
            >
              <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20 group-hover:shadow-2xl relative z-10 ${item.primary ? 'ring-2 ring-cyan-500/30' : ''}`}>
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.gradient} p-3 flex items-center justify-center`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                  {item.title}
                </h3>
                <p className="text-gray-300 group-hover:text-white transition-colors duration-300 mb-4">
                  {item.description}
                </p>
                {item.primary && (
                  <div className="flex items-center text-cyan-400 text-sm font-semibold">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Recent Activity Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {/* Placeholder for when no videos exist yet */}
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <Target className="w-16 h-16 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No videos created yet</h3>
              <p className="text-gray-400 mb-6">
                Your generated videos will appear here once you create them.
              </p>
              <Button
                onClick={() => router.push('/resume')}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-600 border-0 text-white rounded-xl px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                Create Your First Video
              </Button>
            </div>
          </div>
        </div>
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Videos Created", value: "0", icon: Film },
            { label: "Total Views", value: "0", icon: Eye },
            { label: "Downloads", value: "0", icon: Download },
            { label: "Success Rate", value: "100%", icon: CheckCircle }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center group hover:bg-white/10 transition-all duration-300">
              <div className="mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <stat.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
