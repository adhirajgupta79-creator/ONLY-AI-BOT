
import React from 'react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  user?: User | null;
  onLogout?: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  user,
  onLogout,
  onOpenSettings
}) => {
  // Sort sessions by newest first
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  
  // State for search query
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter sessions based on search
  const filteredSessions = sortedSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-neutral-50 dark:bg-gpt-sidebar dark:text-gpt-text z-50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col border-r border-neutral-200 dark:border-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-none flex items-center justify-between bg-white dark:bg-gpt-sidebar">
          <h2 className="font-bold text-lg">Chats</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-gpt-hover rounded-full text-neutral-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white dark:text-black text-white py-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-gray-200 transition-all shadow-sm font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>

          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
            </span>
            <input 
                type="text" 
                placeholder="Search chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-gpt-input border border-neutral-200 dark:border-none rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-gray-600 transition-all placeholder:text-neutral-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {filteredSessions.map((session) => (
            <div 
              key={session.id}
              className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                session.id === activeSessionId 
                  ? 'bg-white dark:bg-gpt-hover shadow-sm ring-1 ring-neutral-200 dark:ring-0' 
                  : 'hover:bg-neutral-200/50 dark:hover:bg-gpt-hover'
              }`}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onClose();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 flex-shrink-0 ${session.id === activeSessionId ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-gray-400'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${session.id === activeSessionId ? 'font-medium text-black dark:text-white' : 'text-neutral-600 dark:text-gray-400'}`}>
                  {session.title}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-gray-500">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={(e) => onDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-neutral-200 dark:hover:bg-gray-700 rounded text-neutral-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-all"
                title="Delete chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
          
          {filteredSessions.length === 0 && searchQuery && (
             <div className="text-center text-sm text-gray-500 mt-4">
                 No chats found
             </div>
          )}
        </div>
        
        {/* User Profile Area */}
        <div className="p-3 border-t border-neutral-200 dark:border-none bg-neutral-100 dark:bg-gpt-sidebar space-y-1">
            {user && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gpt-hover shadow-sm border border-neutral-200 dark:border-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-gray-800 transition-colors"
                onClick={onOpenSettings}
              >
                 <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full" />
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-500 dark:text-gray-400 truncate">{user.email}</p>
                 </div>
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onLogout?.();
                        if (window.innerWidth < 768) onClose();
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Log out"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                 </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
};
