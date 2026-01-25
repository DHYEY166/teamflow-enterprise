
import React, { useState, useRef, useEffect } from 'react';
import { TeamRoom, Message, RoomRole } from '../types';

interface ChatAreaProps {
  room: TeamRoom;
  onSendMessage: (content: string, imageUri?: string) => void;
  onSendAnnouncement: (content: string, broadcastAll: boolean) => void;
  onUploadResource: (title: string, url: string, category?: string) => void;
  isProcessing: boolean;
  userRole: RoomRole;
  onDeleteRoom: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onClearHistory: () => void;
  onTogglePin: (messageId: string) => void;
  themeColors: { primary: string, border: string, text: string, shadow: string };
}

const MarkdownText: React.FC<{ text: string, themeText: string }> = ({ text, themeText }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim().startsWith('### ')) {
          return <h3 key={i} className={`text-xs font-black uppercase tracking-widest mt-4 mb-2 ${themeText}`}>{line.replace('### ', '')}</h3>;
        }
        if (line.trim().startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-zinc-700 pl-3 py-1 my-2 bg-zinc-900/30 rounded-r-lg italic text-zinc-400 text-[11px]">
               <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace('> ', ''), themeText) }} />
            </blockquote>
          );
        }
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className={themeText}>•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(line.trim().substring(2), themeText) }} />
            </div>
          );
        }
        return (
          <p key={i} className={line.trim() === '' ? 'h-2' : 'text-[13px] leading-relaxed'} dangerouslySetInnerHTML={{ __html: formatInline(line, themeText) }} />
        );
      })}
    </div>
  );
};

function formatInline(str: string, themeText: string) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-zinc-400">$1</i>')
    .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" class="${themeText} hover:underline font-medium">$1</a>`);
}

const ChatArea: React.FC<ChatAreaProps> = ({ 
  room, onSendMessage, onSendAnnouncement, onUploadResource, isProcessing, userRole, onDeleteRoom, onStartCall, onClearHistory, onTogglePin, themeColors
}) => {
  const [inputValue, setInputValue] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusMessages = ["Indexing Context", "Analyzing Intent", "Updating Sprint", "Finalizing Response"];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [room.messages, isProcessing]);

  useEffect(() => {
    let interval: number;
    if (isProcessing) {
      interval = window.setInterval(() => {
        setStatusIndex(prev => (prev + 1) % statusMessages.length);
      }, 400); // Accelerated cycle
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onUploadResource(file.name, dataUrl, 'Document');
      };
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  const getSenderAvatar = (senderId: string) => {
    if (senderId === 'teamflow-ai') return null;
    const member = room.members.find(m => m.id === senderId);
    return member?.avatar || `https://picsum.photos/seed/${senderId}/100/100`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h2 className="font-bold text-zinc-100 text-lg">#{room.name}</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{room.members.length} Personnel Linked</p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => onStartCall('audio')} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all"><i className="fa-solid fa-phone"></i></button>
           <button onClick={() => onStartCall('video')} className="p-2.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-xl transition-all"><i className="fa-solid fa-video"></i></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {room.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 p-5 rounded-3xl border transition-all hover:bg-zinc-900/20 ${msg.isAnnouncement ? 'border-l-4 ' + themeColors.border : 'border-transparent'} ${msg.role === 'assistant' ? themeColors.primary.replace('bg-', 'bg-') + '/5 ' : ''}`}>
            <div className="flex-shrink-0">
              {msg.role === 'assistant' ? (
                <div className={`w-10 h-10 rounded-2xl ${themeColors.primary} flex items-center justify-center text-white shadow-lg ${themeColors.shadow}`}><i className="fa-solid fa-hashtag"></i></div>
              ) : (
                <img src={getSenderAvatar(msg.senderId) || ''} className="w-10 h-10 rounded-2xl object-cover border border-zinc-800" alt="" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-sm ${msg.role === 'assistant' ? themeColors.text : 'text-zinc-100'}`}>{msg.senderName}</span>
                <span className="text-[10px] text-zinc-500 font-medium">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`text-[13px] leading-relaxed break-words ${msg.isAnnouncement ? 'text-zinc-100 font-medium' : 'text-zinc-300'}`}>
                {msg.role === 'assistant' ? <MarkdownText text={msg.content} themeText={themeColors.text} /> : msg.content}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="px-14 flex items-center gap-4 animate-in fade-in duration-300">
             <div className="flex gap-1.5">
                <div className={`w-1.5 h-1.5 ${themeColors.primary} rounded-full animate-bounce`}></div>
                <div className={`w-1.5 h-1.5 ${themeColors.primary} rounded-full animate-bounce`} style={{animationDelay:'100ms'}}></div>
                <div className={`w-1.5 h-1.5 ${themeColors.primary} rounded-full animate-bounce`} style={{animationDelay:'200ms'}}></div>
             </div>
             <div className={`text-[10px] font-black ${themeColors.text} uppercase tracking-[0.2em]`}>
                {statusMessages[statusIndex]}...
             </div>
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="relative group">
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder={`Message #${room.name}...`} 
            className="w-full bg-zinc-900 border border-zinc-800 text-sm rounded-3xl py-4.5 pl-14 pr-24 focus:outline-none focus:ring-1 focus:ring-indigo-600 shadow-2xl transition-all" 
          />
          <div className="absolute left-2 top-2 bottom-2">
             <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="h-full px-4 text-zinc-400 hover:text-zinc-200 transition-colors"
             >
               <i className="fa-solid fa-paperclip"></i>
             </button>
             <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
             />
          </div>
          <div className="absolute right-2 top-2 bottom-2">
             <button type="submit" disabled={!inputValue.trim()} className={`h-full ${themeColors.primary} text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all`}>
               Send
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
