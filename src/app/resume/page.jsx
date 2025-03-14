'use client'
import React, { useState, useEffect } from 'react';
import { Upload, ImagePlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, firestore } from '../../../firebase/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Loading from '../Loading';
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
      console.log(data.url);

      if (data.url) {
        setUrl(data.url); 
      } else {
        throw new Error(data.message || 'File upload failed');
      }
    } catch (error) {
      console.error("Upload Error:", error.message); 
      throw new Error('image upload failed');
    }
  };

  const generateScript = async (resumeText)=>{
    const response = await fetch('/api/GenerateScript', {
      method: 'POST',
      body: JSON.stringify({parsedResume: resumeText}),
    });
    const data = await response.json();
    return data.script;
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
  
          resolve(text);
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
        alert('File size should not exceed 5MB');
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
      alert('Please upload both resume and profile picture.');
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
  
      console.log("Uploaded Image URL:", uploadedImageURL);
  
      const extractedText = await extractTextFromPDF(resume);
      console.log("Extracted Resume Text:", extractedText);
  
      const generatedScript = await generateScript(extractedText);
      console.log("Generated Video Script:", generatedScript);
  
      if (user) {
        const userdataRef = doc(firestore, 'userdata', user.uid);
  
        await setDoc(userdataRef, {
          script: generatedScript, 
          imageURL: uploadedImageURL,
          resumeName: resumeName,
          updatedAt: serverTimestamp(),
        });
  
        alert('Upload & script generation successful!');
        router.push('/review_resume_prompt'); 
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="w-full h-screen p-3 flex items-center justify-center">
      <div className="flex flex-col bg-opacity-60 backdrop-blur-lg items-center justify-center p-8 max-w-lg w-full rounded-3xl shadow-2xl border border-gray-300">
        <h1 className="text-3xl font-extrabold text-white mb-8 text-center">Upload Your Resume and Profile Picture</h1>

        <div className="space-y-6 w-full">
          <div className="flex flex-col items-center w-full">
            <label htmlFor="resume-upload" className="w-full flex flex-col items-center justify-center cursor-pointer border border-dashed border-gray-300 p-6 rounded-lg hover:shadow-md">
              <Upload className="mr-2 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-300 mt-2">{resumeName || 'Click to Upload Resume (PDF)'}</p>
            </label>
            <input type="file" id="resume-upload" accept=".pdf" className="hidden" onChange={(e) => handleFileChange(e, 'resume')} />
            {resumeProgress > 0 && <p className="text-sm text-gray-400 mt-2">Upload Progress: {resumeProgress.toFixed(2)}%</p>}
          </div>
          <div className="flex flex-col items-center w-full">
            <label htmlFor="image-upload" className="w-full flex flex-col items-center justify-center cursor-pointer border border-dashed border-gray-300 p-6 rounded-lg hover:shadow-md">
              <ImagePlus className="mr-2 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-300 mt-2">{imageName || 'Click to Upload Profile Picture (JPG/PNG)'}</p>
            </label>
            <input type="file" id="image-upload" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
            {imageProgress > 0 && <p className="text-sm text-gray-400 mt-2">Upload Progress: {imageProgress.toFixed(2)}%</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center w-full">
          <p className="text-sm text-gray-400">Your information is securely stored.</p>
          <Button onClick={handleSubmit} className="mt-6 cursor-pointer bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-8 rounded-xl flex items-center shadow-md hover:shadow-lg" disabled={uploading}>
            {uploading ? 'Uploading...' : <><Send className="mr-2 h-5 w-5" />Submit</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Resume;
