'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';  // Import Link from 'next/link'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Loading from '../Loading';
function SelectVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const avatarId = searchParams.get('avatarId');
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('/api/GetVoices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch voices');
        }
        const data = await response.json();
        const filteredVoices = data.data.voices.filter(voice =>
          ['english', 'tamil', 'hindi'].includes(voice.language.toLowerCase())
        );
        setVoices(filteredVoices.slice(0, 20)); // Limit to 20 voices
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchVoices();
  }, []);
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900/20 to-slate-800/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Choose Your Voice
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select a professional voice that matches your style. We support English, Tamil, and Hindi languages for global reach.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.map((voice) => (
              <div
                key={voice.voice_id}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                {/* Voice Icon */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-3xl">
                      {voice.gender === 'male' ? '👨' : '👩'}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{voice.name}</h3>
                </div>
                {/* Voice Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Language:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium capitalize">
                      {voice.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Gender:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium capitalize">
                      {voice.gender}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Pause Support:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${voice.support_pause
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                      }`}>
                      {voice.support_pause ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Emotions:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${voice.emotion_support
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                      }`}>
                      {voice.emotion_support ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>
                </div>
                {/* Audio Preview */}
                <div className="mb-6">
                  {voice.preview_audio ? (
                    <div className="bg-black/20 rounded-xl p-4">
                      <p className="text-gray-300 text-sm mb-3 text-center">🎵 Voice Preview</p>
                      <audio controls className="w-full">
                        <source src={voice.preview_audio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                      <div className="text-gray-400 text-2xl mb-2">🔇</div>
                      <p className="text-gray-400 text-sm">No preview available</p>
                    </div>
                  )}
                </div>
                {/* Select Button */}
                <Link href={`/PreviewSelection?avatarId=${avatarId}&voiceId=${voice.voice_id}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 border-0 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Select Voice
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-cyan-400 text-3xl mb-4">🌍</div>
            <h4 className="text-white font-semibold text-lg mb-2">Multi-Language</h4>
            <p className="text-gray-400 text-sm">Support for English, Tamil, and Hindi to reach global audiences</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-blue-400 text-3xl mb-4">🎭</div>
            <h4 className="text-white font-semibold text-lg mb-2">Natural Expression</h4>
            <p className="text-gray-400 text-sm">Advanced emotion support for more engaging presentations</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-purple-400 text-3xl mb-4">🎯</div>
            <h4 className="text-white font-semibold text-lg mb-2">Professional Quality</h4>
            <p className="text-gray-400 text-sm">Studio-grade voice synthesis for professional presentations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SelectVoices;
