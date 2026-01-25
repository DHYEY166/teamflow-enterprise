
import React, { useState } from 'react';
import { TeamRoom, Member } from '../types';

interface ChatSidebarProps {
  rooms: TeamRoom[];
  activeRoomId: string;
  onSelectRoom: (id: string) => void;
  onCreateRoom: (name: string, description: string) => void;
  onOpenSettings: () => void;
  onOpenTechBrief: () => void;
  user: Member;
  members: Member[];
  themeColor: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ rooms, activeRoomId, onSelectRoom, onCreateRoom, onOpenSettings, onOpenTechBrief, user, members, themeColor }) => {
  const [isCreating, setIsCreating] = useState(false);

  const getPresenceColor = (status?: string) => {
    switch(status) {
      case 'online': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'idle': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'typing': return 'bg-indigo-500 animate-pulse';
      case 'offline': return 'bg-zinc-700';
      default: return 'bg-zinc-700';
    }
  };

  return (
    <div className="w-64 flex flex-col border-r border-zinc-800 bg-zinc-950 h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${themeColor.replace('text', 'bg').replace('400', '600')} flex items-center justify-center font-bold text-white shadow-lg`}>
            <i className="fa-solid fa-bolt-lightning text-xs"></i>
          </div>
          <h1 className="font-black text-lg text-zinc-100 tracking-tighter">TeamFlow <span className={themeColor}>AI</span></h1>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
        <div className="space-y-1">
          <div className="px-3 py-2 flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <span>Channels</span>
            <button onClick={() => setIsCreating(!isCreating)} className="p-1 hover:text-white transition-colors">
              <i className={`fa-solid ${isCreating ? 'fa-xmark' : 'fa-plus'}`}></i>
            </button>
          </div>
          {rooms.map(room => (
            <button key={room.id} onClick={() => onSelectRoom(room.id)} className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeRoomId === room.id ? 'bg-zinc-900 text-white border border-zinc-800 shadow-xl' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'}`}>
              <div className={`w-2 h-2 rounded-full ${activeRoomId === room.id ? themeColor : 'bg-zinc-700'}`}></div>
              <span className="truncate text-sm font-bold">#{room.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1">
           <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Team Presence</div>
           <div className="space-y-2 px-1">
             {members.map(m => (
               <div key={m.id} className="flex items-center gap-3 group px-2 py-2 hover:bg-zinc-900/40 rounded-xl transition-all">
                 <div className="relative">
                   <img src={m.avatar || `https://picsum.photos/seed/${m.id}/100/100`} className="w-8 h-8 rounded-full object-cover border border-zinc-800" />
                   <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950 ${getPresenceColor(m.presence)}`}></div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-zinc-200 truncate">{m.name}</p>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest truncate">{m.presence || 'offline'}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* System Diagnostics Trigger */}
        <button 
          onClick={onOpenTechBrief}
          className="w-full mt-6 group flex items-center justify-between px-4 py-3.5 border border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all active:scale-95"
        >
          <div className="flex items-center gap-3">
            <i className={`fa-solid fa-microchip text-xs group-hover:${themeColor} transition-colors`}></i>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Status</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></div>
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
          </div>
        </button>
      </div>

      <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 mt-auto">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-zinc-700 object-cover shadow-lg" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${getPresenceColor(user.presence)}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-100 truncate">{user.name}</p>
            <p className={`text-[10px] ${themeColor} font-bold uppercase tracking-tighter truncate capitalize`}>{user.presence || 'online'}</p>
          </div>
          <button onClick={onOpenSettings} className="group relative text-zinc-400 hover:text-white p-2.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
            <i className="fa-solid fa-gear text-sm"></i>
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-800 pointer-events-none whitespace-nowrap font-bold uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
