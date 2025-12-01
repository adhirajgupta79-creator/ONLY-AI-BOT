
import React from 'react';
import { User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  user?: User | null;
}

const SettingRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | React.ReactNode; onClick?: () => void; danger?: boolean }> = ({ 
    icon, label, value, onClick, danger 
}) => (
    <div 
        onClick={onClick}
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${onClick ? 'active:bg-white/5' : ''} ${danger ? 'text-red-400 active:bg-red-500/10' : 'text-gray-200'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/10' : 'bg-white/5'} ${danger ? 'text-red-400' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span className="font-medium text-base">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
            {value}
            {onClick && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
            )}
        </div>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
  user
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#212121] animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#212121] sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
            <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-safe">
            <div className="max-w-3xl mx-auto w-full">
                
                {/* Account Section */}
                <div className="mt-6">
                    <h3 className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Account</h3>
                    <div className="bg-white/[0.02] border-y border-white/5">
                        <SettingRow 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.256 1.256 0 011.686-1.626c.455.137.84.516.946.992.42 1.884 2.105 3.142 4.02 3.142 1.91 0 3.593-1.256 4.015-3.138.106-.477.492-.857.948-.995a1.256 1.256 0 011.683 1.626 7.493 7.493 0 01-13.3 0z" />
                                </svg>
                            }
                            label="Profile"
                            value={user?.name}
                        />
                        <SettingRow 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                                </svg>
                            }
                            label="Email"
                            value={user?.email}
                        />
                        <SettingRow 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                            }
                            label="Notifications"
                            value={
                                <div className="w-10 h-6 bg-green-500 rounded-full relative shadow-inner">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                </div>
                            }
                        />
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-8">
                    <h3 className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">About</h3>
                    <div className="bg-white/[0.02] border-y border-white/5">
                        <SettingRow 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                                </svg>
                            }
                            label="Version"
                            value="1.5v"
                        />
                        
                        {/* Developer Card */}
                        <div className="px-5 py-4 flex items-start gap-4">
                             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.9a.75.75 0 10-1.06-1.06 3.5 3.5 0 01-1.08 4.25A3.501 3.501 0 0113.5 14a.75.75 0 000-1.5A2.001 2.001 0 0012 11a2 2 0 00-1.95-1.55c-.382 0-.745-.078-1.082-.22a2.001 2.001 0 00-2.578-2.13z" clipRule="evenodd" />
                                </svg>
                             </div>
                             <div>
                                <p className="text-base font-semibold text-white">Mr. Adhiraj Gupta</p>
                                <p className="text-sm text-gray-400">Developer of Creator AI</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">Age 17 y/o</span>
                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Developer</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 mb-8">
                    <h3 className="px-5 py-2 text-xs font-bold text-red-500/80 uppercase tracking-wider">Danger Zone</h3>
                    <div className="bg-white/[0.02] border-y border-white/5">
                        <SettingRow 
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                </svg>
                            }
                            label="Clear all chat history"
                            danger
                            onClick={onClearHistory}
                        />
                    </div>
                </div>

                <div className="flex justify-center pb-8">
                    <p className="text-[10px] text-gray-600">CREATOR AI • v1.5 • 2024</p>
                </div>
            </div>
        </div>
    </div>
  );
};
