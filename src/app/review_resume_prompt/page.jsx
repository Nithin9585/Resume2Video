'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Pencil } from 'lucide-react';
import { auth, firestore } from '../../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Loading from '../Loading';
import { toast } from 'sonner';
import Link from 'next/link';
function ReviewResumePrompt() {
  const [script, setScript] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
      } else {
        const userRef = doc(firestore, 'userdata', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setImagePreview(userData.imageURL || '');
          setScript(userData.script || 'No script available.'); // Load stored script
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);
  if (loading) {
    return <Loading />;
  }
  const handleScriptChange = (e) => {
    setScript(e.target.value);
  };
  const handleToggleEditScript = () => {
    setIsEditingScript(!isEditingScript);
    if (!isEditingScript) {
      toast.info('You can now edit the script.');
    }
  };
  const handleGenerateVideo = () => {
    toast.success('Video generation initiated!');
  };
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900/20 to-slate-800/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Review Your Script
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Review and customize your AI-generated script before selecting your avatar and voice.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Image Preview */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-cyan-400">📸</span>
              </div>
              Profile Preview
            </h2>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 min-h-[300px] flex items-center justify-center">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-4">📷</div>
                  <p className="text-gray-400">No profile image uploaded</p>
                </div>
              )}
            </div>
          </div>
          {/* Script Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-400">📝</span>
                </div>
                AI-Generated Script
              </h2>
              <button
                onClick={handleToggleEditScript}
                className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
              >
                <Pencil className="h-4 w-4" />
                <span className="text-sm">{isEditingScript ? 'Save' : 'Edit'}</span>
              </button>
            </div>
            {isEditingScript ? (
              <textarea
                id="script"
                value={script}
                onChange={handleScriptChange}
                className="w-full p-4 border border-white/10 rounded-2xl bg-black/20 text-white resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent min-h-[300px]"
                rows="12"
                placeholder="Your AI-generated script will appear here. You can edit it to match your style..."
              />
            ) : (
              <div className="w-full p-4 border border-white/10 rounded-2xl bg-black/20 text-white min-h-[300px] whitespace-pre-wrap">
                {script || 'No script available. Please upload your resume first to generate a script.'}
              </div>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className="mt-12 text-center space-y-6">
          {/* Script Quality Indicators */}
          <div className="flex justify-center space-x-6 text-sm">
            <div className="flex items-center text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              AI-Optimized Content
            </div>
            <div className="flex items-center text-blue-400">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Professional Tone
            </div>
            <div className="flex items-center text-purple-400">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              Customizable
            </div>
          </div>
          {/* Main Action Button */}
          <div>
            <Link href="/Selectoptions" className="inline-block">
              <Button
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 border-0 rounded-xl px-12 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                onClick={handleGenerateVideo}
              >
                <PlayCircle className="mr-3 h-6 w-6" />
                Continue to Avatar Selection
              </Button>
            </Link>
          </div>
        </div>
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-cyan-400 text-3xl mb-4">🤖</div>
            <h4 className="text-white font-semibold text-lg mb-2">AI-Generated</h4>
            <p className="text-gray-400 text-sm">Intelligent script creation based on your resume content</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-blue-400 text-3xl mb-4">✏️</div>
            <h4 className="text-white font-semibold text-lg mb-2">Fully Editable</h4>
            <p className="text-gray-400 text-sm">Customize every word to match your personal style</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-purple-400 text-3xl mb-4">🎯</div>
            <h4 className="text-white font-semibold text-lg mb-2">Professional</h4>
            <p className="text-gray-400 text-sm">Optimized for maximum impact and engagement</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ReviewResumePrompt;
