
import React, { useEffect, useRef } from 'react';

interface WakeWordListenerProps {
  isListening: boolean;
  onWake: () => void;
}

export const WakeWordListener: React.FC<WakeWordListenerProps> = ({ isListening, onWake }) => {
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(isListening);
  const wakeLockRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update ref to track current status without restarting effect
  useEffect(() => {
    isListeningRef.current = isListening;
    if (!isListening) {
        wakeLockRef.current = false;
        stopWatchdog();
        stopListening();
    } else {
        startListening();
        startWatchdog();
    }
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopWatchdog();
        stopListening();
    };
  }, []);

  const startWatchdog = () => {
      stopWatchdog();
      watchdogRef.current = setInterval(() => {
          if (isListeningRef.current && !recognitionRef.current && !wakeLockRef.current) {
              // console.log("Watchdog restarting listener...");
              startListening();
          }
      }, 1000); // Check every second
  };

  const stopWatchdog = () => {
      if (watchdogRef.current) {
          clearInterval(watchdogRef.current);
          watchdogRef.current = null;
      }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Prevent multiple instances if one is already running
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; 
    recognition.lang = 'en-US'; 
    recognition.maxAlternatives = 20; // Maximum sensitivity

    recognition.onresult = (event: any) => {
      if (!isListeningRef.current || wakeLockRef.current) return;

      // Iterate backwards through results for speed (newest first)
      for (let i = event.results.length - 1; i >= event.resultIndex; --i) {
        const result = event.results[i];
        
        // Check ALL alternatives
        for (let j = 0; j < result.length; j++) {
            // Normalize: lowercase, remove punctuation AND hyphens
            const rawTranscript = result[j].transcript.toLowerCase();
            const transcript = rawTranscript.trim().replace(/[.,!?;:-]/g, '');
            
            // --- LEVEL 1: ULTRA-FAST START TRIGGER ---
            // Trigger immediately if we hear "Hey" followed by a "C/K/G/Q" sound.
            // This catches "Hey Cre...", "Hey Cra...", "Hey Great..." before the word finishes.
            const triggerStartRegex = /^(hey|hi|hello|he|ha|ay)\s*(c|k|g|q|x)/i;
            
            // --- LEVEL 2: PHONETIC SKELETON ---
            // Catches "Creator" even if mumbled: K-R-EA-T-OR structure
            const skeletonRegex = /(c|k|g|q)(r|w)?(ea|ae|ai|ay|a|e)(t|d)(or|er|ur|e|a)?/i;

            // --- LEVEL 3: BROAD PHRASES ---
            const specificPhrases = [
                'hey', 'hi', 'hello', // Ultra sensitive single words if detected clearly at start
                'creator', 'crater', 'greater', 'creative', 'creature',
                'hey creator', 'hi creator', 'hello creator',
                'hey crater', 'hey greater', 'hey creative',
                'hey create', 'hi create', 'hey crate', 'hey great',
                'hey gator', 'hey rita', 'hey radar', 'hey trader',
                'high creator', 'head creator', 'a creator',
                'he creator', 'the creator', 'recreation',
                'decorator', 'aviator', 'curator', 'equator',
                'kreator', 'critter', 'traitor', 'cryptor'
            ];

            const isSpecificMatch = specificPhrases.some(phrase => transcript.includes(phrase));
            
            // Check match
            if (triggerStartRegex.test(transcript) || skeletonRegex.test(transcript) || isSpecificMatch) {
               triggerWake();
               return;
            }
        }
      }
    };

    const triggerWake = () => {
        wakeLockRef.current = true;
        
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; 
            recognitionRef.current.abort(); 
            recognitionRef.current = null;
        }
        onWake();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (isListeningRef.current && !wakeLockRef.current) {
          // Instant restart (10ms)
          setTimeout(startListening, 10); 
      }
    };
    
    recognition.onerror = (event: any) => {
        // Silently handle errors and restart via onend or watchdog
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isListeningRef.current = false;
        } else {
             recognitionRef.current = null;
        }
    };

    recognitionRef.current = recognition;
    try {
        recognition.start();
    } catch (e) {
        // console.error("Failed to start wake word listener", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.abort(); 
      recognitionRef.current = null;
    }
  };

  return null;
};
