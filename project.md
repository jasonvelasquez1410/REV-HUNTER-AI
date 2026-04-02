# RevHunter AI - Project Memory (V19.0 Agent Edition)

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview

- **Name**: RevHunter AI (The Relentless Sales Engine)
- **Goal**: A multi-tenant AI SaaS Profit Engine for car dealerships to automate lead engagement, marketing, and reception.
- **Business Model (Two-Tier)**:
  - **Tier 1 — Dealer SaaS** (`/admin`): Full Command Center for dealership managers. $500-2000/mo or $20/lead PPL.
  - **Tier 2 — Agent Edition** (`/agent`): Personal AI assistant for individual sales reps. $49-99/mo per agent.
- **Current Tenant**: FilCan Cars (Sherwood Park)
- **AI Persona**: **Elliot** (The AI Sales Specialist)

## Technical Architecture (V19)

- **Monorepo Structure**:
  - `/frontend`: Vite + React SPA.
  - `/backend`: FastAPI (Python) backend using Google Gemini 1.5 Flash.
- **Key Files**:
  - `vercel.json`: Monorepo deployment config (Supports direct SPA routing for `/admin`, `/agent`).
  - `api/storage.py`: Hardened DB controller with **Relentless Backup Mode**, `AgentTable`, and `assigned_agent` field on `LeadTable`.
  - `api/index.py`: Unified API with agent management, login, assignment, and billing endpoints.
  - `api/ai_logic.py`: Core AI engine for lead qualification, content generation, and SEO.
  - `frontend/src/pages/AgentDashboard.jsx`: Agent Edition — login, personal leads, file import, push notifications.
  - `frontend/src/components/SEOModule.jsx`: RevHunter Growth Engine — AI-powered SEO content generator.
  - `frontend/src/components/BillingDashboard.jsx`: PPL Billing Dashboard with PDF invoice generation (jspdf).

## Presentation URLs

| URL | Audience | Description |
| --- | --- | --- |
| `rev-hunter-ai.vercel.app/` | Customers | FilCan Cars dealer website |
| `rev-hunter-ai.vercel.app/admin` | Dealer Managers | Full Admin Command Center |
| `rev-hunter-ai.vercel.app/agent` | Sales Agents | Simplified Agent Edition (standalone, no dealer chrome) |
| `rev-hunter-ai.vercel.app/revhunter` | New Dealers | SaaS Landing Page / Sales Deck |

## Core Features (V19 Ready)

### Dealer Admin Features (`/admin`)
- **Receptionist Mode**: 24/7 automated greeting and discovery.
- **Sales Agent Mode**: 9-step qualification script and manual reply triggers.
- **Marketing Strategy Hub**: AI-generated multi-pillar content with visual image prompts.
- **Accountability Audit Log**: Dynamic tracking of AI and human actions.
- **Vapi Voice Integration (v2.x)**: Browser-based AI voice calls via `vapi.start()`.
- **AI Insight Mode**: "Why Hot?" / "Why Qualified?" briefings.
- **Voice Overlay UI**: Live Transcript Memory and Lead DNA AI Analysis.
- **ROI Analytics Dashboard**: Visual charts (Recharts) for conversion tracking.
- **Google Ads Integration**: Webhook endpoint for lead form extensions.
- **Multi-Dealer Branding**: Custom AI personas, logos, and colors per dealer.
- **RevHunter Growth Engine (SEO)**: AI-generated Title Tags, Meta Descriptions, Keywords, Blog Snippets.
- **PPL Billing Dashboard**: Track qualified leads (≥80%), calculate $20/lead fees, generate PDF invoices.
- **Agent Assignment**: Assign leads to agents via avatar buttons → persists to DB via `/api/leads/assign`.

### Agent Edition Features (`/agent`)
- **PIN-Based Login**: Agents sign in with name + 4-digit PIN. Session persists via localStorage.
- **Personal Leads Dashboard**: Only shows leads assigned to the logged-in agent.
- **Push Notifications**: Browser push notification fires when a new lead is assigned ("🔥 New Lead Assigned!").
- **30-Second Polling**: Dashboard auto-refreshes every 30s to detect new assignments.
- **In-App Alert Banner**: Red animated banner slides in at the top when new lead arrives.
- **AI Auto-Nudge (⚡)**: One-tap follow-up — Elliot sends automated text to the lead.
- **Direct Phone Call (📞)**: Tap-to-call button links directly to `tel:` on mobile.
- **Real CSV/Excel Import**: Agents upload any .xlsx/.xls/.csv file from their phone:
  - Auto-detects columns: Name, Phone, Email, Vehicle, Notes (works with Revenue Radar format or any custom spreadsheet).
  - Shows preview with lead count before importing.
  - Imports leads directly into their dashboard pipeline.
  - Elliot starts working/qualifying the imported leads.
- **Lead Scoring**: Hot (≥80%), Warm (50-79%) sections with color-coded badges.
- **Standalone Dark UI**: Full-screen mobile-first design, no dealer header/footer/chat widget.
- **Logout**: Sign out button to switch agents.

### Demo Agent Credentials

| Agent | PIN |
| --- | --- |
| Juan Dela Cruz | 1234 |
| Mark Santos | 5678 |
| Jessica Cruz | 9012 |

## API Endpoints (V19)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/leads` | GET | Fetch all leads for a tenant |
| `/api/chat` | POST | Send a message to AI Elliot |
| `/api/webhook` | POST | Facebook Messenger webhook |
| `/api/webhooks/google-ads/{tenant_id}` | POST | Google Ads lead form webhook |
| `/api/import/crm` | POST | Trigger DealerSocket Excel import |
| `/api/roi-analytics` | GET | ROI dashboard data |
| `/api/billing` | GET | Unbilled qualified leads and balance |
| `/api/leads/mark-billed` | POST | Mark leads as invoiced |
| `/api/seo-generate` | POST | AI SEO content generation |
| `/api/generate-ad` | POST | AI marketing ad copy generation |
| `/api/agents/login` | POST | Agent PIN-based authentication |
| `/api/agents` | GET | List all agents for a tenant |
| `/api/leads/assign` | POST | Assign a lead to an agent |
| `/api/agents/{agent_name}/leads` | GET | Fetch leads for a specific agent |

## Deployment Status

- **GitHub**: Pushed to `jasonvelasquez1410/REV-HUNTER-AI`.
- **Vercel**: Live at `https://rev-hunter-ai.vercel.app/`.
- **Environment Variables Required**:
  - `GOOGLE_API_KEY`: Gemini 1.5 Flash key (Crucial for AI).
  - `DATABASE_URL`: Supabase connection string.
  - `FB_VERIFY_TOKEN`: Verification for Facebook webhooks.

## Task Status (Completed V19)

1. [x] **SaaS Deployment**: Live on Vercel with fixed monorepo routing.
2. [x] **Database Integration**: Supabase/PostgreSQL connectivity enabled with local fallbacks.
3. [x] **Omni-Hunter Control Center**: Full lead engagement, manual replies, and marketing generation live.
4. [x] **Stateful Intelligence (V11)**: AI now tracks 9-step qualification progress and persists insights to the DB.
5. [x] **Demo Stabilization (v16.0)**: Fixed runtime crashes and implemented Agent Management and Ad Approval Hub.
6. [x] **Scale-Up Edition (V17.0)**: ROI Dashboard, Google Ads Integration, Multi-Dealer Branding, SaaS Landing Page, CRM Import.
7. [x] **PPL and Growth Engine (V18.0)**: SEO Module, Billing Dashboard with PDF invoices, Professional UI icon overhaul.
8. [x] **Agent Edition (V19.0)**: Agent login, push notifications, lead assignment API, personal dashboard, real CSV/Excel import.

## Memory Log

- **2026-03-24**: Finalized Vercel configuration. Created `project.md`.
- **2026-03-25**: SaaS deployment configuration. Improved Vercel routing, enforced env variables for DB, and added health checks.
- **2026-03-26 (V10)**: **V10 RE-ENGINEERING COMPLETE**. Transitioned to Gemini 1.5 Flash. Ported Sethcon V9 features. Fixed 404 and 500 errors. Implemented Relentless Mode fallbacks.
- **2026-03-26 (V11)**: **STATEFUL INTELLIGENCE DEPLOYED**. 9-step state machine, conversation tracking, real-time progress monitoring.
- **2026-03-27 (V11.1)**: **DEPLOYMENT AND ROUTING PATCH**. Fixed 404 on `/admin`, dual-mode routing, enhanced diagnostics.
- **2026-03-27 (V14.0)**: **PITCH FAIL-SAFE**. Mock lead fallbacks, instant UI updates, offline resilience.
- **2026-03-30 (v15.0)**: **HARDENED AI HUB**. Triple-redundant failover (Groq, OpenAI, Gemini). Migrated to Mixtral-8x7b.
- **2026-04-01 (V17.0)**: **SCALE-UP EDITION**. ROI Dashboard, Google Ads webhooks, Multi-Dealer Branding, SaaS Landing Page, CRM Import.
- **2026-04-01 (V18.0)**: **PPL AND GROWTH ENGINE**. SEO Module, Billing Dashboard, PDF invoices, Lucide icons, Strategy Guide.
- **2026-04-02 (V19.0)**: **AGENT EDITION DEPLOYED**.
  - **Agent Dashboard** at `/agent` — standalone dark-themed mobile-first UI, completely separate from dealer view.
  - **PIN-Based Agent Login**: 3 demo agents (Juan Dela Cruz, Mark Santos, Jessica Cruz). Session persists in localStorage.
  - **Push Notifications**: Browser Notification API fires when new leads are assigned. 30-second polling interval.
  - **Lead Assignment System**: Admin assigns leads to agents via avatar buttons. Backend persists `assigned_agent` on LeadTable. New `AgentTable` in storage.py.
  - **4 New API Endpoints**: `/agents/login`, `/agents`, `/leads/assign`, `/agents/{name}/leads`.
  - **Real CSV/Excel File Import**: Agents can upload ANY .xlsx/.csv from their phone (not just DealerSocket). Auto-detects Name, Phone, Email, Vehicle, Notes columns. Shows preview before importing. Leads injected into agent's pipeline for Elliot to work.
  - **App.jsx Updated**: `/agent` route hides dealer header/nav/footer/chat widget for clean standalone presentation.
  - **Vapi Outbound Calling**: Documented upgrade path from browser-based voice to real phone calls via Vapi Server API ($0.05-0.10/min).
  - Bumped version to `v19.0-AGENT-EDITION`.

## Future Roadmap

### Real Outbound AI Phone Calls
- **Current**: Browser-based voice via Vapi Web SDK (`vapi.start()`).
- **Upgrade**: Vapi Server-Side API (`POST https://api.vapi.ai/call/phone`) for real outbound calls.
- **Cost**: ~$2/mo for phone number + ~$0.05-0.10/min per call. 3-min call = $0.30, charge $20 per qualified lead.
- **Implementation**: New endpoint `POST /api/call/outbound` triggering Vapi Server API.

### Stripe Payment Integration
- Replace manual "Mark as Paid" with real payment processing for the PPL billing dashboard.

### Agent Self-Registration
- Allow new agents to create their own accounts instead of admin-provisioned PINs.


