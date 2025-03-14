import React from 'react';

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative w-20 h-20">
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 animate-pulse-gradient"></div>
        <div className="absolute w-full h-full rounded-full border-4 border-white animate-spin-slow"></div>
      </div>
    </div>
  );
}

export default Loading;