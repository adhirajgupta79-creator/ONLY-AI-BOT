
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role } from '../types';

interface ChatBubbleProps {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
}

const ChatBubbleComponent: React.FC<ChatBubbleProps> = ({ message, onEdit }) => {
  const isUser = message.role === Role.USER;
  const [isCopied, setIsCopied] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize displayed content.
  const [displayedContent, setDisplayedContent] = useState(() => {
    // If it's a user message, show immediately.
    // If content exists on mount (e.g. loaded from history), show immediately.
    return (isUser || message.content.length > 0) ? message.content : '';
  });

  // Reset edit content if message content updates externally
  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  // Typewriter effect logic
  useEffect(() => {
    if (isUser) return;

    if (displayedContent.length < message.content.length) {
      const distance = message.content.length - displayedContent.length;
      
      // Natural typing simulation parameters
      let minDelay = 10;
      let maxDelay = 30;
      let step = 1;

      // Logic to handle speed based on lag and content
      if (distance > 100) {
        // Far behind: render in chunks to catch up fast
        minDelay = 1;
        maxDelay = 5;
        step = 5;
      } else if (distance > 50) {
        // Moderately behind: speed up significantly
        minDelay = 3;
        maxDelay = 10;
        step = 2;
      } else {
        // Near real-time: simulate natural typing
        const nextChar = message.content.charAt(displayedContent.length);
        const isPunctuation = /[.,!?;:\n]/.test(nextChar);
        
        if (isPunctuation) {
          // Slight pause on punctuation
          minDelay = 30;
          maxDelay = 70;
        } else {
          // Standard variation
          minDelay = 15;
          maxDelay = 40;
        }
      }

      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      
      const timeoutId = setTimeout(() => {
        setDisplayedContent(prev => {
            const nextLength = Math.min(prev.length + step, message.content.length);
            return message.content.slice(0, nextLength);
        });
      }, delay);

      return () => clearTimeout(timeoutId);
    } else if (displayedContent.length > message.content.length) {
        // If the source content was truncated or reset, match it immediately
        setDisplayedContent(message.content);
    }
  }, [message.content, displayedContent, isUser]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing, editContent]);

  const handleCopy = async () => {
    if (!message.content) return;
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Helper to parse Markdown links [text](url)
  const parseLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
            <a 
                key={match.index} 
                href={match[2]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 hover:underline break-all"
            >
                {match[1]}
            </a>
        );
        lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  // Enhanced formatter to parse Markdown bold, italic, and lists + links
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      let content = line;
      let isList = false;
      
      // Check for bullet points (* or - followed by space)
      if (content.trim().startsWith('* ') || content.trim().startsWith('- ')) {
        content = content.trim().substring(2);
        isList = true;
      }

      // Parse Bold (**text**) first
      const parts = content.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
           return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
        }
        
        // Then parse Italic (*text*) inside non-bold parts
        return part.split(/(\*.*?\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
                return <em key={`${partIndex}-${subIndex}`}>{subPart.slice(1, -1)}</em>;
            }
            // Finally parse links inside other parts
            return parseLinks(subPart);
        });
      });

      return (
        <div key={lineIndex} className={`${isList ? 'flex items-start ml-2' : ''} ${lineIndex > 0 ? 'mt-2' : ''} leading-relaxed`}>
          {isList && <span className="mr-2 text-neutral-500 dark:text-neutral-400">•</span>}
          <span className="break-words whitespace-pre-wrap">
             {parts}
          </span>
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} group py-2`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm overflow-hidden ${isUser ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-[#212121] text-white'}`}>
          {isUser ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.394a.75.75 0 010 1.422l-1.183.394c-.447.15-.799.5-.948.948l-.394 1.183a.75.75 0 01-1.422 0l-.394-1.183a1.5 1.5 0 00-.948-.948l-1.183-.394a.75.75 0 010-1.422l1.183-.394c.447-.15.799-.5.948-.948l.394-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full min-w-0 w-full`}>
          <div 
            className={`px-5 py-3.5 text-base relative break-words w-full ${
              isUser 
                ? 'bg-black text-white dark:bg-gpt-card dark:text-[#ECECEC] rounded-3xl rounded-tr-md' 
                : 'bg-white text-black border border-neutral-200 dark:bg-transparent dark:text-gray-300 dark:border-none rounded-none p-0 dark:px-0'
            }`}
          >
            {isEditing ? (
              <div className="w-full">
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-0 p-0 focus:ring-0 text-white dark:text-[#ECECEC] resize-none leading-relaxed"
                  rows={1}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button 
                    onClick={handleSaveEdit}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors font-medium"
                  >
                    Save & Submit
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="text-xs hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {formatContent(displayedContent)}
                {!isUser && displayedContent.length < message.content.length && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-neutral-400 animate-pulse" />
                )}
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className={`flex items-center gap-1 mt-1 px-1 select-none ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {!isUser && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleCopy}
                        className={`p-1 rounded-md transition-all duration-200 ${
                        isCopied 
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400' 
                            : 'text-neutral-400 hover:text-black hover:bg-neutral-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700'
                        }`}
                        title="Copy to clipboard"
                    >
                        {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                        </svg>
                        )}
                    </button>
                  </div>
              )}

              {isUser && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Edit message"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                   </svg>
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const ChatBubble = React.memo(ChatBubbleComponent);
