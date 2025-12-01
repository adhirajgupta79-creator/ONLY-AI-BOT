
import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user?: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
        setError("Please enter a username");
        return;
    }
    
    // Create a user profile based on the username
    const cleanName = username.trim();
    const userProfile: User = {
        id: 'user-' + Date.now(),
        name: cleanName,
        email: `${cleanName.toLowerCase().replace(/\s/g, '')}@creator.ai`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff`
    };

    onLogin(userProfile);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gpt-main transition-colors duration-200 p-4 font-sans text-white">
      <div className="w-full max-w-sm bg-gpt-sidebar rounded-2xl shadow-2xl border-none overflow-hidden relative">
        
        {/* Decorative Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="p-8 pb-6 flex flex-col items-center">
          {/* Logo */}
          <div className="h-16 w-16 rounded-full overflow-hidden mb-4 shadow-lg ring-2 ring-gray-700 bg-[#212121] flex items-center justify-center text-white">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome</h1>
          <p className="text-gray-400 text-sm mt-1">
            Enter a unique username to continue
          </p>
        </div>

        <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.256 1.256 0 011.686-1.626c.455.137.84.516.946.992.42 1.884 2.105 3.142 4.02 3.142 1.91 0 3.593-1.256 4.015-3.138.106-.477.492-.857.948-.995a1.256 1.256 0 011.683 1.626 7.493 7.493 0 01-13.3 0z" />
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Choose a Username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setError(null);
                        }}
                        autoFocus
                        className="w-full bg-gpt-input border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>

                {error && (
                    <div className="text-center">
                        <p className="text-sm text-red-400 font-medium bg-red-500/10 py-1 px-3 rounded-lg inline-block">
                            {error}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex justify-center items-center shadow-lg transform active:scale-[0.98] duration-200"
                >
                    Continue
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-2">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                </button>
            </form>
            
            <p className="text-[10px] text-center text-gray-600 mt-6">
                By continuing, you agree to our Terms of Service.
            </p>
        </div>
      </div>
    </div>
  );
};
