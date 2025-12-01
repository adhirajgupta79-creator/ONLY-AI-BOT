
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#212121] flex items-center justify-center shadow-sm overflow-hidden text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </div>
      <div className="bg-white dark:bg-transparent border border-neutral-200 dark:border-none px-4 py-3 rounded-2xl rounded-tl-none dark:p-0 dark:px-1 shadow-sm dark:shadow-none flex items-center gap-1 h-[46px]">
        <span className="typing-dot block w-2 h-2 bg-neutral-400 dark:bg-gray-400 rounded-full"></span>
        <span className="typing-dot block w-2 h-2 bg-neutral-400 dark:bg-gray-400 rounded-full"></span>
        <span className="typing-dot block w-2 h-2 bg-neutral-400 dark:bg-gray-400 rounded-full"></span>
      </div>
    </div>
  );
};
