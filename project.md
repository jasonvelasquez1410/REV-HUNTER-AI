# RevHunter AI - Project Memory (V10 Final)

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview

- **Name**: RevHunter AI (The Relentless Sales Engine)
- **Goal**: A multi-tenant AI SaaS Profit Engine for car dealerships to automate lead engagement, marketing, and reception.
- **Current Tenant**: FilCan Cars (Sherwood Park)

## Technical Architecture (V10)

- **Monorepo Structure**:
  - `/frontend`: Vite + React SPA.
  - `/backend`: FastAPI (Python) backend using Google Gemini 1.5 Flash.
- **Key Files**:
  - `vercel.json`: Monorepo deployment config (Supports direct SPA routing for `/admin`).
  - `backend/storage.py`: Hardened DB controller with **Relentless Backup Mode** (Falls back to local data if Supabase is offline).
  - `backend/main.py`: Unified API with `APIRouter` for both `/api` and root-level routes (Vercel optimization).
  - `backend/ai_logic.py`: Core AI engine for lead qualification and content generation.

## Core Features (V10 Ready)

- **Receptionist Mode**: 24/7 automated greeting and discovery.
- **Sales Agent Mode**: 9-step qualification script and manual reply triggers.
- **Marketing Strategy Hub**: AI-generated multi-pillar content (Inventory, Strategic, Seasonal) with visual image prompts.
- **Accountability Audit Log**: Dynamic tracking of AI and human actions for transparency.
- **Health Diagnostic**: Live system status at `/api/status`.

## Deployment Status

- **GitHub**: Pushed to `jasonvelasquez1410/REV-HUNTER-AI`.
- **Vercel**: Live at `https://rev-hunter-ai.vercel.app/`.
- **Environment Variables Required**:
  - `GOOGLE_API_KEY`: Gemini 1.5 Flash key (Crucial for AI).
  - `DATABASE_URL`: Supabase connection string.
  - `FB_VERIFY_TOKEN`: Verification for Facebook webhooks.

## Task Status (Completed V10)

1. [x] **SaaS Deployment**: Live on Vercel with fixed monorepo routing. 
2. [x] **Database Integration**: Supabase/PostgreSQL connectivity enabled with local fallbacks.
3. [x] **Omni-Hunter Control Center**: Full lead engagement, manual replies, and marketing generation live.
4. [x] **Stateful Intelligence (V11)**: AI now tracks 9-step qualification progress and persists insights to the DB.

## Memory Log

- **2026-03-24**: Finalized Vercel configuration. Created `project.md`.
- **2026-03-25**: SaaS deployment configuration. Improved Vercel routing, enforced env variables for DB, and added health checks.
- **2026-03-26 (Latest)**: **V10 RE-ENGINEERING COMPLETE**.
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
- **2026-03-27 (V12.0)**: **CLIENT PRESENTATION MODE (PITCH EDITION)**.
  - **Simulation Lab**: Added real-time lead injection tool to the Admin Hub for live AI demonstrations.
  - **Pitch Deck**: Expanded the 'Demo Pitch Mode' with ROI calculators and 24/7 accountability slides.
  - **Premium Mock Data**: Tailored all leads, inventory, and reports specifically to FilCan Cars (Sherwood Park) for maximum impact.
  - **Executive Reporting**: Refactored reports to provide simplified, high-impact 'Executive Summaries'.
