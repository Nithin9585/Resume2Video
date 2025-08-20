'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faPlay,
  faShare,
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faRocket,
  faVideo,
  faHome,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function DownloadPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const avatarId = searchParams.get('avatarId');
  const voiceId = searchParams.get('voiceId');
  const script = searchParams.get('script');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('initializing');
  const [videoUrl, setVideoUrl] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [videoId, setVideoId] = useState(null);
  useEffect(() => {
    if (status === 'processing') {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Don't go to 100% until actually complete
          return prev + Math.random() * 5;
        });
        setEstimatedTime(prev => Math.max(0, prev - 3));
      }, 3000);
      return () => clearInterval(progressInterval);
    }
  }, [status]);
  useEffect(() => {
    const generateAndTrackVideo = async () => {
      try {
        setStatus('generating');
        setProgress(10);
        const res = await fetch('/api/GenerateVideo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId, voiceId, script }),
        });
        const data = await res.json();
        if (!res.ok || !data.video_id) {
          setError(data.message || 'Video generation failed.');
          setStatus('error');
          toast.error('Failed to start video generation');
          return;
        }
        const videoId = data.video_id;
        setVideoId(videoId);
        setStatus('processing');
        setProgress(30);
        toast.success('Video generation started!');
        const pollStatus = async () => {
          try {
            const statusRes = await fetch(`/api/CheckVideoStatus?videoId=${videoId}`);
            const statusData = await statusRes.json();
            if (statusData.status === 'completed') {
              setStatus('completed');
              setProgress(100);
              const videoUrlFromResponse = statusData.videoUrl || statusData.video_url;
              setVideoUrl(videoUrlFromResponse);
              if (videoUrlFromResponse) {
                toast.success('🎉 Your video is ready!');
              } else {
                toast.success('Video completed! Refreshing status...');
                setTimeout(pollStatus, 2000);
                return;
              }
              if (timeoutId) clearTimeout(timeoutId);
            } else if (statusData.status === 'failed') {
              setError('Video generation failed. Please try again.');
              setStatus('error');
              toast.error('Video generation failed');
              if (timeoutId) clearTimeout(timeoutId);
            } else {
              const newTimeoutId = setTimeout(pollStatus, 3000);
              setTimeoutId(newTimeoutId);
            }
          } catch (err) {
            setError('Error checking video status. Please refresh the page.');
            setStatus('error');
            toast.error('Connection error');
            if (timeoutId) clearTimeout(timeoutId);
          }
        };
        const initialTimeoutId = setTimeout(pollStatus, 3000);
        setTimeoutId(initialTimeoutId);
      } catch (err) {
        setError('Unexpected error occurred. Please try again.');
        setStatus('error');
        toast.error('Unexpected error occurred');
      }
    };
    if (avatarId && voiceId && script) {
      generateAndTrackVideo();
    } else {
      setError('Missing required parameters. Please go back and try again.');
      setStatus('error');
      toast.error('Missing required parameters');
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [avatarId, voiceId, script]);
  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `resume-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    }
  };
  const handleShare = async () => {
    if (navigator.share && videoUrl) {
      try {
        await navigator.share({
          title: 'My Video Resume',
          text: 'Check out my AI-generated video resume!',
          url: videoUrl,
        });
      } catch (err) {
        navigator.clipboard.writeText(videoUrl);
        toast.success('Video URL copied to clipboard!');
      }
    } else if (videoUrl) {
      navigator.clipboard.writeText(videoUrl);
      toast.success('Video URL copied to clipboard!');
    }
  };
  const handleRetry = () => {
    setError(null);
    setStatus('initializing');
    setProgress(0);
    setEstimatedTime(60);
    setVideoUrl(null);
    window.location.reload();
  };
  const getStatusInfo = () => {
    switch (status) {
      case 'initializing':
        return {
          title: 'Preparing Your Video',
          subtitle: 'Setting up the generation process...',
          icon: faRocket,
          color: 'text-blue-400'
        };
      case 'generating':
        return {
          title: 'Creating Your Video',
          subtitle: 'AI is processing your resume and script...',
          icon: faVideo,
          color: 'text-purple-400'
        };
      case 'processing':
        return {
          title: 'Generating Video',
          subtitle: `Rendering your professional video resume...`,
          icon: faSpinner,
          color: 'text-green-400'
        };
      case 'completed':
        return {
          title: 'Video Ready!',
          subtitle: 'Your professional video resume is complete',
          icon: faCheck,
          color: 'text-green-400'
        };
      case 'error':
        return {
          title: 'Something Went Wrong',
          subtitle: error || 'An unexpected error occurred',
          icon: faExclamationTriangle,
          color: 'text-red-400'
        };
      default:
        return {
          title: 'Processing',
          subtitle: 'Please wait...',
          icon: faSpinner,
          color: 'text-blue-400'
        };
    }
  };
  const statusInfo = getStatusInfo();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.color} bg-white/10 mb-6`}>
              <FontAwesomeIcon
                icon={statusInfo.icon}
                className={`text-3xl ${status === 'processing' || status === 'generating' ? 'animate-spin' : status === 'completed' ? 'animate-bounce' : ''}`}
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{statusInfo.title}</h1>
            <p className="text-xl text-white/80">{statusInfo.subtitle}</p>
          </div>
          {/* Progress Section */}
          {(status === 'generating' || status === 'processing') && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/80 font-medium">Progress</span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-white/60">
                <span>Estimated time remaining</span>
                <span>{Math.max(0, estimatedTime)}s</span>
              </div>
            </div>
          )}
          {/* Video Preview and Controls */}
          {status === 'completed' && (
            <div className="mb-8">
              {videoUrl ? (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 text-center">
                    🎉 Your Video Resume is Ready!
                  </h3>
                  <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/20">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-auto max-h-96 object-contain"
                      poster=""
                      onLoadStart={() => { }}
                      onCanPlay={() => { }}
                      onError={(e) => { }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-white/70 text-sm">
                      ✨ Click play to preview your professional video resume
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-2xl mb-3" />
                  <h3 className="text-white font-semibold mb-2">Video Ready, URL Loading...</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Your video has been generated successfully, but we're still getting the download link.
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg"
                  >
                    <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                    Refresh Page
                  </Button>
                </div>
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="space-y-4">
            {status === 'completed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoUrl ? (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <FontAwesomeIcon icon={faDownload} className="mr-3" />
                      Download Video
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FontAwesomeIcon icon={faShare} className="mr-3" />
                      Share Video
                    </Button>
                  </>
                ) : (
                  <div className="col-span-full">
                    <Button
                      onClick={() => window.location.reload()}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <FontAwesomeIcon icon={faRefresh} className="mr-3" />
                      Refresh to Get Download Link
                    </Button>
                  </div>
                )}
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
                  <p className="text-red-200 font-medium">{error}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faRefresh} className="mr-3" />
                    Try Again
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faHome} className="mr-3" />
                    Go Home
                  </Button>
                </div>
              </div>
            )}
            {(status === 'generating' || status === 'processing') && (
              <div className="text-center">
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <FontAwesomeIcon icon={faSpinner} className="text-blue-400 animate-spin text-lg" />
                    <span className="text-white font-medium">Processing your video...</span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    This may take a few minutes. Please don't close this page.<br />
                    We'll automatically update when your video is ready!
                  </p>
                </div>
              </div>
            )}
            {status === 'initializing' && (
              <div className="text-center">
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <FontAwesomeIcon icon={faRocket} className="text-purple-400 animate-pulse text-lg" />
                    <span className="text-white font-medium">Getting ready...</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Setting up your video generation process
                  </p>
                </div>
              </div>
            )}
            {/* Navigation Button */}
            <div className="pt-4 border-t border-white/20">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="ghost"
                className="w-full text-white/70 hover:text-white hover:bg-white/10 font-medium py-3 rounded-xl transition-all duration-300"
              >
                <FontAwesomeIcon icon={faHome} className="mr-3" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
        {/* Processing Tips */}
        {(status === 'generating' || status === 'processing') && (
          <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-400" />
              What's happening behind the scenes?
            </h3>
            <div className="space-y-2 text-white/70 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI is analyzing your resume content</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Generating voice narration from your script</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Creating avatar animations and lip-sync</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Rendering your final video in HD quality</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
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

// Loading component for Suspense fallback
function DownloadPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading download page...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function DownloadPage() {
  return (
    <Suspense fallback={<DownloadPageLoading />}>
      <DownloadPageContent />
    </Suspense>
  );
}
