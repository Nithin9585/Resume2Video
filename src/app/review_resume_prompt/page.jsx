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

function ReviewResumePrompt() {
  const [script, setScript] = useState(''); // Store fetched script
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
    console.log('Generating video with script:', script, 'and image:', imagePreview);
    toast.success('Video generation initiated!');
  };

  return (
    <div className="w-full min-h-screen flex p-10 items-center justify-center">
      <div className="bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white border-opacity-20 p-10 max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">
          AI Resume Video Creator
        </h1>

        <div className="mb-8">
          <div className="relative border border-dashed border-gray-600 rounded-lg p-6 flex justify-center items-center">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Resume Preview"
                className="max-h-60 max-w-full rounded-lg"
              />
            ) : (
              <p className="text-sm text-gray-400 mt-2">No image available</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="script" className="block text-sm font-medium text-gray-300">
              Video Script
            </label>
            <button
              onClick={handleToggleEditScript}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          {isEditingScript ? (
            <textarea
              id="script"
              value={script}
              onChange={handleScriptChange}
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white resize-vertical"
              rows="6"
            />
          ) : (
            <div className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white">
              {script}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-8 rounded-xl flex items-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleGenerateVideo}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Generate Video
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReviewResumePrompt;
