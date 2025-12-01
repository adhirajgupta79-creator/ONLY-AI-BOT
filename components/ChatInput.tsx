
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string, mode?: string) => void;
  disabled?: boolean;
}

type ChatMode = 'deep' | 'instant' | 'study';

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ChatMode | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSend(input, selectedMode || undefined);
    setInput('');
    setSelectedMode(null); 
    setIsMenuOpen(false);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModeSelect = (mode: ChatMode) => {
    setSelectedMode(mode);
    setIsMenuOpen(false);
    textareaRef.current?.focus();
  };

  const getModeLabel = (mode: ChatMode) => {
    switch (mode) {
      case 'deep': return 'Deep Search';
      case 'instant': return 'Instant Reply';
      case 'study': return 'Study & Learn';
      default: return '';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-64 bg-white dark:bg-gpt-sidebar rounded-xl shadow-2xl border border-neutral-200 dark:border-gray-700 overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-1 space-y-0.5">
            <button 
              onClick={() => handleModeSelect('deep')}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-100 dark:hover:bg-gpt-hover rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-gray-100">Deep Search</div>
                <div className="text-[10px] text-neutral-500 dark:text-gray-400">Detailed insights (150-200 words)</div>
              </div>
            </button>

            <button 
              onClick={() => handleModeSelect('instant')}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-100 dark:hover:bg-gpt-hover rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
               <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-gray-100">Instant Reply</div>
                <div className="text-[10px] text-neutral-500 dark:text-gray-400">Minimal response (50-75 words)</div>
              </div>
            </button>

            <button 
              onClick={() => handleModeSelect('study')}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-100 dark:hover:bg-gpt-hover rounded-lg transition-colors"
            >
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.516 50.552 50.552 0 00-2.658.813m-15.482 0A50.553 50.553 0 0112 13.489a50.551 50.551 0 0110.499-3.341" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-sm text-neutral-900 dark:text-gray-100">Study & Learn</div>
                <div className="text-[10px] text-neutral-500 dark:text-gray-400">In-depth educational explanations</div>
              </div>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-white dark:bg-gpt-input p-3 rounded-xl border border-neutral-200 dark:border-none shadow-sm dark:shadow-md transition-all">
        
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
            isMenuOpen 
              ? 'bg-neutral-100 dark:bg-gray-600 text-black dark:text-white' 
              : 'text-neutral-400 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-gray-600'
          }`}
          aria-label="More options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        <div className="flex-1 relative min-w-0">
          {selectedMode && (
             <div className="absolute -top-10 left-0 flex justify-start pointer-events-none">
                <div className="bg-neutral-100 dark:bg-gpt-hover text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm text-neutral-700 dark:text-gray-200 pointer-events-auto border border-neutral-200 dark:border-gray-600">
                   <span>{getModeLabel(selectedMode)}</span>
                   <button 
                    type="button"
                    onClick={() => setSelectedMode(null)}
                    className="hover:text-red-500 dark:hover:text-red-400"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                   </button>
                </div>
             </div>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            className={`w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-2 px-0 max-h-[150px] text-black dark:text-gray-100 placeholder:text-neutral-400 dark:placeholder:text-gray-400 text-base leading-relaxed`}
            placeholder="Ask creator..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              input.trim() && !disabled 
                ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-500' 
                : 'bg-transparent text-neutral-300 dark:text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {disabled && input.trim() ? (
               <svg className="animate-spin h-5 w-5 text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
          )}
        </button>
      </form>
    </div>
  );
};
