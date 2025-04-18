'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';  // Import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function SelectVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const avatarId = searchParams.get('avatarId');

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('https://api.heygen.com/v2/voices', {
          method: 'GET',
          headers: {
            'x-api-key': 'NTQ0MGM4NjQyZjUwNGU5YjlkZmUwNzE5YzA1YWJjNDUtMTczODEyNjU2NA==',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }

        const data = await response.json();

        // Filter only the voices with languages: English, Tamil, and Hindi
        const filteredVoices = data.data.voices.filter(voice =>
          ['english', 'tamil', 'hindi'].includes(voice.language.toLowerCase())
        );

        setVoices(filteredVoices.slice(0, 20)); // Limit to 20 voices
        setLoading(false);
      } catch (error) {
        console.error('Error fetching voices:', error);
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-white mb-6">Select Voice</h2>
      {loading ? (
        <p className="text-white">Loading voices...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {voices.map((voice) => (
            <div
              key={voice.voice_id}
              className="bg-white/10 backdrop-blur-lg border border-gray-300 p-4 rounded-xl text-white"
            >
              <h3 className="text-xl font-bold mb-2">{voice.name}</h3>
              <p className="text-sm">Language: {voice.language}</p>
              <p className="text-sm">Gender: {voice.gender}</p>
              <p className="text-sm">Supports Pause: {voice.support_pause ? 'Yes' : 'No'}</p>
              <p className="text-sm mb-2">Emotion Support: {voice.emotion_support ? 'Yes' : 'No'}</p>

              {/* Corrected Link component usage */}
              <Link href={`/PreviewSelection?avatarId=${avatarId}&voiceId=${voice.voice_id}`}>
                <Button className="m-4 cursor-pointer">Select</Button>
              </Link>

              {voice.preview_audio ? (
                <audio controls className="w-full mt-2">
                  <source src={voice.preview_audio} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p className="text-sm text-gray-300">No preview available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectVoices;
