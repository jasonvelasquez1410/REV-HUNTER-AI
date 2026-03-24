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

## Deployment Status
- **GitHub**: Pushed to `jasonvelasquez1410/REV-HUNTER-AI`.
- **Vercel**: Configured for monorepo. 
  - API is routed via `/api`.
  - Frontend defaults to `/api` for the backend URL.
  - **PENDING**: Initial import and deployment on the Vercel Dashboard by the user.

## Recent Milestones
- [x] Initial monorepo setup.
- [x] Rebranded to RevHunter AI.
- [x] Implemented multi-tenant logic (`tenants.json`).
- [x] Configured `vercel.json` for monorepo routing.
- [x] Set `/api` as the default API endpoint in the frontend.

## Next Topic / Pending Tasks
1. **Vercel Deployment**: Verify the live deployment and ensure environment variables (`OPENAI_API_KEY`) are set.
2. **Lead Engagement Integration**: Finalize the "Omni-Hunter" control center in the Admin Hub.
3. **Facebook Integration**: Ensure webhooks are correctly handling lead events from the live production site.

## Memory Log
- **2026-03-24**: Finalized Vercel configuration. Code now uses relative path `/api` for backend communication. Pushed to GitHub. Created this `project.md` for persistence.
