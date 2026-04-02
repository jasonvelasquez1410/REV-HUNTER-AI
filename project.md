# RevHunter AI - Project Memory (V18.0 PPL & Growth Engine)

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview

- **Name**: RevHunter AI (The Relentless Sales Engine)
- **Goal**: A multi-tenant AI SaaS Profit Engine for car dealerships to automate lead engagement, marketing, and reception.
- **Business Model**: Pay-Per-Lead (PPL) — We run Google Ads & SEO, AI qualifies leads, and we bill the dealer $20 per qualified lead (score ≥ 80%).
- **Current Tenant**: FilCan Cars (Sherwood Park)
- **AI Persona**: **Elliot** (The AI Sales Specialist)

## Technical Architecture (V18)

- **Monorepo Structure**:
  - `/frontend`: Vite + React SPA.
  - `/backend`: FastAPI (Python) backend using Google Gemini 1.5 Flash.
- **Key Files**:
  - `vercel.json`: Monorepo deployment config (Supports direct SPA routing for `/admin`).
  - `api/storage.py`: Hardened DB controller with **Relentless Backup Mode** (Falls back to local data if Supabase is offline).
  - `api/index.py`: Unified API with `APIRouter` for both `/api` and root-level routes (Vercel optimization).
  - `api/ai_logic.py`: Core AI engine for lead qualification, content generation, and **SEO content generation**.
  - `frontend/src/components/SEOModule.jsx`: RevHunter Growth Engine — AI-powered SEO content generator.
  - `frontend/src/components/BillingDashboard.jsx`: PPL Billing Dashboard with PDF invoice generation (jspdf).

## Core Features (V18 Ready)

- **Receptionist Mode**: 24/7 automated greeting and discovery.
- **Sales Agent Mode**: 9-step qualification script and manual reply triggers.
- **Marketing Strategy Hub**: AI-generated multi-pillar content (Inventory, Strategic, Seasonal) with visual image prompts.
- **Accountability Audit Log**: Dynamic tracking of AI and human actions for transparency.
- **Vapi Voice Integration (v2.x)**: Flattened assistant override schema for `vapi.start()`.
- **AI Insight Mode**: High-impact "Why Hot?" / "Why Qualified?" briefings for the dealer.
- **Voice Overlay UI**: Dual-panel display featuring **Live Transcript Memory** and **Lead DNA AI Analysis**.
- **Health Diagnostic**: Live system status at `/api/status`.
- **ROI Analytics Dashboard**: Visual charts showing conversion rates and lead source breakdown.
- **Google Ads Integration**: Webhook endpoint for Google Ads Lead Form Extensions.
- **Multi-Dealer Branding**: Custom AI personas, logos, and colors per dealer.
- **SaaS Landing Page**: Public marketing page with waitlist at `/revhunter`.
- **CRM Import Engine**: Sync DealerSocket Excel (Revenue Radar) data into AI qualification pipeline.
- **RevHunter Growth Engine (SEO)**: AI-generated Title Tags, Meta Descriptions, H1 Headlines, Keywords, and Blog Snippets for automotive SEO.
- **PPL Billing Dashboard**: Tracks qualified leads (≥80%), calculates $20/lead fees, generates downloadable PDF invoices, and maintains payment history.
- **Professional UI Icons**: Replaced emoji buttons with Lucide icons (Zap, Target, Mic, MessageSquare) with descriptive hover tooltips.
- **Strategy Guide**: Built-in help button explaining the entire Relentless workflow to dealers.

## API Endpoints (V18)

| Endpoint | Method | Description |
|---|---|---|
| `/api/leads` | GET | Fetch all leads for a tenant |
| `/api/chat` | POST | Send a message to AI Elliot |
| `/api/webhook` | POST | Facebook Messenger webhook |
| `/api/webhooks/google-ads/{tenant_id}` | POST | Google Ads lead form webhook |
| `/api/import/crm` | POST | Trigger DealerSocket Excel import |
| `/api/roi-analytics` | GET | ROI dashboard data |
| `/api/billing` | GET | Unbilled qualified leads & balance |
| `/api/leads/mark-billed` | POST | Mark leads as invoiced |
| `/api/seo-generate` | POST | AI SEO content generation |
| `/api/generate-ad` | POST | AI marketing ad copy generation |

## Deployment Status

- **GitHub**: Pushed to `jasonvelasquez1410/REV-HUNTER-AI`.
- **Vercel**: Live at `https://rev-hunter-ai.vercel.app/`.
- **Environment Variables Required**:
  - `GOOGLE_API_KEY`: Gemini 1.5 Flash key (Crucial for AI).
  - `DATABASE_URL`: Supabase connection string.
  - `FB_VERIFY_TOKEN`: Verification for Facebook webhooks.

## Task Status (Completed V18)

1. [x] **SaaS Deployment**: Live on Vercel with fixed monorepo routing.
2. [x] **Database Integration**: Supabase/PostgreSQL connectivity enabled with local fallbacks.
3. [x] **Omni-Hunter Control Center**: Full lead engagement, manual replies, and marketing generation live.
4. [x] **Stateful Intelligence (V11)**: AI now tracks 9-step qualification progress and persists insights to the DB.
5. [x] **Demo Stabilization (v16.0)**: Fixed runtime crashes and implemented Agent Management & Ad Approval Hub.
6. [x] **Scale-Up Edition (V17.0)**: ROI Dashboard, Google Ads Integration, Multi-Dealer Branding, SaaS Landing Page, CRM Import.
7. [x] **PPL & Growth Engine (V18.0)**: SEO Module, Billing Dashboard with PDF invoices, Professional UI icon overhaul with tooltips.

## Memory Log

- **2026-03-24**: Finalized Vercel configuration. Created `project.md`.
- **2026-03-25**: SaaS deployment configuration. Improved Vercel routing, enforced env variables for DB, and added health checks.
- **2026-03-26 (V10)**: **V10 RE-ENGINEERING COMPLETE**.
  - Transitioned to **Google Gemini 1.5 Flash** for high speed/low latency.
  - Ported Sethcon V9 features: Marketing Strategy Hub, Image Prompt Generation, and manual reply endpoints.
  - **Fixed 404/Home Redirect**: Synced URL paths with internal React state in `App.jsx`.
  - **Fixed Connectivity/500 Errors**: Hardened `storage.py` and implemented dual-prefix routing in `main.py`.
  - **Relentless Mode**: Implemented local backup data fallbacks for all data endpoints.
- **2026-03-26 (V11)**: **STATEFUL INTELLIGENCE DEPLOYED**.
  - Refactored `ai_logic.py` to use a 9-step state machine with JSON persistence.
  - Enhanced `LeadTable` and `main.py` to track conversation steps and summaries.
  - Updated Admin Hub UI with real-time "Qualification Step" and "Progress" monitoring.
  - Hardened FB Webhook to route messages through the stateful AI engine.
- **2026-03-27 (V11.1)**: **DEPLOYMENT & ROUTING PATCH**.
  - Fixed persistent 404 on `/admin` and root by adding a **Root `package.json`** for monorepo detection.
  - Refined `vercel.json` with robust rewrites and negative lookaheads to protect static assets.
  - Added Dual-Mode Routing (Path/Hash) to `App.jsx` as a deployment fallback.
  - Added `v11.1` versioning to `ChatWidget` to verify live updates.
  - Enhanced error diagnostics for chat connection failures.
- **2026-03-27 (V14.0)**: **PITCH FAIL-SAFE & INSTANT DEMO READY**.
  - **Frontend Fail-safe**: Implemented robust mock lead fallbacks in `Admin.jsx` to ensure a perfect demo even without API/DB keys.
  - **Instant UI Updates**: Refactored `handleInjectLead` to provide immediate visual feedback in the Inbox table.
  - **Offline Resilience**: Ensured the 'Relentless' simulation logic works flawlessly in disconnected/degraded states.
- **2026-03-30 (v15.0-FORCE-REFRESH)**:
  - **Hardened AI Hub**: Implemented a triple-redundant failover loop (Groq -> OpenAI -> Gemini).
  - **Relentless v15.0 Deployment**: Resolved 400 Bad Request by migrating to Mixtral-8x7b.
  - **Global Sync**: Bumped version to `v15.0-FORCE-REFRESH` across all UI and Backend files to bypass caching.
  - **Current Live Version**: `v15.0-FORCE-REFRESH`.
- **2026-04-01 (V17.0)**: **SCALE-UP EDITION DEPLOYED**.
  - Implemented **ROI Dashboard** with high-impact visual charts (Recharts).
  - Added **Google Ads Integration** webhook support for lead forms.
  - Deployed **Multi-Dealer Branding** system allowing dealers to customize AI names, colors, and logos.
  - Created **SaaS Landing Page** for RevHunter AI with private beta waitlist.
  - Engineered **CRM Import Utility** to sync DealerSocket Excel data (Revenue Radar) directly into the AI calling engine.
  - Bumped version to `v17.0-SCALE-UP`.
- **2026-04-01 (V18.0)**: **PPL & GROWTH ENGINE DEPLOYED**.
  - **Business Model Defined**: Pay-Per-Lead (PPL) — charge $20 per AI-qualified lead (score ≥ 80%).
  - **RevHunter Growth Engine (SEO Module)**: New `SEOModule.jsx` with AI-powered generation of Title Tags, Meta Descriptions, H1s, Keywords, and Blog Snippets via Gemini.
  - **PPL Billing Dashboard**: New `BillingDashboard.jsx` with real-time unbilled lead tracking, $20/lead fee calculation, downloadable PDF invoices (jspdf), and payment history.
  - **Backend Expansion**: Added `/api/billing`, `/api/leads/mark-billed`, and `/api/seo-generate` endpoints to `index.py`. Added `generate_seo_content()` to `ai_logic.py`.
  - **Admin UI Overhaul**: Replaced emoji buttons (🦁🏹📞💬) with professional Lucide icons (Zap, Target, Mic, MessageSquare) with descriptive hover tooltips.
  - **Strategy Guide**: Added in-app help button explaining the Relentless lead conversion workflow.
  - **Landing Page Context**: Clarified that `/revhunter` landing page serves as the SaaS sales deck for onboarding new dealers.
  - **Google Ads Integration Steps**: Documented the 4-step process for connecting dealer Google Ads lead forms to RevHunter webhooks.
  - Bumped version to `v18.0-PPL-GROWTH`.

## Next Sprint Roadmap

### RevHunter AGENT Edition (Sales Rep-Level Product)

**Strategy**: If the dealership won't buy the full SaaS, sell a simplified version directly to individual sales agents (like R-Jay). Two-tier pricing model:

- **Tier 1 — Dealer SaaS**: Full Command Center for dealership managers. $500-2000/mo or $20/lead PPL.
- **Tier 2 — Agent Edition**: Personal AI assistant for individual sales reps. $49-99/mo per agent.

**Agent Edition Features (Simplified UI at `/agent` route)**:
- **My Leads Inbox**: Only shows leads assigned to the logged-in agent (not the whole dealership).
- **AI Auto-Follow-Up**: Elliot texts their leads automatically so they never lose a deal while sleeping.
- **Lead Scorecard**: Shows which of their leads are hottest and ready to close.
- **Quick CRM Import**: Paste or upload their personal DealerSocket/Excel list.
- **Personal Stats Dashboard**: "You closed 8 deals this month, Elliot followed up 47 times for you."
- **No billing dashboard, no SEO, no marketing** — just pure lead conversion.

**Why agents would pay**: A sales agent making $4,000-8,000/mo in commissions would happily pay $99/mo if it means they close even one extra deal. That's a 40:1 ROI.

**Technical Plan**: Share the same backend, add a lightweight mobile-friendly frontend route at `/agent` with a stripped-down UI.

### Real Outbound AI Phone Calls

**Current State**: The Mic button uses the Vapi Web SDK (`vapi.start()`) which opens a browser-based voice session (dealer talks to Elliot through browser mic/speaker).

**Upgrade Path**: Use the Vapi Server-Side API (`POST https://api.vapi.ai/call/phone`) to make real outbound calls to lead cell phones.

**Requirements**:
- Buy a phone number through Vapi dashboard (~$2/month, Twilio-powered).
- Cost per call: ~$0.05-0.10/minute. A 3-min qualifying call = ~$0.30.
- For PPL model: spend $0.30 on a call, charge $20 for the qualified lead = massive ROI.

**Implementation**: Replace `handleVoiceCall()` in Admin.jsx to call a new backend endpoint (`POST /api/call/outbound`) which triggers the Vapi Server API with the lead's phone number.

