
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI } from '@google/genai';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceLogicProps {
  apiKey?: string;
  trigger: boolean; // Toggles to start listening
  onStateChange: (state: VoiceState) => void;
  onTranscript: (role: 'user' | 'model', text: string) => void;
}

export const VoiceLogic: React.FC<VoiceLogicProps> = ({ 
    apiKey, 
    trigger, 
    onStateChange,
    onTranscript
}) => {
  const [internalState, setInternalState] = useState<VoiceState>('idle');
  const recognitionRef = useRef<any>(null);
  const stopListenerRef = useRef<any>(null);
  
  // Propagate state upwards
  useEffect(() => {
      onStateChange(internalState);
  }, [internalState, onStateChange]);

  // Handle Trigger (Click)
  useEffect(() => {
      if (trigger && internalState === 'idle') {
          startListeningForQuery();
      } else if (trigger && (internalState === 'listening' || internalState === 'speaking')) {
          // Manual stop/cancel if clicked while active
          abortAll();
          setInternalState('idle');
      }
  }, [trigger]);

  const abortAll = () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (stopListenerRef.current) stopListenerRef.current.abort();
      window.speechSynthesis.cancel();
  };

  // --- 1. USER QUERY LISTENER ---
  const startListeningForQuery = () => {
      if (typeof window === 'undefined') return;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Speech recognition not supported in this browser.");
          return;
      }

      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      // Use en-IN to capture both English and Indian languages (Hindi/Hinglish) effectively
      recognizer.lang = 'en-IN'; 
      
      recognizer.onstart = () => setInternalState('listening');
      
      recognizer.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
              handleQuery(transcript);
          } else {
              setInternalState('idle');
          }
      };

      recognizer.onerror = (e: any) => {
          console.log("Recog error", e);
          setInternalState('idle');
      };
      
      recognizer.onend = () => {
          if (internalState === 'listening') {
              // If no result processed, go idle
              // setInternalState('idle'); // handled by result or error usually
          }
      };

      recognitionRef.current = recognizer;
      recognizer.start();
  };

  // --- 2. PROCESS & GENERATE ---
  const handleQuery = async (text: string) => {
      setInternalState('processing');
      onTranscript('user', text);

      try {
          const ai = new GoogleGenAI({ apiKey: apiKey || 'DEMO_KEY' });
          const result = await ai.models.generateContent({
              model: 'gemini-3-pro-preview',
              config: {
                // INSTRUCTION: Reply in the same language with strict instruction
                systemInstruction: "You are CREATOR. Detect the user's language and reply in the EXACT SAME LANGUAGE. If the user speaks Hindi, reply in Hindi (using Devanagari script). If English, reply in English. Keep the response natural, concise, and helpful."
              },
              contents: text
          });

          const responseText = result.text;
          if (responseText) {
              setInternalState('speaking');
              onTranscript('model', responseText);
              speakResponse(responseText);
          } else {
              setInternalState('idle');
          }
      } catch (e) {
          console.error(e);
          setInternalState('idle');
      }
  };

  // --- Helper: Sanitize text for speech ---
  const sanitizeForSpeech = (text: string) => {
      return text
          .replace(/[*#_`~>]/g, '') // Remove Markdown characters
          .replace(/\[.*?\]/g, '')  // Remove citations like [1]
          .replace(/https?:\/\/\S+/g, '') // Remove URLs
          .replace(/\s+/g, ' ')     // Collapse extra whitespace
          .trim();
  };

  // --- 3. TTS & STOP LISTENER ---
  const speakResponse = (text: string) => {
      const synth = window.speechSynthesis;
      
      // Sanitize the text so it only speaks words, not symbols
      const spokenText = sanitizeForSpeech(text);
      
      const utterance = new SpeechSynthesisUtterance(spokenText);

      // --- VOICE SELECTION LOGIC (INDIAN ACCENT PRIORITY) ---
      // Wait for voices to be loaded if they aren't yet
      const setVoice = () => {
          const voices = synth.getVoices();
          
          // Regex checks for scripts
          const isUrdu = /[\u0600-\u06FF]/.test(text); // Arabic script
          const isPunjabi = /[\u0A00-\u0A7F]/.test(text); // Gurmukhi
          const isHindi = /[\u0900-\u097F]/.test(text); // Devanagari
          
          let selectedVoice = null;

          if (isUrdu) {
              selectedVoice = voices.find(v => v.lang.includes('ur'));
          } else if (isPunjabi) {
              selectedVoice = voices.find(v => v.lang === 'pa-IN' || v.lang.includes('pa'));
          } else if (isHindi) {
              // Prioritize Google Hindi or strict hi-IN
              selectedVoice = voices.find(v => v.name.includes('Google Hindi') || v.lang === 'hi-IN');
          } else {
              // Default / English: STRICTLY enforce Indian English Accent
              selectedVoice = 
                voices.find(v => v.lang === 'en-IN') || 
                voices.find(v => v.name.includes('India') && v.lang.includes('en')) ||
                voices.find(v => v.name.includes('Google English India'));
          }

          // Fallback: If no specific language match, try to find ANY 'IN' (India) voice
          if (!selectedVoice) {
               selectedVoice = voices.find(v => v.lang.includes('IN'));
          }
          
          // Absolute Fallback
          if (!selectedVoice && voices.length > 0) {
              selectedVoice = voices[0];
          }

          if (selectedVoice) {
              utterance.voice = selectedVoice;
              // console.log("Selected Voice:", selectedVoice.name, selectedVoice.lang);
          }
      };

      if (synth.getVoices().length === 0) {
          synth.onvoiceschanged = setVoice;
      } else {
          setVoice();
      }
      
      // Adjust properties for a clearer Indian accent delivery
      utterance.pitch = 1.0; 
      utterance.rate = 1.0; 
      
      utterance.onstart = () => {
          startBargeInListener();
      };

      utterance.onend = () => {
          stopBargeInListener();
          setInternalState('idle');
      };
      
      utterance.onerror = () => {
          stopBargeInListener();
          setInternalState('idle');
      };

      synth.speak(utterance);
  };

  const startBargeInListener = () => {
      if (typeof window === 'undefined') return;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US'; // Listen for commands

      recognizer.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             const raw = event.results[i][0].transcript.toLowerCase();
             // STOP Words in English, Hindi, Urdu, Punjabi
             if (
                 raw.includes('stop') || 
                 raw.includes('cancel') || 
                 raw.includes('bas') || 
                 raw.includes('ruko') ||
                 raw.includes('chup')
            ) {
                 window.speechSynthesis.cancel();
                 recognizer.abort();
                 setInternalState('idle');
             }
          }
      };

      stopListenerRef.current = recognizer;
      try { recognizer.start(); } catch(e) {}
  };

  const stopBargeInListener = () => {
      if (stopListenerRef.current) {
          stopListenerRef.current.abort();
          stopListenerRef.current = null;
      }
  };

  return null; // Logic only component
};
