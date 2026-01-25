
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TeamRoom, Message, Task, Resource, Member, RoomRole, UserPreferences, AppTheme, UserStatus, SearchResult, MeetingSummary } from './types';
import { INITIAL_ROOMS, CURRENT_USER, ALL_USERS } from './constants';
import { processChatContext, summarizeChannel } from './services/geminiService';
import ChatSidebar from './components/ChatSidebar';
import ChatArea from './components/ChatArea';
import TeamDashboard from './components/TeamDashboard';
import TechnicalBrief from './components/TechnicalBrief';

const App: React.FC = () => {
  const [rooms, setRooms] = useState<TeamRoom[]>(() => {
    const saved = localStorage.getItem('tf_workspace_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((r: any) => ({
          ...r,
          pinnedMessageIds: r.pinnedMessageIds || [],
          messages: r.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      } catch (e) { return INITIAL_ROOMS; }
    }
    return INITIAL_ROOMS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('tf_members_v4');
    return saved ? JSON.parse(saved) : ALL_USERS.map(u => ({ ...u, presence: 'online' as UserStatus }));
  });

  const [currentUser, setCurrentUser] = useState<Member>(() => {
    const saved = localStorage.getItem('tf_user_profile_v4');
    if (saved) return JSON.parse(saved);
    return { ...CURRENT_USER, presence: 'online' as UserStatus };
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('tf_user_prefs_v4');
    return saved ? JSON.parse(saved) : { theme: 'indigo', notificationsEnabled: true, focusMode: false };
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0]?.id || INITIAL_ROOMS[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTechBriefOpen, setIsTechBriefOpen] = useState(false);
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info'}[]>([]);
  
  const processingTimeoutRef = useRef<number | null>(null);

  useEffect(() => { localStorage.setItem('tf_workspace_v8', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('tf_members_v4', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('tf_user_prefs_v4', JSON.stringify(preferences)); }, [preferences]);
  useEffect(() => { localStorage.setItem('tf_user_profile_v4', JSON.stringify(currentUser)); }, [currentUser]);

  const themeColors = useMemo(() => {
    const themes: Record<AppTheme, { primary: string, border: string, text: string, shadow: string }> = {
      indigo: { primary: 'bg-indigo-600', border: 'border-indigo-500', text: 'text-indigo-400', shadow: 'shadow-indigo-600/20' },
      emerald: { primary: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400', shadow: 'shadow-emerald-600/20' },
      rose: { primary: 'bg-rose-600', border: 'border-rose-500', text: 'text-rose-400', shadow: 'shadow-rose-600/20' },
      amber: { primary: 'bg-amber-600', border: 'border-amber-500', text: 'text-amber-400', shadow: 'shadow-amber-600/20' },
      blue: { primary: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400', shadow: 'shadow-blue-600/20' },
      zinc: { primary: 'bg-zinc-700', border: 'border-zinc-600', text: 'text-zinc-400', shadow: 'shadow-zinc-600/20' }
    };
    return themes[preferences.theme] || themes.indigo;
  }, [preferences.theme]);

  const addToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const visibleRooms = useMemo(() => rooms.filter(r => r.members.some(m => m.id === currentUser.id)), [rooms, currentUser.id]);
  const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId) || visibleRooms[0] || rooms[0], [rooms, activeRoomId, visibleRooms]);
  const userRoomRole = useMemo(() => activeRoom.members.find(m => m.id === currentUser.id)?.roomRole || 'guest', [activeRoom, currentUser.id]);

  const handleAddResource = useCallback((title: string, url: string, category: string = 'General') => {
    const newResource: Resource = {
      id: `res-${Date.now()}`,
      title,
      url,
      category
    };

    setRooms(prev => prev.map(r => r.id === activeRoomId ? {
      ...r,
      resources: [newResource, ...r.resources],
      messages: [...r.messages, {
        id: `m-res-${Date.now()}`,
        senderId: 'teamflow-ai',
        senderName: 'Workspace AI',
        content: `Document Linked: **${title}** has been added to the departmental assets.`,
        timestamp: new Date(),
        role: 'assistant'
      }]
    } : r));
    addToast(`Asset Linked: ${title}`, 'success');
  }, [activeRoomId, addToast]);

  const handleRemoveResource = useCallback((resourceId: string) => {
    setRooms(prev => prev.map(r => r.id === activeRoomId ? {
      ...r,
      resources: r.resources.filter(res => res.id !== resourceId)
    } : r));
    addToast("Asset removed", "info");
  }, [activeRoomId, addToast]);

  const handleSendMessage = async (content: string, imageUri?: string) => {
    if (userRoomRole === 'guest') { addToast("Access denied.", "info"); return; }
    if (!content.trim() && !imageUri) return;

    const targetRoomId = activeRoomId;
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      timestamp: new Date(),
      role: 'user'
    };

    setRooms(prev => prev.map(r => r.id === targetRoomId ? { ...r, messages: [...r.messages, newMessage] } : r));
    setIsProcessing(true);
    
    if (processingTimeoutRef.current) window.clearTimeout(processingTimeoutRef.current);
    processingTimeoutRef.current = window.setTimeout(() => {
      setIsProcessing(false);
      addToast("AI processing timeout.", "info");
    }, 15000);

    try {
      const roomSnapshot = { ...activeRoom, messages: [...activeRoom.messages, newMessage] };
      const aiResult = await processChatContext(roomSnapshot, content, currentUser.name, userRoomRole);
      
      if (processingTimeoutRef.current) window.clearTimeout(processingTimeoutRef.current);
      setIsProcessing(false);

      if (aiResult.presenceUpdates && aiResult.presenceUpdates.length > 0) {
        setMembers(prevMembers => prevMembers.map(m => {
          const update = aiResult.presenceUpdates?.find(u => 
            u.userId.toLowerCase().includes(m.name.toLowerCase()) || u.userId === m.id
          );
          if (update) addToast(`${m.name} is now ${update.status}`, "info");
          return update ? { ...m, presence: update.status as UserStatus } : m;
        }));
      }

      setRooms(prevRooms => prevRooms.map(room => {
        let nextTasks = [...room.tasks];
        let nextMessages = [...room.messages];
        let modified = false;

        if (aiResult.actions && aiResult.actions.length > 0) {
          aiResult.actions.forEach(action => {
            const type = action.type?.toUpperCase();
            const payload = action.payload || {};

            if (type === 'ADD_TASK' && room.id === targetRoomId) {
              const taskTitle = payload.title || payload.content || 'Review Request';
              const taskAssignee = payload.assignee || 'Unassigned';
              
              nextTasks.push({
                id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                title: taskTitle,
                assignee: taskAssignee,
                status: 'pending'
              });
              modified = true;
              addToast(`Task Logged: ${taskTitle}`);
            }

            if (type === 'ANNOUNCE' && payload.content) {
              const isGlobal = payload.scope === 'global';
              if (isGlobal || room.id === targetRoomId) {
                nextMessages.push({
                  id: `ann-${Date.now()}`,
                  senderId: 'teamflow-ai',
                  senderName: 'Workspace AI',
                  content: payload.content,
                  timestamp: new Date(),
                  role: 'assistant',
                  isAnnouncement: true
                });
                modified = true;
              }
            }
          });
        }

        if (aiResult.shouldIntervene && aiResult.replyText && room.id === targetRoomId) {
          const alreadyAnnounced = aiResult.actions.some(a => a.type?.toUpperCase() === 'ANNOUNCE');
          if (!alreadyAnnounced) {
            nextMessages.push({
              id: `ai-${Date.now()}`,
              senderId: 'teamflow-ai',
              senderName: 'Workspace AI',
              content: aiResult.replyText,
              timestamp: new Date(),
              role: 'assistant'
            });
            modified = true;
          }
        }

        return modified ? { ...room, tasks: nextTasks, messages: nextMessages } : room;
      }));

    } catch (err) {
      setIsProcessing(false);
      console.error("AI Context Sync Failure:", err);
    }
  };

  return (
    <div className={`flex h-screen w-full bg-[#09090b] overflow-hidden relative transition-all duration-1000 ${preferences.focusMode ? 'grayscale brightness-[0.8]' : ''}`}>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-in slide-in-from-top duration-300 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
            <span className="text-xs font-bold text-zinc-200">{toast.message}</span>
          </div>
        ))}
      </div>

      <ChatSidebar 
        rooms={visibleRooms} 
        activeRoomId={activeRoomId} 
        onSelectRoom={setActiveRoomId} 
        onCreateRoom={(n, d) => {
          const newRoom: TeamRoom = { 
            id: `r-${Date.now()}`, name: n, description: d, adminId: currentUser.id, 
            members: [{ ...currentUser, roomRole: 'admin' }], messages: [], tasks: [], resources: [], pinnedMessageIds: []
          };
          setRooms([...rooms, newRoom]);
          setActiveRoomId(newRoom.id);
          addToast(`Created #${n}`);
        }} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTechBrief={() => setIsTechBriefOpen(true)}
        user={currentUser}
        members={members}
        // Fixed: Use themeColors.text to provide the theme color class string to ChatSidebar
        themeColor={themeColors.text}
      />

      <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-800 relative z-10 bg-zinc-950">
        <ChatArea 
          room={activeRoom} 
          onSendMessage={handleSendMessage} 
          onSendAnnouncement={() => {}} 
          onUploadResource={handleAddResource}
          isProcessing={isProcessing}
          userRole={userRoomRole}
          onDeleteRoom={() => {}}
          onStartCall={() => {}}
          onClearHistory={() => {}}
          onTogglePin={() => {}}
          themeColors={themeColors}
        />
      </div>

      <div className="w-80 hidden lg:block overflow-y-auto bg-zinc-950/50">
        <TeamDashboard 
          room={activeRoom} 
          onUpdateTask={(id, s) => setRooms(rooms.map(r => r.id === activeRoomId ? { ...r, tasks: r.tasks.map(t => t.id === id ? { ...t, status: s } : t) } : r))}
          onAddTask={(t, a) => {
              setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, tasks: [...r.tasks, { id: `t-${Date.now()}`, title: t, assignee: a, status: 'pending' }] } : r));
          }}
          onAddResource={handleAddResource}
          onRemoveResource={handleRemoveResource}
          onSummarize={async () => {
            setIsProcessing(true);
            try {
              const summary = await summarizeChannel(activeRoom);
              setRooms(prevRooms => prevRooms.map(r => r.id === activeRoomId ? { ...r, summary } : r));
              addToast("Sprint Log Refreshed");
            } finally { setIsProcessing(false); }
          }}
          allUsers={members}
          onAddMember={(rid, uid) => {
            const user = members.find(m => m.id === uid);
            if (user) {
              setRooms(prev => prev.map(r => r.id === rid ? { ...r, members: [...r.members, { ...user, roomRole: 'member' }] } : r));
              addToast(`${user.name} added`);
            }
          }}
          onRemoveMember={(rid, uid) => {
             setRooms(prev => prev.map(r => r.id === rid ? { ...r, members: r.members.filter(m => m.id !== uid) } : r));
             addToast("Revoked access");
          }}
          userRole={userRoomRole}
          currentUserId={currentUser.id}
          themeColors={themeColors}
        />
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsSettingsOpen(false)} />
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="p-12 space-y-12">
               <div className="flex justify-between items-start">
                 <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter">Workspace Sync</h2>
                   <p className="text-zinc-500 text-sm mt-2 font-medium">Enterprise core configuration.</p>
                 </div>
                 <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
               </div>
               
               <div className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Visual Profile</p>
                    <div className="grid grid-cols-6 gap-3">
                      {['indigo', 'emerald', 'rose', 'amber', 'blue', 'zinc'].map(id => (
                        <button 
                          key={id} 
                          onClick={() => setPreferences(p => ({ ...p, theme: id as AppTheme }))}
                          className={`aspect-square rounded-2xl bg-${id}-600 flex items-center justify-center transition-all ${preferences.theme === id ? 'ring-4 ring-white ring-offset-4 ring-offset-zinc-950 scale-110 shadow-2xl shadow-white/10' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                        >
                          {preferences.theme === id && <i className="fa-solid fa-check text-white text-xs"></i>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 hover:bg-zinc-900 transition-all cursor-pointer group" onClick={() => setPreferences(p => ({ ...p, focusMode: !p.focusMode }))}>
                    <div>
                      <p className="text-sm font-bold text-zinc-100">Focus Mode</p>
                      <p className="text-[10px] text-zinc-500 font-medium mt-1">Desaturate UI for deep work.</p>
                    </div>
                    <button className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${preferences.focusMode ? themeColors.primary : 'bg-zinc-700'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${preferences.focusMode ? 'translate-x-7' : ''}`}></div>
                    </button>
                  </div>
               </div>

               <button onClick={() => setIsSettingsOpen(false)} className={`w-full ${themeColors.primary} text-white py-5 rounded-[24px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl ${themeColors.shadow} hover:opacity-90 transition-all active:scale-95`}>Apply Preferences</button>
            </div>
          </div>
        </div>
      )}

      {isTechBriefOpen && <TechnicalBrief onClose={() => setIsTechBriefOpen(false)} themeColors={themeColors} />}
    </div>
  );
};

export default App;
