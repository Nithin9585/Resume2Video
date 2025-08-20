'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { faEnvelope, faLock, faEye, faEyeSlash, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { setCookie } from 'cookies-next';
import { toast } from 'sonner';
function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (field === 'email') {
      setEmailValid(validateEmail(value));
    }
  };
  const handleResetPassword = async () => {
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address to reset password');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else {
        toast.error('Failed to send reset email. Please try again.');
      }
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = formData;
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        await signOut(auth);
        toast.error(
          <div>
            Please verify your email before logging in. 
            <br />
            <Link href="/verify-email" className="text-blue-400 underline">
              Click here to resend verification email
            </Link>
          </div>
        );
        setLoading(false);
        return;
      }
      const userRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          emailVerified: true,
          loginCount: (userDoc.data().loginCount || 0) + 1
        });
      } else {
        toast.warning('User profile not found. Please contact support.');
        setLoading(false);
        return;
      }
      const idToken = await user.getIdToken();
      setCookie('token', idToken, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      toast.success(`Welcome back, ${user.displayName || 'User'}!`);
      setFormData({ email: '', password: '' });
      router.push('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
          toast.error('No account found with this email address. Please sign up first.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password. Please try again or reset your password.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          toast.error('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed login attempts. Please try again later.');
          break;
        default:
          toast.error('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-300">Sign in to your Resume2Video account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className={`w-full p-3 pl-10 pr-10 rounded-xl border ${formData.email && (emailValid ? 'border-green-500' : 'border-red-500')
                } bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
            />
            {formData.email && emailValid && (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="absolute right-3 top-10 h-5 w-5 text-green-500"
              />
            )}
          </div>
          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="w-full p-3 pl-10 pr-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
            <button
              type="button"
              className="absolute right-3 top-10"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              />
            </button>
          </div>
          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={!emailValid}
              className={`text-sm transition-colors ${emailValid
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-gray-500 cursor-not-allowed'
                }`}
            >
              {resetEmailSent ? '✓ Reset email sent' : 'Forgot password?'}
            </button>
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !emailValid || formData.password.length < 6}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${loading || !emailValid || formData.password.length < 6
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>
        {/* Quick Access Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="text-center">
            <p className="text-sm text-blue-300 mb-2">
              🚀 New to Resume2Video?
            </p>
            <p className="text-xs text-gray-300">
              Create professional video resumes with AI-powered avatars and voices in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
