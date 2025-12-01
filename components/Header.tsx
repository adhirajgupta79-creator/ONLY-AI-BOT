
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  onMicClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  onMenuClick
}) => {
  return (
    <header className="bg-white dark:bg-gpt-main border-b border-neutral-100 dark:border-none p-4 flex items-center gap-3 sticky top-0 z-10 transition-colors duration-200 pr-4">
      <button 
        onClick={onMenuClick}
        className="mr-1 p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gpt-card text-neutral-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <div className="h-10 w-10 rounded-full overflow-hidden shadow-sm flex-shrink-0 bg-[#212121] flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
           <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="font-bold text-black dark:text-white text-lg leading-none truncate">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium mt-1 truncate">{subtitle}</p>}
      </div>
    </header>
  );
};
