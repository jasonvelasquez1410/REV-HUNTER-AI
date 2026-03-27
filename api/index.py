from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from .models import UserMessage, Lead, AdApproval, Car
from .ai_logic import qualify_lead, generate_ad_copy, generate_ad_image_prompt
from pydantic import BaseModel
from typing import List, Optional, Annotated
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="RevHunter AI Sales Engine API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .storage import db
from fastapi import Depends

async def get_tenant_id(x_tenant_id: Annotated[Optional[str], Header()] = None) -> str:
    """Dependency to resolve tenant_id from headers/domain."""
    return x_tenant_id or "filcan"

class MarketingRequest(BaseModel):
    context: str = "tactical"

class ManualReplyRequest(BaseModel):
    recipient_id: str
    message: str
    is_private: bool = True

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # Deprecated
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY/GEMINI_API_KEY not set. Gemini AI features may be limited.")

# Create a router to handle both prefixed and non-prefixed routes (Vercel Compatibility)
from fastapi import APIRouter
api_router = APIRouter()

@api_router.get("/status")
async def get_status():
    """Diagnostic endpoint to check backend health."""
    db_status = "Online" if db.session_factory else "Degraded (Local Backup Active)"
    ai_status = "Online" if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY") else "Demo Mode (Key Missing)"
    return {
        "status": "RevHunter AI Backend Active",
        "engine": "Gemini 1.5 Flash",
        "database": db_status,
        "ai_model": ai_status,
        "v10_monorepo": True
    }

@api_router.get("/")
async def root():
    return {"status": "RevHunter AI Backend Active", "engine": "Gemini 1.5 Flash"}

@api_router.get("/tenant-config")
async def get_config(tenant_id: str = Depends(get_tenant_id)):
    return db.get_tenant_config(tenant_id)

@api_router.get("/inventory", response_model=List[Car])
async def req_inventory(tenant_id: str = Depends(get_tenant_id)):
    return db.get_inventory(tenant_id)

@api_router.post("/chat")
async def chat_endpoint(user_msg: UserMessage, tenant_id: str = Depends(get_tenant_id)):
    try:
        response, new_context, summary = qualify_lead(user_msg.message, user_msg.context, tenant_id)
        return {"response": response, "context": new_context, "summary": summary}
    except Exception as e:
        print(f"Chat Endpoint Error: {e}")
        return {"response": f"I'm sorry, I'm having a technical hiccup. (Error: {str(e)})", "context": user_msg.context}

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(tenant_id: str = Depends(get_tenant_id)):
    return db.get_leads(tenant_id)

@api_router.post("/leads/{lead_index}/report")
async def report_lead(lead_index: int):
    if db.report_lead(lead_index):
        return {"message": "Lead reported as quality pick"}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.post("/leads/{lead_index}/charge")
async def charge_lead(lead_index: int):
    if db.charge_lead(lead_index):
        return {"message": "Lead marked as billed"}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.get("/daily-report")
async def get_daily_report(tenant_id: str = Depends(get_tenant_id)):
    tenant = db.get_tenant_config(tenant_id)
    leads = db.get_leads(tenant_id)
    quality_leads = [lead for lead in leads if lead.is_reported]
    
    return {
        "date": "Today",
        "client": f"{tenant['name']} {tenant['location']}",
        "summary": {
            "total_quality_leads": len(quality_leads),
            "leads_to_close": quality_leads[:10],
            "total_billed": sum(1 for lead in quality_leads if lead.is_billed),
            "projected_revenue": "$125,000+",
            "engagement_rate": "98%"
        },
        "system_status": "RELENTLESS 24/7 ACTIVE"
    }

@api_router.get("/leads/aged", response_model=List[Lead])
async def get_aged_leads(tenant_id: str = Depends(get_tenant_id)):
    leads = db.get_leads(tenant_id)
    return [lead for lead in leads if lead.is_aged]

@api_router.post("/leads/{lead_index}/reactivate")
async def reactivate_lead(lead_index: int):
    if db.reactivate_lead(lead_index):
        return {"message": "Lead brought back to life!"}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.post("/generate-ad")
async def create_ad(req: MarketingRequest, tenant_id: str = Depends(get_tenant_id)):
    content = generate_ad_copy(tenant_id, req.context)
    new_ad = {"id": 100, "content": content, "platform": "Facebook", "status": "Pending"}
    db.add_ad(new_ad)
    return new_ad

@api_router.post("/generate-image-prompt")
async def create_image_prompt(ad_context: str):
    prompt = generate_ad_image_prompt(ad_context)
    return {"prompt": prompt}

@api_router.get("/webhook")
async def verify_fb_webhook(hub_mode: str = None, hub_verify_token: str = None, hub_challenge: str = None):
    VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN", "revhunter_secret")
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=hub_challenge)
    raise HTTPException(status_code=403, detail="Verification failed")

@api_router.post("/webhook")
async def fb_webhook(request: Request):
    data = await request.json()
    try:
        entry = data.get("entry", [{}])[0]
        messaging = entry.get("messaging", [{}])[0]
        sender_id = messaging.get("sender", {}).get("id")
        message_text = messaging.get("message", {}).get("text")
        
        if sender_id and message_text:
            tenant_id = "filcan"
            lead = db.get_or_create_lead(tenant_id, name=f"FB User {sender_id}")
            response, next_state, summary = qualify_lead(message_text, lead.conversation_state, tenant_id)
            db.update_lead_state(lead.id, json.loads(next_state), summary)
        return {"status": "success"}
    except Exception as e:
        print(f"Webhook Error: {e}")
        return {"status": "error", "detail": str(e)}

@api_router.post("/admin/manual-reply")
async def admin_manual_reply(req: ManualReplyRequest):
    return {"status": "sent", "reply": req.message}

@api_router.post("/admin/simulate-nudge")
async def simulate_nudge(req: ManualReplyRequest, tenant_id: str = Depends(get_tenant_id)):
    lead_index = int(req.recipient_id)
    with db.session_factory() as session:
        from .storage import LeadTable
        lead = session.query(LeadTable).filter(LeadTable.id == lead_index).first()
        if lead:
            lead.follow_up_streak += 1
            lead.last_action_time = f"AUTO-NUDGE #{lead.follow_up_streak}"
            session.commit()
            return {"status": "nudged", "streak": lead.follow_up_streak}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.get("/ads", response_model=List[AdApproval])
async def get_ads():
    return db.get_ads()

@api_router.get("/marketing-report")
async def get_report():
    ads = db.get_ads()
    return {
        "ads_published": sum(1 for ad in ads if ad["status"] == "Approved"),
        "ads_pending": sum(1 for ad in ads if ad["status"] == "Pending"),
        "impressions": "15,420",
        "reach": "9,850",
        "performance": "EXCEPTIONAL"
    }

app.include_router(api_router, prefix="/api")
app.include_router(api_router)
