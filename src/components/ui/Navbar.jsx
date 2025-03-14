'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { auth } from '../../../firebase/firebase'; 
import { signOut } from 'firebase/auth';


function Navbar() {
  const [user, setUser] = useState(null);
  console.log(user);
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe(); 
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="bg-transparent text-white p-10 flex justify-between items-center ">
      <Link href="/">
        <div className="text-lg  flex items-center hover:shadow-lg transition-shadow font-semibold">
          <span className="text-transparent bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text">Resume2Video</span>
        </div>
      </Link>

      <div className="md:hidden">
        <Sheet>
          <div className="flex justify-center items-center">
            <SheetTrigger>
              <div className="flex justify-center items-center">
                <svg
                  className="w-6 h-6 m-2 cursor-pointer"
                  fill="green"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              </div>
            </SheetTrigger>
          </div>

          <SheetContent className="bg-transparent">
            <SheetHeader>
              <SheetTitle className="text-teal-600">Resume2Video</SheetTitle>
              <SheetDescription>
                <div className="flex p-10 flex-col gap-8 items-center">
                  {!user ? (
                    <>
                      <Link href="/Login" className="hover:text-blue-300">Login</Link>
                      <Link href="/register" className="hover:text-blue-300">Sign Up</Link>
                    </>
                  ) : (
                    <>
                      <span className="text-white">Welcome, {user.reloadUserInfo.email || 'User'}</span>
                      <button
                        onClick={handleLogout}
                        className="hover:text-blue-300 cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  )}
                  <Link href="/" className="hover:text-blue-300">Home</Link>
                  <Link href="#projects" className="hover:text-blue-300">About Projects</Link>
                  <Link href="https://github.com/yourusername" passHref>
                    <FaGithub className="text-2xl hover:text-gray-400 cursor-pointer" />
                  </Link>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:flex space-x-6">
        {!user ? (
          <>
            <Link href="/Login">
              <span className="px-4 py-2 hover:text-blue-300 transition duration-300 cursor-pointer">Login</span>
            </Link>
            <Link href="/register">
              <span className="hover:text-blue-300 transition duration-300 cursor-pointer">Sign Up</span>
            </Link>
          </>
        ) : (
          <>
            <span className="text-white">Welcome, {user.reloadUserInfo.email || 'User'}</span>
            <button
              onClick={handleLogout}
              className="hover:text-blue-300 transition duration-300 cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
        <Link href="#projects">
          <span className="hover:text-blue-300 cursor-pointer">About Projects</span>
        </Link>

        <Link href="https://github.com/yourusername" passHref>
          <FaGithub className="text-2xl hover:text-gray-400 cursor-pointer" />
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
