<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TeamFlow Enterprise

![React](https://img.shields.io/badge/react-19-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.8-blue)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-orange)
![License](https://img.shields.io/badge/license-MIT-green)
![Vite](https://img.shields.io/badge/build-Vite-purple)

A smart, collaborative AI workspace assistant for professional teams. TeamFlow Enterprise combines real-time team chat with an embedded AI assistant that automates sprint management, generates meeting recaps, and drafts departmental announcements — all inside a single workspace.

---

## Features

- **Multi-room workspace** — separate channels per team or project, with per-room membership and admin controls
- **AI assistant** — powered by Google Gemini, context-aware of the active room and conversation history
- **Sprint management** — ask the AI to create, update, or summarize sprint tasks
- **Meeting recaps** — generate structured summaries from conversation history
- **Departmental announcements** — draft and broadcast announcements with one prompt
- **Technical briefs** — produce engineering-ready briefs from natural language requirements
- **Team dashboard** — at-a-glance view of members, activity, and workspace state

---

## Tech Stack

- React 19 + TypeScript
- Google Gemini API (`@google/genai`)
- Vite
- Vanilla CSS (no UI framework dependency)

---

## Project Structure

```text
teamflow-enterprise/
├── App.tsx               # Root component, routing, room state
├── index.tsx             # Entry point
├── types.ts              # Shared TypeScript types
├── constants.ts          # Seed data (rooms, members, messages)
├── components/
│   ├── ChatArea.tsx       # Message thread + input
│   ├── ChatSidebar.tsx    # Room list + member panel
│   ├── TeamDashboard.tsx  # Workspace overview
│   └── TechnicalBrief.tsx # AI-generated technical brief view
├── services/
│   └── geminiService.ts   # Gemini API client
├── vite.config.ts
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
git clone https://github.com/DHYEY166/teamflow-enterprise.git
cd teamflow-enterprise
npm install
```

Copy the example env file and add your key:

```bash
cp .env.local.example .env.local
# then edit .env.local and set GEMINI_API_KEY=<your-key>
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## Built With

- [React](https://react.dev)
- [Google Gemini](https://ai.google.dev)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)
