# RevHunter AI - Project Memory

This file serves as a persistent record of the project's state to help future sessions continue seamlessly.

## Project Overview
- **Name**: RevHunter AI (formerly AI Sales Engine)
- **Goal**: A multi-tenant AI Sales Engine for car dealerships to automate lead engagement and marketing.
- **Current Tenant**: FilCan Cars (Sherwood Park)

## Technical Architecture
- **Monorepo Structure**:
  - `/frontend`: Vite + React SPA.
  - `/backend`: FastAPI (Python) backend using OpenAI for lead qualification.
- **Key Files**:
  - `vercel.json`: Monorepo deployment config for Vercel.
  - `backend/tenants.json`: Configuration for multi-tenancy.
  - `backend/main.py`: Main API entry point.

## Core Features
- **AI Demo Pitch Mode**: A built-in presentation in the Admin Portal (`Admin.jsx`) designed to pitch RevHunter AI to dealership owners. It covers the roles of the AI: Receptionist, Sales Agent, and Marketing Manager.
- **9-Step Lead Qualification**: A role-based state machine (`ai_logic.py`) that guides leads from initial greeting to "closing" (presenting inventory matches and booking test drives).
- **Multi-Tenant Architecture**: Supports multiple dealerships (e.g., FilCan Cars) via `tenants.json`, with dynamic branding and inventory.

## Deployment Status
- **GitHub**: Pushed to `jasonvelasquez1410/REV-HUNTER-AI`.
- **Vercel**: Configured for monorepo. 
  - API is routed via `/api`.
  - Frontend defaults to `/api` for the backend URL.
  - **Goal**: Transition to a fully scalable SaaS model.

## Next Topic / Pending Tasks
1. **SaaS Deployment**: Verify the live deployment on Vercel and ensure environment variables (`OPENAI_API_KEY`) are set for multi-tenant production.
2. **Database Integration**: Move from in-memory/JSON storage to a persistent database (e.g., PostgreSQL) to support multiple SaaS clients.
3. **Omni-Hunter Control Center**: Finalize one-click lead engagement and real-time monitoring.

## Memory Log
- **2026-03-24**: Finalized Vercel configuration. Created `project.md`.
- **2026-03-25**: Documented the "AI Presentation" logic (Demo Pitch Mode and 9-Step Lead Hunter flow). Shifted focus toward SaaS deployment and persistent database integration.
