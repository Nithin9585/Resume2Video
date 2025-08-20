import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
export async function middleware(req) {
  const token = req.cookies.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/Login', req.url));
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token.value);

    if (!decodedToken.email_verified) {
      return NextResponse.redirect(new URL('/Login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/Login', req.url));
  }
}
export const config = {
  matcher: ['/dashboard', '/resume', '/review_resume_prompt', '/Selectoptions', '/SelectVoices', '/PreviewSelection', '/Downloadpage'],
};
