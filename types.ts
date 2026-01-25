
export type Role = 'user' | 'assistant' | 'system';
export type RoomRole = 'admin' | 'member' | 'guest';
export type AppTheme = 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue' | 'zinc';
export type UserStatus = 'online' | 'offline' | 'idle' | 'typing';

// Added missing UserPreferences interface to resolve the import error in App.tsx
export interface UserPreferences {
  theme: AppTheme;
  notificationsEnabled: boolean;
  focusMode: boolean;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status?: string;
  presence?: UserStatus;
  lastSeen?: string;
}

export interface RoomMember extends Member {
  roomRole: RoomRole;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  role: Role;
  isAnnouncement?: boolean;
  scope?: 'global' | 'local';
  searchMetadata?: {
    relevance: string;
    sourceSnippet: string;
  };
}

export interface Task {
  id: string;
  title: string;
  assignee?: string;
  status: 'pending' | 'in-progress' | 'completed';
  deadline?: string;
  description?: string;
  department?: string;
  sourceSnippet?: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: string;
}

export interface TeamRoom {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: RoomMember[];
  messages: Message[];
  tasks: Task[];
  resources: Resource[];
  summary?: string;
  pinnedMessageIds: string[];
}

export interface SearchResult {
  id: string;
  type: 'message' | 'task';
  content: string;
  relevance: string;
  snippet: string;
}

export interface MeetingSummary {
  summaryText: string;
  actionItems: {
    title: string;
    description: string;
    owner?: string;
    department?: string;
    dueDate?: string;
    sourceSnippet: string;
  }[];
}

export interface AIResponse {
  replyText: string;
  shouldIntervene: boolean;
  actions: {
    type: 'ADD_TASK' | 'UPDATE_TASK' | 'ADD_RESOURCE' | 'SET_SUMMARY' | 'ANNOUNCE' | 'PRESENCE_UPDATE' | 'NONE';
    payload?: any;
  }[];
  groundingUrls?: string[];
  searchQueryResult?: SearchResult[];
  meetingSummary?: MeetingSummary;
  presenceUpdates?: { userId: string, status: UserStatus, lastSeen?: string }[];
}