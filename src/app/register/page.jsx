'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { faUser, faEnvelope, faLock, faTransgenderAlt, faEye, faEyeSlash, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { toast } from 'sonner';
function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [emailValid, setEmailValid] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const router = useRouter();
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('One uppercase letter');
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('One lowercase letter');
    if (/\d/.test(password)) score += 1;
    else feedback.push('One number');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('One special character');
    return {
      score,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!'
    };
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    if (field === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    }
    if (field === 'email') {
      setEmailValid(validateEmail(value));
    }
    const { firstName, lastName, gender, email, password, confirmPassword } = newFormData;
    const isValid = firstName.trim() && lastName.trim() && gender &&
      validateEmail(email) && password.length >= 6 &&
      password === confirmPassword;
    setFormValid(isValid);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { firstName, lastName, gender, email, password, confirmPassword } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name');
      setLoading(false);
      return;
    }
    if (!gender) {
      toast.error('Please select your gender');
      setLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error('Please choose a stronger password');
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      await setDoc(doc(firestore, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        email: email.toLowerCase(),
        displayName: `${firstName} ${lastName}`,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        emailVerified: false,
        profileCompleted: false,
        accountType: 'free',
        preferences: {
          notifications: true,
          newsletter: false
        }
      });
      await sendEmailVerification(user);
      await signOut(auth);
      toast.success('Registration successful! Please check your email to verify your account before logging in.');
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        router.push('/verify-email');
      }, 2000);
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          toast.error('This email is already registered. Try logging in instead.');
          break;
        case 'auth/invalid-email':
          toast.error('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          toast.error('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/operation-not-allowed':
          toast.error('Registration is currently disabled. Please try again later.');
          break;
        default:
          toast.error('Registration failed. Please try again.');
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
            Create Account
          </h1>
          <p className="text-gray-300">Join Resume2Video and create amazing video resumes</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-6">
          {/* First Name */}
          <div className="relative">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>
          {/* Last Name */}
          <div className="relative">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              className="w-full p-3 pl-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
            />
          </div>
          {/* Gender */}
          <div className="relative">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
              Gender
            </label>
            <FontAwesomeIcon icon={faTransgenderAlt} className="absolute left-3 top-10 h-5 w-5 text-gray-400 z-10" />
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              required
              className="w-full p-3 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-gray-800 text-gray-300">Select Gender</option>
              <option value="male" className="bg-gray-800 text-white">Male</option>
              <option value="female" className="bg-gray-800 text-white">Female</option>
              <option value="other" className="bg-gray-800 text-white">Other</option>
              <option value="prefer-not-to-say" className="bg-gray-800 text-white">Prefer not to say</option>
            </select>
          </div>
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
            {formData.email && (
              <FontAwesomeIcon
                icon={emailValid ? faCheckCircle : faTimesCircle}
                className={`absolute right-3 top-10 h-5 w-5 ${emailValid ? 'text-green-500' : 'text-red-500'}`}
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
              placeholder="Create a strong password"
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
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex space-x-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${level <= passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-red-500'
                            : passwordStrength.score <= 4
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          : 'bg-gray-600'
                        }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.score <= 2 ? 'text-red-400' :
                    passwordStrength.score <= 4 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                  {passwordStrength.feedback}
                </p>
              </div>
            )}
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
              className={`w-full p-3 pl-10 pr-10 rounded-xl border ${formData.confirmPassword &&
                (formData.password === formData.confirmPassword ? 'border-green-500' : 'border-red-500')
                } bg-white/5 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all`}
            />
            <button
              type="button"
              className="absolute right-3 top-10"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              />
            </button>
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2">
                <p className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {formData.password === formData.confirmPassword ?
                    '✓ Passwords match' :
                    '✗ Passwords do not match'
                  }
                </p>
              </div>
            )}
          </div>
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !formValid}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${loading || !formValid
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
              }`}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link
              href="/Login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
        {/* Terms */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;
