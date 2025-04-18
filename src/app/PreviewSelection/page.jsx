'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { auth, firestore } from '../../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { FaPencilAlt } from 'react-icons/fa'; // Corrected import for the Pencil icon
import { Button } from '@/components/ui/button';
import {  PlayCircle } from 'lucide-react';
import Link from 'next/link';

function PreviewSelection() {
  const searchParams = useSearchParams();
  const avatarId = searchParams.get('avatarId');
  const voiceId = searchParams.get('voiceId');
  
  const [avatarData, setAvatarData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [script, setScript] = useState('No script available.');
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoId, setVideoId] = useState(null);
  
  const router = useRouter(); // Initialize router

  // Fetch avatar data based on avatarId
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
          method: 'GET',
          headers: {
            'x-api-key': 'NTQ0MGM4NjQyZjUwNGU5YjlkZmUwNzE5YzA1YWJjNDUtMTczODEyNjU2NA==',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch avatar data');
        }

        const data = await response.json();
        console.log("Fetched Avatar Data: ", data);

        // Find the avatar that matches the avatarId
        const avatar = data.data.avatars.find((avatar) => avatar.avatar_id === avatarId);
        setAvatarData(avatar);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching avatar:', error);
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [avatarId]);

  // Fetch voice data based on voiceId
  useEffect(() => {
    const fetchVoice = async () => {
      try {
        const response = await fetch('https://api.heygen.com/v2/voices', {
          method: 'GET',
          headers: {
            'x-api-key': 'NTQ0MGM4NjQyZjUwNGU5YjlkZmUwNzE5YzA1YWJjNDUtMTczODEyNjU2NA==',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch voice data');
        }

        const data = await response.json();
        console.log("Fetched Voice Data: ", data);

        // Find the voice that matches the voiceId
        const voice = data.data.voices.find((voice) => voice.voice_id === voiceId);
        setVoiceData(voice); 
      } catch (error) {
        console.error('Error fetching voice:', error);
        setLoading(false); 
      }
    };

    fetchVoice();
  }, [voiceId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/Login');
      } else {
        const userRef = doc(firestore, 'userdata', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setImagePreview(userData.imageURL || ''); // Set the image URL here
          setScript(userData.script || 'No script available.');
        }

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const generateVideo = async (script, avatarId, voiceId) => {
    try {
      setGenerating(true);
  
      const res = await fetch('/api/GenerateVideo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatarId, voiceId, script }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        console.log('Video Generated:', data);
        setVideoId(data.video_id);
  
        // Optionally redirect or show a modal/notification
        router.push(`/download_video?videoId=${data.video_id}`);
      } else {
        console.error('Video generation failed:', data.message);
        alert('Failed to generate video. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while generating the video.');
    } finally {
      setGenerating(false);
    }
  };
  

  // Handle script edit toggle
  const handleToggleEditScript = () => {
    setIsEditingScript((prevState) => !prevState);
  };

  // Handle script change
  const handleScriptChange = (event) => {
    setScript(event.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-screen-lg">
      <h1 className="text-2xl font-semibold mb-6">Preview Selection</h1>

      {imagePreview && (
  <div className="card bg-gray-800 p-4 rounded-lg text-white mb-6">
    <h2 className="text-xl font-bold mb-4">User Image</h2>
    <img
      src={imagePreview}
      alt="User Profile"
      className="rounded-md w-full  max-h-[600px] object-contain rounded-lg mb-4"
    />
  </div>
)}



      {avatarData ? (
        <div className="card bg-gray-800 p-4 rounded-lg text-white mb-6">
          <h2 className="text-xl font-bold mb-4">Avatar Information</h2>
          <div className="flex flex-col sm:flex-row sm:items-center">
            <img
              src={avatarData.preview_image_url}
              alt={avatarData.avatar_name}
              className="w-32 h-32 object-cover rounded-lg mb-4 sm:mr-4 sm:mb-0"
            />
            <div>
              <h3 className="text-lg">{avatarData.avatar_name}</h3>
              <p>Gender: {avatarData.gender}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>No avatar found.</div>
      )}

      {voiceData ? (
        <div className="card bg-gray-800 p-4 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Voice Information</h2>
          <h3 className="text-lg">{voiceData.name}</h3>
          <p>Language: {voiceData.language}</p>
          <p>Gender: {voiceData.gender}</p>
          <p>Emotion Support: {voiceData.emotion_support ? 'Yes' : 'No'}</p>

          {voiceData.preview_audio ? (
            <audio controls className="w-full mt-4">
              <source src={voiceData.preview_audio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p>No preview available</p>
          )}
        </div>
      ) : (
        <div>No voice found.</div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="script" className="block text-sm font-medium text-gray-300">
            Video Script
          </label>
          <button
            onClick={handleToggleEditScript}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <FaPencilAlt className="h-4 w-4" />
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
      <div className="w-full flex justify-center items-center mt-6">
  <Button onClick={genarateVideo(script,avatarId,voiceId)}
    className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-8 rounded-xl flex items-center shadow-md hover:shadow-lg transition-shadow cursor-pointer"
  
  >
    <PlayCircle className="mr-2 h-5 w-5" />
    Generate video
  </Button>
</div>

    </div>
  );
}

export default PreviewSelection;
