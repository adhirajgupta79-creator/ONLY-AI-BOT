
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Total sequence:
    // 0.0s: Start
    // 0.0s - 0.4s: Text fades in
    // 0.3s - 0.7s: Logo fades in (overlap)
    // 1.2s: Begin exit
    // 1.7s: Finish
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinish, 500); // Wait for exit fade out (0.5s)
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#212121] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      <style>{`
        @keyframes sparkleEnter {
          0% { opacity: 0; transform: scale(0) rotate(45deg); }
          60% { opacity: 1; transform: scale(1.1) rotate(0deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes textFadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)); }
        }
        
        /* Logo animations start AFTER text begins */
        .sparkle-1 { animation: sparkleEnter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.3s; opacity: 0; }
        .sparkle-2 { animation: sparkleEnter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.4s; opacity: 0; }
        .sparkle-3 { animation: sparkleEnter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; animation-delay: 0.5s; opacity: 0; }
        
        .logo-container {
          animation: pulseGlow 3s ease-in-out infinite 0.8s;
        }

        /* Text starts immediately */
        .animate-text {
          animation: textFadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* 3-Diamond Sparkle Logo */}
      <div className="w-14 h-14 mb-6 relative logo-container">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Sparkle 1 (Large - Center) */}
          <path 
            className="sparkle-1"
            d="M50 10 C50 35 70 50 95 50 C 70 50 50 65 50 90 C 50 65 30 50 5 50 C 30 50 50 35 50 10 Z" 
            fill="white" 
          />
          
          {/* Sparkle 2 (Medium - Top Right) */}
          <path 
            className="sparkle-2"
            d="M80 5 C80 15 88 22 98 22 C 88 22 80 29 80 39 C 80 29 72 22 62 22 C 72 22 80 15 80 5 Z" 
            fill="white" 
          />
          
          {/* Sparkle 3 (Medium/Small - Bottom Left) */}
          <path 
            className="sparkle-3"
            d="M20 60 C20 70 28 77 38 77 C 28 77 20 84 20 94 C 20 84 12 77 2 77 C 12 77 20 70 20 60 Z" 
            fill="white" 
          />
        </svg>
      </div>

      {/* Typography */}
      <h1 className="text-white text-xl font-bold tracking-[0.4em] animate-text font-sans">
        CREATOR
      </h1>
    </div>
  );
};
