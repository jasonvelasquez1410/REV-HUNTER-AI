# RevHunter AI - Project Memory (V20.0 Premium Suite)

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview

- **Name**: RevHunter AI (The Relentless Sales Engine)
- **Goal**: A multi-tenant AI SaaS Profit Engine for car dealerships to automate lead engagement, marketing, and reception.
- **Business Model (Three-Tier)**:
  - **Tier 1 — Dealer SaaS (PPL)**: $20/lead qualified.
  - **Tier 2 — Agent Edition**: $99/mo per agent (Personal AI specialist).
  - **Tier 3 — Premium Suite**: $2,900 CAD One-Time Setup (Includes full integration, unlimited agents, and 1-year money-back guarantee).
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
- **Slide 3: The Investment**: $2,900 CAD pricing, 🛡️ 1-Year Full Refund Guarantee, and Renewal Policy.
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

## Task Status (Completed V20)

1. [x] **Premium Suite Deck**: Integrated $2,900 CAD investment slide into Admin Pitch Mode.
2. [x] **Pitch UX**: Added explicit arrow navigation for professional dealer presentations.
3. [x] **Refund Guarantee**: Hardcoded the 1-year money-back guarantee into the sales pitch.
4. [x] **Agent Edition**: Full PWA dashboard with lead import and push notifications.

## Memory Log

- **2026-03-24 to 2026-04-01**: Iterative development from V1 to V18 (SaaS, AI Hub, PPL, SEO).
- **2026-04-02 (V19.0)**: **AGENT EDITION DEPLOYED**. Agent login, push notifications, lead import, and assignment system.
- **2026-04-02 (V20.0)**: **PREMIUM SUITE DEPLOYED**.
  - **Investment Deck Updated**: Added $2,900 CAD pricing model and 1-year refund guarantee to Pitch Mode.
  - **Navigation UX Upgrade**: Added explicit side-navigation arrows to the Admin overlay for smoother dealer demos.
  - **Pricing Realignment**: Finalized tiers for Agent ($99/mo) and Dealer ($2,900 CAD one-time).
  - Pushed all updates to GitHub and Vercel.

## Future Roadmap

### Stripe / GCash Integration

- Automate the 120,000 PHP payment and annual renewals.

### Vapi Outbound 2.0

- Migrate from browser-based voice to server-side outbound calling via Vapi.
