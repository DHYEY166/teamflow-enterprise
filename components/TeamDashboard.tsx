
import React, { useState, useRef } from 'react';
import { TeamRoom, Task, Member, RoomRole } from '../types';

interface TeamDashboardProps {
  room: TeamRoom;
  onUpdateTask: (id: string, status: Task['status']) => void;
  onAddTask: (title: string, assignee: string) => void;
  onAddResource: (title: string, url: string, category?: string) => void;
  onRemoveResource: (id: string) => void;
  onSummarize: () => void;
  allUsers: Member[];
  onAddMember: (roomId: string, userId: string) => void;
  onRemoveMember: (roomId: string, userId: string) => void;
  userRole: RoomRole;
  currentUserId: string;
  themeColors: { primary: string, border: string, text: string, shadow: string };
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ 
  room, onUpdateTask, onAddTask, onAddResource, onRemoveResource, onSummarize, allUsers, onAddMember, onRemoveMember, userRole, currentUserId, themeColors
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showMemberInvite, setShowMemberInvite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = userRole === 'admin';
  const isGuest = userRole === 'guest';

  // Find users who are NOT in this room
  const availableUsers = allUsers.filter(u => !room.members.some(rm => rm.id === u.id));

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle, 'Unassigned');
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onAddResource(file.name, dataUrl, 'Document');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Modern browsers block direct navigation to data: URLs for security reasons (about:blank issue).
  // We bypass this by reconstructing a temporary Blob URL for the viewing session on-the-fly.
  const handleViewResource = (url: string) => {
    if (url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        const header = parts[0];
        const base64 = parts[1];
        const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        
        // Convert Base64 string to Uint8Array
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        
        // Create a blob and a temporary pointer for the browser to open
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open the blob in a new tab
        const newWindow = window.open(blobUrl, '_blank');
        
        if (!newWindow) {
          alert("Popup blocked. Please allow popups to view documents.");
        }
      } catch (err) {
        console.error("Failed to process document for viewing:", err);
        alert("Could not open this document. The data might be corrupted.");
      }
    } else if (url !== '#') {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col p-5 space-y-6 pb-20 overflow-y-auto scrollbar-hide">
      {/* Executive Summary / Sprint Recap Section */}
      {room.summary && (
        <section className={`p-5 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-700 ${themeColors.primary.replace('bg-', 'bg-')}/5 ${themeColors.border.replace('border-', 'border-opacity-20 border-')}`}>
          <div className="flex items-center gap-2 mb-3">
            <i className={`fa-solid fa-sparkles ${themeColors.text} text-[10px]`}></i>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeColors.text}`}>Sprint Recap</h3>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed italic">
            "{room.summary}"
          </p>
        </section>
      )}

      {/* Task Management Section */}
      <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-zinc-100 uppercase tracking-[0.2em] flex items-center gap-2">
            <i className={`fa-solid fa-list-check ${themeColors.text}`}></i>
            Tasks
          </h3>
        </div>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-hide">
          {room.tasks.length === 0 ? (
            <p className="text-[10px] text-zinc-600 italic text-center py-4">No active requirements.</p>
          ) : (
            room.tasks.map((task) => (
              <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-xl transition-all border border-transparent hover:border-zinc-800">
                <button 
                  disabled={isGuest}
                  onClick={() => onUpdateTask(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    task.status === 'completed' ? `${themeColors.primary} ${themeColors.border} text-white` : 'border-zinc-700 bg-zinc-950'
                  } ${isGuest ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {task.status === 'completed' && <i className="fa-solid fa-check text-[8px]"></i>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold truncate ${task.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                    {task.title}
                  </p>
                  {task.assignee && (
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{task.assignee}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {!isGuest && (
            <button 
              onClick={() => setShowAddTask(true)}
              className={`w-full py-2 border border-dashed border-zinc-800 rounded-xl text-[10px] text-zinc-600 font-bold hover:${themeColors.text} hover:${themeColors.border.replace('border', 'border-opacity-50 border')} transition-all mt-2`}
            >
              <i className="fa-solid fa-plus mr-1"></i> New Item
            </button>
          )}
        </div>

        {showAddTask && (
          <form onSubmit={handleTaskSubmit} className="mt-3 animate-in zoom-in duration-200">
            <input 
              autoFocus
              className={`w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-[10px] text-white outline-none focus:ring-1 focus:${themeColors.primary.replace('bg-', 'ring-')}`} 
              placeholder="Requirement name..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => !newTaskTitle && setShowAddTask(false)}
            />
          </form>
        )}
      </section>

      {/* Member Management Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <i className={`fa-solid fa-users ${themeColors.text}`}></i>
            Personnel
          </h3>
          {isAdmin && (
            <button 
              onClick={() => setShowMemberInvite(!showMemberInvite)}
              className={`text-[10px] ${themeColors.text} font-bold hover:opacity-80 transition-colors`}
            >
              {showMemberInvite ? 'Done' : 'Manage'}
            </button>
          )}
        </div>

        {showMemberInvite && isAdmin && (
          <div className={`mb-6 p-4 ${themeColors.primary.replace('bg-', 'bg-')}/5 border ${themeColors.border.replace('border-', 'border-opacity-20 border-')} rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300`}>
            <p className={`text-[9px] font-black ${themeColors.text} uppercase tracking-widest mb-3`}>Invite to Department</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {availableUsers.length === 0 ? (
                <p className="text-[10px] text-zinc-600 italic">All organization members are present.</p>
              ) : (
                availableUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-bold text-zinc-200">{u.name}</span>
                    </div>
                    <button 
                      onClick={() => onAddMember(room.id, u.id)}
                      className={`text-[10px] ${themeColors.primary} text-white px-2 py-0.5 rounded hover:opacity-90 transition-colors`}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {room.members.map((member) => (
            <div key={member.id} className="group flex items-center gap-3">
              <div className="relative">
                <img src={member.id === 'u1' ? member.avatar : `https://picsum.photos/seed/${member.id}/100/100`} className="w-8 h-8 rounded-full border border-zinc-800 object-cover" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-zinc-950 rounded-full ${
                  member.roomRole === 'admin' ? themeColors.primary : 'bg-emerald-500'
                }`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-zinc-200 truncate">{member.name}</p>
                  {member.roomRole === 'admin' && <i className={`fa-solid fa-shield-halved ${themeColors.text} text-[8px]`}></i>}
                </div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter truncate">
                  {member.status ? `"${member.status}"` : member.role}
                </p>
              </div>
              {isAdmin && member.id !== currentUserId && (
                <button 
                  onClick={() => onRemoveMember(room.id, member.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Revoke access"
                >
                  <i className="fa-solid fa-user-minus text-[10px]"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Shared Assets Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-paperclip text-blue-400"></i>
            Shared Assets
          </h3>
          {!isGuest && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 scrollbar-hide">
          {room.resources.length === 0 ? (
            <p className="text-[10px] text-zinc-600 italic text-center py-4">No assets pinned.</p>
          ) : (
            room.resources.map((res) => (
              <div key={res.id} className="relative group">
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleViewResource(res.url)}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewResource(res.url)}
                  className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 border border-zinc-800 transition-colors">
                    <i className={`fa-solid ${res.category === 'Design' ? 'fa-palette' : 'fa-link'} text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-zinc-200 truncate pr-6">{res.title}</p>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{res.category}</p>
                  </div>
                </div>
                {!isGuest && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveResource(res.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove asset"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Summary Footer */}
      {!isGuest && (
        <div className="pt-4 border-t border-zinc-800">
          <button 
            onClick={onSummarize}
            className={`w-full bg-gradient-to-r ${themeColors.primary.replace('600', '700')} ${themeColors.primary} text-white px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg ${themeColors.shadow}`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Update Sprint Recap
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
