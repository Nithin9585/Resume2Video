import React from 'react';
import Spline from "@splinetool/react-spline";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      {/* <div className="relative w-20 h-20">
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 animate-pulse-gradient"></div>
        <div className="absolute w-full h-full rounded-full border-4 border-white animate-spin-slow"></div>
      </div> */}

<Spline
          className="fixed inset-0 -z-10 w-full h-full scale-[1.2]"
        scene="https://prod.spline.design/IML50OYfHkF2Wl8Y/scene.splinecode" 
          />
    </div>
  );
}

export default Loading;