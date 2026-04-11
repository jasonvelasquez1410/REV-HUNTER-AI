# RevHunter AI - Project Memory (V20.0 Premium Suite)

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview

- **Name**: RevHunter AI (The Relentless Sales Engine)
- **Goal**: A multi-tenant AI SaaS Profit Engine for car dealerships to automate lead engagement, marketing, and reception.
- **Business Model (Three-Tier)**:
  - **Tier 1 — Dealer SaaS (PPL)**: $20/lead qualified.
  - **Tier 2 — Agent Edition**: $99/mo per agent (Personal AI specialist).
  - **Tier 3 — Premium Suite**: $2,900 CAD Setup ($1,450 Onboarding Down) with 6-month reimbursement guarantee (minus lead costs).
- **Current Tenant**: FilCan Cars (Sherwood Park)
- **AI Persona**: **Elliot** (The AI Sales Specialist)

## Technical Architecture (V20)

- **Monorepo Structure**:
  - `/frontend`: Vite + React SPA.
  - `/backend`: FastAPI (Python) backend using Google Gemini 1.5 Flash.
- **Key Files**:
  - `frontend/src/pages/Admin.jsx`: Enhanced **Pitch Mode** with 3-slide Premium Suite investment deck and arrow navigation.
  - `frontend/src/pages/AgentDashboard.jsx`: Agent Edition — mobile-first PWA for sales reps.
  - `api/storage.py`: Hardened DB controller with Relentless Backup Mode.

## Presentation URLs

| URL | Audience | Description |
| --- | --- | --- |
| `rev-hunter-ai.vercel.app/` | Customers | FilCan Cars dealer website |
| `rev-hunter-ai.vercel.app/admin` | Dealer Managers | Full Admin Command Center (Pitch Mode available) |
| `rev-hunter-ai.vercel.app/agent` | Sales Agents | Agent Edition Dashboard |

## Core Features (V20 Ready)

### Premium Suite Investment Hub (`/admin` Pitch Mode)

- **Slide 1: The Machine**: Focus on AI Hunter Hub, Voice Specialist, and Agent App.
- **Slide 2: The Reality**: Live lead DNA analysis and qualification transcripts.
- **Slide 3: The Investment**: $2,900 CAD Setup ($1,450 Down), 🛡️ 6-Month Guarantee, 10 Leads/Day, 25-50% Closing Range.
- **Navigation UX**: Fixed side-navigation arrows (←/→) and progress dot indicators.

### Dealer Admin Features

- **Receptionist Mode**: 24/7 discovery.
- **Vapi Voice Integration**: Real-time AI calls.
- **ROI Analytics**: Recharts-based conversion tracking.
- **Billing Dashboard**: qualified lead tracking and PDF invoice generation.

### Agent Edition Features (`/agent`)

- **PIN Login**: Secure personal access.
- **Personal Leads**: View only assigned leads.
- **Push Notifications**: Real-time browser alerts for new leads.
- **Lead Importer**: Advanced CSV/Excel parsing from mobile.
- **SEO Growth Engine**: AI-powered toolkit for automotive content generation.

## Task Status (Completed V20)

1. [x] **Premium Suite Deck**: Integrated $2,900 CAD investment slide into Admin Pitch Mode.
2. [x] **Pitch UX**: Added explicit arrow navigation for professional dealer presentations.
3. [x] **Refund Guarantee**: Hardcoded the 6-month reimbursement guarantee into the sales pitch.
4. [x] **Agent Edition**: Full PWA dashboard with lead import and push notifications.
5. [x] **SEO Content Engine**: Integrated AI-powered SEO kit for dealer growth.
6. [x] **Restricted Billing**: Security update to hide sensitive billing data behind SuperAdmin access.

## Memory Log

- **2026-03-24 to 2026-04-01**: Iterative development from V1 to V18 (SaaS, AI Hub, PPL, SEO).
- **2026-04-02 (V19.0)**: **AGENT EDITION DEPLOYED**. Agent login, push notifications, lead import, and assignment system.
- **2026-04-02 (V20.0)**: **PREMIUM SUITE DEPLOYED**.
  - **Investment Deck Updated**: Added $2,900 CAD pricing ($1,450 Down), 10 leads/day goal, 25-50% closing range, and 6-month reimbursement policy.
  - **Navigation UX Upgrade**: Added explicit side-navigation arrows for smoother dealer demos.
  - **Pricing Realignment**: Finalized tiers for Agent ($99/mo) and Dealer ($2,900 CAD total).
  - Pushed all updates to GitHub and Vercel.
- **2026-04-03 (V21.0)**: **GROWTH & SECURITY UPDATE**.
  - **Restricted Billing Access**: Implemented `sa=true` SuperAdmin flag to protect sensitive financial data.
  - **SEO Growth Engine**: Launched standalone component for AI-generated automotive SEO metadata and blog snippets.
  - **Lead Management**: Refined agent assignment and lead DNA extraction logic.

## Antigravity Phone Connect Setup & Remote Debugging

If you need to restart your Antigravity Phone Connect (Mobile Remote Control), follow these steps to ensure the editor is in debug mode:

1. **Close Antigravity**: Completely close the currently running Antigravity editor window.
2. **Launch in Debug Mode**:
   - Open standard Windows **Command Prompt** (`cmd`).
   - Run the exact following command:
     `code-insiders "C:\Users\ACER\Documents\Programming Folder Rep\AI Sales Engine FilCan Cars" --remote-debugging-port=9000`
   - *(Note: If `code-insiders` isn't recognized, try `antigravity` or `code` instead).*
3. **Start the Web/Mobile Server**:
   - Once Antigravity reopens, open your File Explorer.
   - Navigate to the special folder without the dot: `C:\Users\ACER\Antigravity\Remote-Control`
   - Double-click **`start_ag_phone_connect_web.bat`**.
   - A terminal will pop up, successfully connect to the CDP endpoint, and print your Magic QR Code.
4. **Scan & Connect**: Scan the QR code with your phone's camera. You're logged in!

---

### Vapi Outbound 2.0 (Telephony Suite)

- **Server-Side Calling**: Physically dials real phone numbers via PSTN (not just browser-based).
- **Dynamic Dialer**: Admin Hub prompts for a phone number if a lead is missing one (Pitch Move).
- **AI Persona Injection**: Dynamically overrides Elliot's script to use **Option B** (Natural Dealership Vibe).
- **Demo Mode Fallback**: Safe mode for presentations to prevent crashes if API keys are missing.

### Agent Subscription System

- **14-Day Trial**: Automated lockout for agents after 14 days of usage.
- **Grandfathering**: Seeded "Cousin" account as permanently active.
- **Billing Readiness**: Database schema extended to support Stripe/GCash integration.

## Task Status (Completed V21+)

1. [x] **Vapi Outbound 2.0**: Migrated to server-side PSTN calling with dynamic dialer and script injection.
2. [x] **Agent Trials**: Implemented subscription enforcement and trial countdowns in Agent Edition.
3. [x] **Demo Safety**: Added fallback logic for flawless manager presentations.
4. [x] **Relentless Auto-Assignment**: Implemented Round-Robin logic for lead distribution.
5. [x] **Persona Unification**: Consolidated Elliot into a single full-stack sales specialized role.
6. [x] **vAuto Appraisal**: Integrated simulated VIN-based valuation into the AI script and demo widget.
7. [x] **Shiftly Automation**: Added one-click Marketplace posting demo button.

## Memory Log

- **2026-03-24 to 2026-04-05**: Versions 1.0 to 21.0 (CRM, SEO, Premium Deck, Lead AI).
- **2026-04-06 (V22.0)**: **VAPI OUTBOUND & BILLING ENGINE**.
  - **PSTN Calling**: Successfully integrated Vapi Outbound 2.0. Leads can now be called directly on their cell phones.
  - **Dynamic Dialer**: Added "Prompt-on-Dial" feature to Admin Hub for managers to test their own numbers live.
  - **Subscription Enforcement**: Launched 14-day trial lockout for agents with grandfathering for the founding team.
  - **Credential Sync**: Secured VAPI_API_KEY and ASSISTANT_ID in root `.env`.

---

## Antigravity Phone Connect Setup & Remote Debugging

If you need to restart your Antigravity Phone Connect (Mobile Remote Control), follow these steps:

1. **Close Antigravity**: Completely close the currently running Antigravity editor window.
2. **Launch in Debug Mode**:
   - Open standard Windows **Command Prompt** (`cmd`).
   - Run: `code-insiders "C:\Users\ACER\Documents\Programming Folder Rep\AI Sales Engine FilCan Cars" --remote-debugging-port=9000`
   - *(Note: Use `ap` region for Ngrok in `.env` to prevent timeouts).*
3. **Start the Web/Mobile Server**:
   - Navigate to `C:\Users\ACER\Antigravity\Remote-Control`
   - Double-click **`start_ag_phone_connect_web.bat`**.
4. **Scan & Connect**: Scan the Magic QR Code on your phone.


---

- Auto-logging Vapi call recordings and transcripts back into the Lead DNA profile.

---

## Task Status (Completed V23)

1. [x] **Relentless Auto-Assignment**: Implemented Round-Robin assignment logic in `api/storage.py`. Leads are now automatically distributed to active agents.
2. [x] **Agent Pulse Sync**: Optimized Agent Dashboard to poll for new assignments and trigger persistent push notifications.
3. [x] **Model Consistency**: Unified DNA schema across Pydantic and SQLAlchemy (`assigned_agent`).

## Memory Log

- **2026-04-09 (V23.0)**: **AUTOMATED PIPELINE ACTIVATED**.
  - **Round-Robin High Performance**: New leads from Facebook, Google, and Web are automatically assigned to the best-fit active agent.
  - **Push Notification Loop**: Verified the PWA notification cycle. Agents are now alerted within 30 seconds of a lead arriving.
  - **Premium Suite Evolution**: Documented the "Elliot-to-Agent" handoff protocol for FilCan presentation.

- **2026-04-09 (V24.0)**: **PREMIUM QUALIFICATION SUITE & PERSONA UNIFICATION**.
  - **Unified Elliot Persona**: Merged all receptionist and closer duties into a single "Full-Stack Specialist" role for Elliot. Removed Jason AI to simplify the sales journey.
  - **vAuto Appraisal Integration**: Added simulated appraisal logic into the AI script. Elliot can now run a "vAuto/Shiftly" valuation using a customer's VIN live in the chat/voice call.
  - **Credit Verification Step**: Added interactive credit range selection to the demo widget, extracting "Lead DNA" (Excellent, Good, Fair) before agent handover.
  - **Shiftly Marketplace Automation**: Added a dedicated "Marketplace (Shiftly)" button in the Admin HQ to demonstrate automated inventory posting.
  - **Lead DNA Dashboard**: Enhanced Agent and Admin views to display "Credit Tier" and "vAuto Trade-in Estimate" directly on the lead cards.

- **2026-04-10 (V25.0)**: **CONNECTIVITY & MULTI-TOOL OPS**.
  - **Antigravity Phone Connect**: FIXED heartbeat timeouts by switching Ngrok to the `ap` (Asia-Pacific) region default.
  - **Odoo Helpdesk**: Paused automated survey sending for customer feedback. Created structured favorite reports for company-based ticket analytics.
  - **GLPI Deployment**: Began local WAMP setup for KEGI IT Asset Management system.
  - **System Stability**: Verified all local servers and tunnels are resilient for the next session.



