'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../../firebase/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import { faUser, faEnvelope, faLock, faTransgenderAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      localStorage.setItem('RegistrationData', JSON.stringify({ firstName, lastName, gender }));

      setMessage('Registration successful. A verification email has been sent to your email address. Please verify your email before logging in.');
      
      setFirstName('');
      setLastName('');
      setGender('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');

      // Remove the immediate redirection to the login page
      // router.push('/Login');
      
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else {
        setError('An error occurred, please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-opacity-80 border-2 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center text-white mb-6">Register</h1>

        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <label htmlFor="firstName" className="sr-only">First Name</label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            />
          </div>

          <div className="relative">
            <label htmlFor="lastName" className="sr-only">Last Name</label>
            <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            />
          </div>

          <div className="relative">
            <label htmlFor="gender" className="sr-only">Gender</label>
            <FontAwesomeIcon icon={faTransgenderAlt} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full p-2 pl-10 pr-8 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="relative">
            <label htmlFor="email" className="sr-only">Email Address</label>
            <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-gray-400" />
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
            <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-white"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-gray-400" />
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-transparent hover:border-2 hover:border-blue-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 border border-transparent"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <p className="mt-4 text-center text-white">
          Already have an account?{' '}
          <Link href="/Login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
