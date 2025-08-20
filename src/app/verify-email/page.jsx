'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import Link from 'next/link';

export default function VerifyEmail() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          router.push('/dashboard');
        } else {
          setUser(currentUser);
        }
      } else {
        router.push('/Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleResendVerification = async () => {
    if (!user) return;
    
    setResending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email
          </h1>
          <p className="text-gray-300 mb-4">
            We've sent a verification link to:
          </p>
          <p className="text-blue-400 font-semibold break-all">
            {user?.email}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-sm">
            Please check your email and click the verification link to complete your registration.
          </p>
          <p className="text-gray-400 text-xs">
            Can't find the email? Check your spam folder.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {resending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Resend Verification Email
              </>
            )}
          </Button>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 py-3 px-6 rounded-xl transition-all duration-200"
          >
            Sign Out & Try Different Email
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-gray-400 text-xs">
            Already verified?{' '}
            <Link href="/Login" className="text-blue-400 hover:text-blue-300 underline">
              Try logging in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
