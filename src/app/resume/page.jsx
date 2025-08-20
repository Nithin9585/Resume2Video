'use client';
import React, { useState, useEffect } from 'react';
import { Upload, ImagePlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../../../firebase/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Loading from '../Loading';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist/webpack';
function Resume() {
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [resumeProgress, setResumeProgress] = useState(0);
  const [resumeURL, setResumeURL] = useState('');
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [imageProgress, setImageProgress] = useState(0);
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/Login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);
  if (loading) {
    return <Loading />;
  }
  const uploadFile = async (file, folder, setProgress, setUrl) => {
    const formData = new FormData();
    formData.append('file', file);
    const config = {
      method: 'POST',
      body: formData,
    };
    try {
      const response = await fetch('/api/Upload', config);
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      const data = await response.json();
      if (data.url) {
        setUrl(data.url);
      } else {
        throw new Error(data.message || 'File upload failed');
      }
    } catch (error) {
      toast.error('Image upload failed. Please try again.');
    }
  };
  const generateScript = async (resumeText) => {
    try {
      const response = await fetch('/api/GenerateScript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parsedResume: resumeText }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Script generation failed');
      }
      if (!data.script) {
        throw new Error('No script returned from API');
      }
      return data.script;
    } catch (error) {
      throw new Error(`Script generation failed: ${error.message}`);
    }
  };
  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        try {
          const pdfjsLib = await import('pdfjs-dist/build/pdf');
          const pdfWorkerSrc = await import('pdfjs-dist/build/pdf.worker.min.mjs?worker');
          pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([pdfWorkerSrc.default], { type: 'application/javascript' }));
          const typedArray = new Uint8Array(fileReader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ') + '\n';
          }
          const cleanedText = text
            .replace(/[^\w\s@.-]/g, ' ') // Remove special characters except email/web chars
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();
          const words = cleanedText.split(' ').filter(word => word.length > 2);
          const validWordCount = words.filter(word => /^[a-zA-Z]+$/.test(word)).length;
          if (validWordCount < 10) {
            reject('PDF text extraction failed. The document may be an image-based PDF or corrupted. Please try a different PDF file.');
            return;
          }
          resolve(cleanedText);
        } catch (error) {
          reject('Error extracting PDF text: ' + error.message);
        }
      };
      fileReader.onerror = (error) => reject('Error reading file: ' + error.message);
      fileReader.readAsArrayBuffer(file);
    });
  };
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      if (type === 'resume') {
        setResume(file);
        setResumeName(file.name);
      } else {
        setImage(file);
        setImageName(file.name);
      }
    }
  };
  const handleSubmit = async () => {
    if (!resume || !image) {
      toast.error('Please upload both resume and profile picture.');
      return;
    }
    setUploading(true);
    try {
      let uploadedImageURL = "";
      await uploadFile(image, 'profile_pictures', setImageProgress, (url) => {
        uploadedImageURL = url;
      });
      if (!uploadedImageURL) {
        throw new Error("Image upload failed. Try again.");
      }
      let extractedText;
      try {
        extractedText = await extractTextFromPDF(resume);
      } catch (pdfError) {
        extractedText = `Resume file: ${resumeName}. Name: User. Please generate a basic professional introduction script.`;
      }
      const generatedScript = await generateScript(extractedText);
      if (user) {
        const userdataRef = doc(firestore, 'userdata', user.uid);
        await setDoc(userdataRef, {
          script: generatedScript,
          imageURL: uploadedImageURL,
          resumeName: resumeName,
          updatedAt: serverTimestamp(),
        });
        toast.success('Upload & script generation successful!');
        router.push('/review_resume_prompt');
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      let errorMessage = 'Upload failed. Please try again.';
      if (error.message.includes('PDF text extraction failed')) {
        errorMessage = 'PDF could not be read. Please ensure your PDF has selectable text.';
      } else if (error.message.includes('Image upload failed')) {
        errorMessage = 'Image upload failed. Please check your internet connection and try again.';
      } else if (error.message.includes('Script generation failed')) {
        errorMessage = 'Script generation failed. Please try again or contact support.';
      } else if (error.message.includes('User not authenticated')) {
        errorMessage = 'Please log in again and try uploading.';
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/20 to-slate-800/20">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Upload Your Files
          </h1>
          <p className="text-gray-300 text-lg">
            Upload your resume and profile picture to get started
          </p>
        </div>
        {/* Main upload card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="space-y-8">
            {/* Resume Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Upload className="mr-3 h-6 w-6 text-cyan-400" />
                Resume (PDF)
              </h3>
              <label htmlFor="resume-upload" className="group relative block w-full cursor-pointer">
                <div className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${resumeName
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 hover:border-cyan-400 hover:bg-cyan-400/5'
                  }`}>
                  <div className="flex flex-col items-center text-center">
                    {resumeName ? (
                      <>
                        <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                          <Upload className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-green-400 font-medium text-lg">{resumeName}</p>
                        <p className="text-gray-400 text-sm mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <p className="text-white font-medium text-lg mb-2">Upload your resume</p>
                        <p className="text-gray-400 text-sm">PDF format, max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'resume')}
                />
              </label>
              {resumeProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${resumeProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            {/* Profile Picture Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <ImagePlus className="mr-3 h-6 w-6 text-purple-400" />
                Profile Picture
              </h3>
              <label htmlFor="image-upload" className="group relative block w-full cursor-pointer">
                <div className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${imageName
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-gray-600 hover:border-purple-400 hover:bg-purple-400/5'
                  }`}>
                  <div className="flex flex-col items-center text-center">
                    {imageName ? (
                      <>
                        <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mb-4">
                          <ImagePlus className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-green-400 font-medium text-lg">{imageName}</p>
                        <p className="text-gray-400 text-sm mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-400/20 transition-colors">
                          <ImagePlus className="h-8 w-8 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                        <p className="text-white font-medium text-lg mb-2">Upload profile picture</p>
                        <p className="text-gray-400 text-sm">JPG or PNG format, max 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
              </label>
              {imageProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${imageProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            {/* Submit Button */}
            <div className="pt-6 border-t border-white/10">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400 flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Your information is securely stored and encrypted
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || !resume || !image}
                  className="w-full md:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 border-0 rounded-xl px-12 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="mr-3 h-5 w-5" />
                      Generate Video Script
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-cyan-400 text-2xl mb-2">🔒</div>
            <div className="text-white font-semibold text-sm">Secure Upload</div>
            <div className="text-gray-400 text-xs">Your files are protected</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-blue-400 text-2xl mb-2">⚡</div>
            <div className="text-white font-semibold text-sm">Fast Processing</div>
            <div className="text-gray-400 text-xs">AI-powered extraction</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-purple-400 text-2xl mb-2">🎬</div>
            <div className="text-white font-semibold text-sm">Pro Results</div>
            <div className="text-gray-400 text-xs">Studio-quality output</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Resume;
