
import { TeamRoom, Member, Message } from './types';

export const CURRENT_USER: Member = {
  id: 'u1',
  name: 'Alex Rivera',
  avatar: 'https://picsum.photos/seed/alex/100/100',
  role: 'Fullstack Developer'
};

export const ALL_USERS: Member[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/100/100', role: 'UI/UX Lead' },
  { id: 'u3', name: 'Mike Johnson', avatar: 'https://picsum.photos/seed/mike/100/100', role: 'Backend Engineer' },
  { id: 'u4', name: 'Emily White', avatar: 'https://picsum.photos/seed/emily/100/100', role: 'Product Manager' },
  { id: 'u5', name: 'David Kim', avatar: 'https://picsum.photos/seed/david/100/100', role: 'DevOps' }
];

const createMsg = (id: string, sender: Member, content: string, minutesAgo: number): Message => ({
  id,
  senderId: sender.id,
  senderName: sender.name,
  content,
  timestamp: new Date(Date.now() - minutesAgo * 60000),
  role: sender.id === 'teamflow-ai' ? 'assistant' : 'user'
});

const AI_BOT: Member = { id: 'teamflow-ai', name: 'Workspace AI', avatar: '', role: 'AI Assistant' };

export const INITIAL_ROOMS: TeamRoom[] = [
  {
    id: 'room-main',
    name: 'Main',
    description: 'The general workspace for all company-wide updates and collaboration.',
    adminId: 'u1',
    members: ALL_USERS.map(u => ({ ...u, roomRole: u.id === 'u1' ? 'admin' : 'member' })),
    messages: [
      createMsg('m-1', ALL_USERS[3], "Welcome everyone to the refreshed corporate workspace!", 180),
      createMsg('m-2', ALL_USERS[0], "Alex here. The departmental sync is looking great.", 175),
      createMsg('m-3', ALL_USERS[1], "Sarah joining. Glad we have clear lanes now.", 170),
      createMsg('m-4', AI_BOT, "System: Corporate workspace v5 initialized. Monitoring #Main for high-level tasks.", 168),
      createMsg('m-5', ALL_USERS[2], "Anyone seen the link for the Q4 strategy meeting?", 160),
      createMsg('m-6', ALL_USERS[3], "I'll pin the quarterly roadmap to the assets section.", 155),
      createMsg('m-7', ALL_USERS[4], "Just finished the server migration across all regions.", 150),
      createMsg('m-8', ALL_USERS[0], "Thanks David. Let's keep the momentum going.", 145),
      createMsg('m-9', ALL_USERS[3], "Quick reminder: The coffee machine in lounge B is fixed.", 130),
      createMsg('m-10', AI_BOT, "Announcement: All-hands meeting starts in 45 minutes.", 120),
      createMsg('m-11', ALL_USERS[1], "I'll be sharing the new brand identity previews.", 110),
      createMsg('m-12', ALL_USERS[2], "And I'll be updating on the security patch progress.", 100),
      createMsg('m-13', ALL_USERS[0], "Can we talk about the hiring budget for Engineering?", 90),
      createMsg('m-14', ALL_USERS[3], "Emily here. I'll discuss that with HR later today.", 80),
      createMsg('m-15', AI_BOT, "Observation: The 'Hiring Budget' topic has been flagged for #HR follow-up.", 75),
      createMsg('m-16', ALL_USERS[4], "The global dashboard is showing 100% uptime currently.", 60),
      createMsg('m-17', ALL_USERS[0], "Fantastic. See you all at the meeting.", 10)
    ],
    tasks: [
      { id: 't-m-1', title: 'Publish Quarterly Roadmap', status: 'completed', assignee: 'Emily White' },
      { id: 't-m-2', title: 'Discuss Engineering Budget', status: 'pending', assignee: 'Emily White, David Kim' }
    ],
    resources: [
      { id: 'r-m-1', title: 'Company Handbook 2025', url: '#', category: 'General' }
    ],
    pinnedMessageIds: ['m-1', 'm-10']
  },
  {
    id: 'room-eng',
    name: 'Engineering',
    description: 'Core technical coordination, PR reviews, and architecture planning.',
    adminId: 'u1',
    members: [ALL_USERS[0], ALL_USERS[2], ALL_USERS[4]].map(u => ({ ...u, roomRole: u.id === 'u1' ? 'admin' : 'member' })),
    messages: [
      createMsg('e-1', ALL_USERS[0], "Starting the daily standup. focus is the API layer.", 120),
      createMsg('e-2', ALL_USERS[2], "Mike here. GraphQL migration is at 85%.", 115),
      createMsg('e-3', ALL_USERS[4], "Did we resolve the memory leak in the staging environment?", 110),
      createMsg('e-4', AI_BOT, "Alert: Memory usage in staging-west peaked at 92% during the load test.", 108),
      createMsg('e-5', ALL_USERS[0], "Alex here. I found the culprit in the JWT validation loop.", 100),
      createMsg('e-6', ALL_USERS[2], "Great find. Can you push the fix to the 'hotfix' branch?", 95),
      createMsg('e-7', ALL_USERS[4], "I'm updating the Terraform scripts for the RDS upgrade.", 90),
      createMsg('e-8', ALL_USERS[0], "David, make sure to check the snapshot policy before running it.", 85),
      createMsg('e-9', ALL_USERS[4], "Running the dry-run now. Logs look clean.", 80),
      createMsg('e-10', AI_BOT, "Task: 'Terraform Dry-Run' marked as completed by David Kim.", 78),
      createMsg('e-11', ALL_USERS[2], "We need to look at the latency in the user-service.", 70),
      createMsg('e-12', ALL_USERS[0], "Might be the database indexing. I'll run an EXPLAIN query.", 60),
      createMsg('e-13', ALL_USERS[2], "Also, we have 4 PRs pending review in the main repo.", 50),
      createMsg('e-14', ALL_USERS[4], "I'll take the DevOps ones. Alex, you take the frontend?", 40),
      createMsg('e-15', AI_BOT, "Tracking: Alex Rivera (Frontend) and David Kim (DevOps) assigned to PR reviews.", 35),
      createMsg('e-16', ALL_USERS[0], "Fix for the leak is pushed. CI/CD should trigger now.", 20),
      createMsg('e-17', ALL_USERS[2], "Deployment successful. Latency is back to normal.", 5)
    ],
    tasks: [
      { id: 't-e-1', title: 'Fix JWT Memory Leak', status: 'completed', assignee: 'Alex Rivera' },
      { id: 't-e-2', title: 'Database Index Optimization', status: 'in-progress', assignee: 'Alex Rivera' }
    ],
    resources: [],
    pinnedMessageIds: ['e-1', 'e-4']
  },
  {
    id: 'room-design',
    name: 'Design',
    description: 'Visual identity, design tokens, and prototype reviews.',
    adminId: 'u2',
    members: [ALL_USERS[1], ALL_USERS[0], ALL_USERS[3]].map(u => ({ ...u, roomRole: u.id === 'u2' ? 'admin' : 'member' })),
    messages: [
      createMsg('d-1', ALL_USERS[1], "Sarah here. The new component library tokens are ready.", 140),
      createMsg('d-2', ALL_USERS[3], "The mobile nav icons are a bit too small on Android.", 130),
      createMsg('d-3', ALL_USERS[0], "Alex here. I'll adjust the base rem scale to 16px.", 120),
      createMsg('d-4', AI_BOT, "Tip: Use 18px for better readability on high-density mobile screens.", 118),
      createMsg('d-5', ALL_USERS[1], "Good point. Let's stick with the Indigo-600 for buttons.", 110),
      createMsg('d-6', ALL_USERS[3], "What about the dark mode hover states?", 100),
      createMsg('d-7', ALL_USERS[1], "We'll use Zinc-800 with a subtle shadow overlay.", 90),
      createMsg('d-8', ALL_USERS[0], "I've implemented a test page with the new tokens.", 80),
      createMsg('d-9', ALL_USERS[3], "The spacing feels much more balanced now.", 70),
      createMsg('d-10', AI_BOT, "Audit: Component Library v2.1 meets all AAA accessibility standards.", 68),
      createMsg('d-11', ALL_USERS[1], "Can we review the login flow animation tonight?", 60),
      createMsg('d-12', ALL_USERS[0], "Yes, I'll share a screen recording in the #General assets.", 50),
      createMsg('d-13', ALL_USERS[3], "We should also update the empty states for the dashboard.", 40),
      createMsg('d-14', ALL_USERS[1], "I'll create some custom illustrations for that tomorrow.", 30),
      createMsg('d-15', AI_BOT, "Schedule: 'Empty State Illustrations' added to Sarah's queue for tomorrow.", 25),
      createMsg('d-16', ALL_USERS[0], "Looking forward to seeing the final renders.", 10)
    ],
    tasks: [
      { id: 't-d-1', title: 'Update Component Library Tokens', status: 'completed', assignee: 'Alex Rivera' },
      { id: 't-d-2', title: 'Design Empty State Icons', status: 'pending', assignee: 'Sarah Chen' }
    ],
    resources: [
      { id: 'r-d-1', title: 'Figma Component Tokens', url: '#', category: 'Design' }
    ],
    pinnedMessageIds: ['d-1']
  },
  {
    id: 'room-marketing',
    name: 'Marketing',
    description: 'Growth tracking, campaign metrics, and brand outreach.',
    adminId: 'u4',
    members: [ALL_USERS[3], ALL_USERS[1]].map(u => ({ ...u, roomRole: u.id === 'u4' ? 'admin' : 'member' })),
    messages: [
      createMsg('mk-1', ALL_USERS[3], "Emily here. Q3 campaign post-mortem is starting.", 150),
      createMsg('mk-2', ALL_USERS[1], "The click-through rate on the LinkedIn ads was 3.4%.", 140),
      createMsg('mk-3', ALL_USERS[3], "That's well above our target of 2%.", 130),
      createMsg('mk-4', AI_BOT, "Analysis: Variant B with the indigo CTA performed 15% better than Variant A.", 128),
      createMsg('mk-5', ALL_USERS[3], "We should double down on that color scheme for Q4.", 120),
      createMsg('mk-6', ALL_USERS[1], "I'm working on the newsletter assets now.", 110),
      createMsg('mk-7', ALL_USERS[3], "Can we target the 'Enterprise Admin' segment specifically?", 100),
      createMsg('mk-8', ALL_USERS[1], "Yes, I've created custom banners for that group.", 90),
      createMsg('mk-9', ALL_USERS[3], "Budget update: We have 5k left for influencer outreach.", 80),
      createMsg('mk-10', AI_BOT, "Lead Suggestion: TechInfluencerX has a 4.5% engagement rate in our niche.", 75),
      createMsg('mk-11', ALL_USERS[3], "Let's reach out to them. Sarah, can you prep a kit?", 70),
      createMsg('mk-12', ALL_USERS[1], "Sure thing. I'll have it ready by EOD.", 60),
      createMsg('mk-13', ALL_USERS[3], "We also need to update the SEO tags on the landing page.", 50),
      createMsg('mk-14', ALL_USERS[1], "Alex mentioned he'd handle the technical SEO tomorrow.", 40),
      createMsg('mk-15', AI_BOT, "Task: 'Technical SEO Update' assigned to Alex Rivera.", 35),
      createMsg('mk-16', ALL_USERS[3], "The landing page traffic is spiking today.", 20),
      createMsg('mk-17', ALL_USERS[1], "Must be the social push we did this morning!", 10)
    ],
    tasks: [
      { id: 't-mk-1', title: 'Influencer Outreach Kit', status: 'in-progress', assignee: 'Sarah Chen' },
      { id: 't-mk-2', title: 'Social Media Blast', status: 'completed', assignee: 'Emily White' }
    ],
    resources: [],
    pinnedMessageIds: ['mk-1']
  },
  {
    id: 'room-hr',
    name: 'HR',
    description: 'Culture initiatives, employee relations, and policy management.',
    adminId: 'u5',
    members: [ALL_USERS[4], ALL_USERS[3]].map(u => ({ ...u, roomRole: u.id === 'u5' ? 'admin' : 'member' })),
    messages: [
      createMsg('h-1', ALL_USERS[4], "David here. The new hybrid policy is officially active.", 120),
      createMsg('h-2', ALL_USERS[3], "Are there any changes to the core office hours?", 110),
      createMsg('h-3', ALL_USERS[4], "Nope, still 10 AM to 4 PM for meetings.", 100),
      createMsg('h-4', AI_BOT, "Note: Hybrid policy allows for 3 days remote and 2 days in-office.", 98),
      createMsg('h-5', ALL_USERS[4], "We have two new junior devs starting on Monday.", 90),
      createMsg('h-6', ALL_USERS[3], "I'll set up the welcome pack and the hardware.", 80),
      createMsg('h-7', ALL_USERS[4], "Please make sure they have access to the security vault.", 70),
      createMsg('h-8', ALL_USERS[3], "Will do. Also, what's the status on the dental plan update?", 60),
      createMsg('h-9', ALL_USERS[4], "It's been approved. I'll post the PDF in the assets.", 50),
      createMsg('h-10', AI_BOT, "Resource: 'Employee Benefits 2025' uploaded to #HR assets.", 48),
      createMsg('h-11', ALL_USERS[3], "Excellent. People were asking about it.", 40),
      createMsg('h-12', ALL_USERS[4], "We should plan a team-building event for next month.", 30),
      createMsg('h-13', ALL_USERS[3], "Escape room or maybe a bowling night?", 20),
      createMsg('h-14', ALL_USERS[4], "I'll send a poll in the #Main channel.", 15),
      createMsg('h-15', AI_BOT, "Poll Prep: 'Team Building Preference' poll drafted for Admin review.", 10)
    ],
    tasks: [
      { id: 't-h-1', title: 'Onboard New Developers', status: 'in-progress', assignee: 'David Kim' },
      { id: 't-h-2', title: 'Team Building Poll', status: 'pending', assignee: 'David Kim' }
    ],
    resources: [
      { id: 'r-h-1', title: 'Employee Benefits 2025', url: '#', category: 'Official' }
    ],
    pinnedMessageIds: ['h-1']
  }
];
