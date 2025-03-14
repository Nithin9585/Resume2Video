import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function middleware(req) {
  // Get the ID token from the request headers or cookies
  const token = req.cookies.get('token');  // Assuming you're storing it in cookies, or retrieve from headers if using authorization header
  
  if (!token) {
    // If no token is found, redirect to the login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Proceed with the request if the user is authenticated
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Apply middleware to protected routes
export const config = {
  matcher: ['/dashboard', '/resume', '/review_resume_prompt'],  // Adjust the routes to be protected
};
