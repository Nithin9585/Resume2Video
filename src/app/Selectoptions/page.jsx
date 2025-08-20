'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Loading from '../Loading';
function SelectOptions() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await fetch('/api/GetAvatars', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.data || !data.data.avatars || !Array.isArray(data.data.avatars)) {
          throw new Error('Invalid response format from avatars API');
        }
        const filteredAvatars = data.data.avatars
          .filter(avatar => avatar && avatar.gender === 'male')
          .slice(0, 20);
        setAvatars(filteredAvatars);
        setLoading(false);
      } catch (error) {
        setAvatars([]);
        setLoading(false);
      }
    };
    fetchAvatars();
  }, []);
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900/20 to-slate-800/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Choose Your Avatar
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Select a professional AI avatar that will represent you in your video resume. All avatars are optimized for professional presentations.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading />
          </div>
        ) : avatars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {avatars.map((avatar) => (
              <div key={avatar.avatar_id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300">
                {/* Avatar Image */}
                <div className="relative w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                  <img
                    src={avatar.preview_image_url}
                    alt={avatar.avatar_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {/* Avatar Info */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{avatar.avatar_name}</h3>
                  <p className="text-gray-400 text-sm capitalize">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                      {avatar.gender}
                    </span>
                  </p>
                </div>
                {/* Preview Video */}
                {avatar.preview_video_url ? (
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <video
                      width="100%"
                      controls
                      className="rounded-xl"
                      poster={avatar.preview_image_url}
                    >
                      <source src={avatar.preview_video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="mb-6 h-32 bg-gray-800/50 rounded-xl flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No preview available</p>
                  </div>
                )}
                {/* Select Button */}
                <Link href={`/SelectVoices/?avatarId=${avatar.avatar_id}`} className="block">
                  <button className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Select Avatar
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Avatars Found</h3>
              <p className="text-gray-400">
                Unable to load male avatars at this time. Please try again later.
              </p>
            </div>
          </div>
        )}
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-cyan-400 text-3xl mb-4">✨</div>
            <h4 className="text-white font-semibold text-lg mb-2">AI-Powered</h4>
            <p className="text-gray-400 text-sm">Advanced AI technology for realistic avatar movements and expressions</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-blue-400 text-3xl mb-4">🎯</div>
            <h4 className="text-white font-semibold text-lg mb-2">Professional</h4>
            <p className="text-gray-400 text-sm">Carefully curated avatars optimized for business presentations</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-purple-400 text-3xl mb-4">⚡</div>
            <h4 className="text-white font-semibold text-lg mb-2">High Quality</h4>
            <p className="text-gray-400 text-sm">Studio-quality rendering for professional video resumes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SelectOptions;
