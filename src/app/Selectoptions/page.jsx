'use client';

import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

function SelectOptions() {
  const [avatars, setAvatars] = useState([]);
  const [userGender, setUserGender] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the user's gender
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserGender(userData.gender || '');
          } else {
            console.warn("No user data found");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        console.log("No user is signed in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userGender) return;

    const fetchAvatars = async () => {
      try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
          method: 'GET',
          headers: {
            'x-api-key': 'NTQ0MGM4NjQyZjUwNGU5YjlkZmUwNzE5YzA1YWJjNDUtMTczODEyNjU2NA==',
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const filteredAvatars = data.data.avatars
          .filter((avatar) => avatar.gender === userGender)
          .slice(0, 12);

        setAvatars(filteredAvatars);
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };

    fetchAvatars();
  }, [userGender]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4 text-white">Select Avatar</h2>
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : avatars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {avatars.map((avatar) => (
            <div key={avatar.avatar_id} className="avatar-card bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-gray-300 flex flex-col items-center">
              <div className="w-full h-40 flex items-center justify-center mb-2">
                <img
                  src={avatar.preview_image_url}
                  alt={avatar.avatar_name}
                  className="object-cover rounded-md w-32 h-32"
                />
              </div>
              <h3 className="text-lg font-medium mb-2 text-white">{avatar.avatar_name}</h3>
              <p className="text-sm text-white">Gender: {avatar.gender}</p>

              <Link href={`/SelectVoices/?avatarId=${avatar.avatar_id}`}>
                <button className="bg-blue-500 m-4 text-white py-2 px-4 cursor-pointer rounded-full mb-2">
                  Select
                </button>
              </Link>

              {avatar.preview_video_url ? (
                <video width="100%" controls>
                  <source src={avatar.preview_video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="text-sm text-white">No preview video available.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">No avatars found for your gender.</p>
      )}
    </div>
  );
}

export default SelectOptions;
