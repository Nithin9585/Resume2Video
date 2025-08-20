"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, firestore } from '../../../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaPencilAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { PlayCircle, Loader2, AlertCircle } from 'lucide-react';
import Loading from '../../Loading';
function PreviewSelectionClient() {
    const searchParams = useSearchParams();
    const avatarId = searchParams.get('avatarId');
    const voiceId = searchParams.get('voiceId');
    const [avatarData, setAvatarData] = useState(null);
    const [voiceData, setVoiceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarLoading, setAvatarLoading] = useState(true);
    const [voiceLoading, setVoiceLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(null);
    const [voiceError, setVoiceError] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [script, setScript] = useState('No script available.');
    const [isEditingScript, setIsEditingScript] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const router = useRouter();
    useEffect(() => {
        const fetchAvatarAndVoice = async () => {
            const avatarPromise = fetchWithRetry('/api/GetAvatars', 'avatar');
            const voicePromise = fetchWithRetry('/api/GetVoices', 'voice');
            avatarPromise
                .then(data => {
                    const avatar = data.data.avatars.find((avatar) => avatar.avatar_id === avatarId);
                    if (avatar) {
                        setAvatarData(avatar);
                    } else {
                        setAvatarError('Avatar not found');
                    }
                })
                .catch(error => {
                    setAvatarError('Failed to load avatar');
                })
                .finally(() => {
                    setAvatarLoading(false);
                });
            voicePromise
                .then(data => {
                    const voice = data.data.voices.find((voice) => voice.voice_id === voiceId);
                    if (voice) {
                        setVoiceData(voice);
                    } else {
                        setVoiceError('Voice not found');
                    }
                })
                .catch(error => {
                    setVoiceError('Failed to load voice');
                })
                .finally(() => {
                    setVoiceLoading(false);
                });
        };
        if (avatarId && voiceId) {
            fetchAvatarAndVoice();
        }
    }, [avatarId, voiceId]);
    const fetchWithRetry = async (url, type, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'public, max-age=300'
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                if (i === retries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    };
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatarId, voiceId, script }),
            });
            const data = await res.json();
            if (res.ok) {
                setVideoId(data.video_id);
                router.push(`/download_video?videoId=${data.video_id}`);
            } else {
                alert('Failed to generate video. Please try again.');
            }
        } catch (err) {
            alert('An error occurred while generating the video.');
        } finally {
            setGenerating(false);
        }
    };
    const handleToggleEditScript = () => setIsEditingScript((prev) => !prev);
    const handleScriptChange = (event) => setScript(event.target.value);
    if (loading) return <Loading />;
    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900/20 to-slate-800/20">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Preview & Generate
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Review your selections and customize your script before generating your professional video resume.
                    </p>
                    {/* Loading indicator for avatar/voice data */}
                    {(avatarLoading || voiceLoading) && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-blue-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">
                                Loading {avatarLoading && voiceLoading ? 'avatar and voice data' : avatarLoading ? 'avatar data' : 'voice data'}...
                            </span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Image */}
                    {imagePreview && (
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-cyan-400/20 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-cyan-400">👤</span>
                                    </div>
                                    Your Profile
                                </h2>
                                <div className="relative overflow-hidden rounded-2xl">
                                    <img
                                        src={imagePreview}
                                        alt="User Profile"
                                        className="w-full h-auto object-cover rounded-2xl"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Avatar and Voice Selection */}
                    <div className={`${imagePreview ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
                        {/* Avatar Information */}
                        {avatarLoading ? (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                    <h2 className="text-xl font-semibold text-white">Loading Avatar...</h2>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="w-32 h-32 mb-4 sm:mr-6 sm:mb-0 bg-gray-600 animate-pulse rounded-2xl"></div>
                                    <div className="space-y-2">
                                        <div className="h-6 bg-gray-600 animate-pulse rounded w-40"></div>
                                        <div className="h-4 bg-gray-600 animate-pulse rounded w-20"></div>
                                    </div>
                                </div>
                            </div>
                        ) : avatarError ? (
                            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center space-x-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <h2 className="text-xl font-semibold text-white">Avatar Error</h2>
                                </div>
                                <p className="text-red-300">{avatarError}</p>
                                <Button
                                    onClick={() => {
                                        setAvatarError(null);
                                        setAvatarLoading(true);
                                    }}
                                    className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : avatarData ? (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-blue-400">🤖</span>
                                    </div>
                                    Selected Avatar
                                </h2>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <div className="relative w-32 h-32 mb-4 sm:mr-6 sm:mb-0">
                                        <img
                                            src={avatarData.preview_image_url}
                                            alt={avatarData.avatar_name}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium text-white">{avatarData.avatar_name}</h3>
                                        <div className="flex items-center space-x-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium capitalize">
                                                {avatarData.gender}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                                <div className="text-gray-400 text-xl mb-2">🤖</div>
                                <p className="text-gray-400">No avatar selected</p>
                            </div>
                        )}
                        {/* Voice Information */}
                        {voiceLoading ? (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                                    <h2 className="text-xl font-semibold text-white">Loading Voice...</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="h-6 bg-gray-600 animate-pulse rounded w-32"></div>
                                        <div className="flex items-center space-x-2">
                                            <div className="h-6 bg-gray-600 animate-pulse rounded w-16"></div>
                                            <div className="h-6 bg-gray-600 animate-pulse rounded w-16"></div>
                                            <div className="h-6 bg-gray-600 animate-pulse rounded w-20"></div>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-xl p-4">
                                        <div className="h-8 bg-gray-600 animate-pulse rounded w-full"></div>
                                    </div>
                                </div>
                            </div>
                        ) : voiceError ? (
                            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center space-x-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <h2 className="text-xl font-semibold text-white">Voice Error</h2>
                                </div>
                                <p className="text-red-300">{voiceError}</p>
                                <Button
                                    onClick={() => {
                                        setVoiceError(null);
                                        setVoiceLoading(true);
                                    }}
                                    className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : voiceData ? (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-purple-400">🎵</span>
                                    </div>
                                    Selected Voice
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <h3 className="text-lg font-medium text-white">{voiceData.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium capitalize">
                                                {voiceData.language}
                                            </span>
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium capitalize">
                                                {voiceData.gender}
                                            </span>
                                            {voiceData.emotion_support && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-medium">
                                                    ✓ Emotions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {voiceData.preview_audio ? (
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-gray-300 text-sm mb-3">🎵 Voice Preview</p>
                                            <audio controls className="w-full">
                                                <source src={voiceData.preview_audio} type="audio/mpeg" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                                            <p className="text-gray-400 text-sm">No preview available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
                                <div className="text-gray-400 text-xl mb-2">🎵</div>
                                <p className="text-gray-400">No voice selected</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Script Section */}
                <div className="mt-12">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center">
                                <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-green-400">📝</span>
                                </div>
                                Video Script
                            </h2>
                            <button
                                onClick={handleToggleEditScript}
                                className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl"
                            >
                                <FaPencilAlt className="h-4 w-4" />
                                <span className="text-sm">{isEditingScript ? 'Save' : 'Edit'}</span>
                            </button>
                        </div>
                        {isEditingScript ? (
                            <textarea
                                id="script"
                                value={script}
                                onChange={handleScriptChange}
                                className="w-full p-4 border border-white/10 rounded-2xl bg-black/20 text-white resize-vertical focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
                                rows="8"
                                placeholder="Enter your video script here..."
                            />
                        ) : (
                            <div className="w-full p-4 border border-white/10 rounded-2xl bg-black/20 text-white min-h-[200px]">
                                {script}
                            </div>
                        )}
                    </div>
                </div>
                {/* Generate Button */}
                <div className="mt-12 text-center">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 flex items-center justify-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            Your video will be generated using AI technology
                        </p>
                        <Button
                            onClick={() => {
                                router.push(`/Downloadpage?avatarId=${avatarId}&voiceId=${voiceId}&script=${encodeURIComponent(script)}`);
                            }}
                            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 border-0 rounded-xl px-12 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <PlayCircle className="mr-3 h-6 w-6" />
                            Generate Professional Video
                        </Button>
                    </div>
                </div>
                {/* Features */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
                        <div className="text-cyan-400 text-3xl mb-4">⚡</div>
                        <h4 className="text-white font-semibold text-lg mb-2">Fast Generation</h4>
                        <p className="text-gray-400 text-sm">AI-powered video creation in minutes, not hours</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
                        <div className="text-blue-400 text-3xl mb-4">🎬</div>
                        <h4 className="text-white font-semibold text-lg mb-2">Professional Quality</h4>
                        <p className="text-gray-400 text-sm">Studio-grade video output ready for any platform</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
                        <div className="text-purple-400 text-3xl mb-4">✨</div>
                        <h4 className="text-white font-semibold text-lg mb-2">Customizable</h4>
                        <p className="text-gray-400 text-sm">Edit your script and regenerate as many times as needed</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default PreviewSelectionClient;
