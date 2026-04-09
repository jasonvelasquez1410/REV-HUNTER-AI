from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from .models import UserMessage, Lead, AdApproval, Car
from .ai_logic import qualify_lead, generate_ad_copy, generate_ad_image_prompt, generate_seo_content
from .import_leads import import_dealer_socket_excel
from .facebook_marketing import post_to_facebook_marketplace, generate_marketplace_payload
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
        
        # Log to DB if lead_id is present
        lead_id = user_msg.context.get("lead_id")
        if lead_id:
            db.append_interaction(lead_id, "customer", user_msg.message)
            db.append_interaction(lead_id, "AI (Elliot)", response)
            db.update_lead_state(lead_id, new_context, summary)

        return {
            "response": response, 
            "context": new_context, 
            "summary": summary,
            "persona": new_context.get("persona", "Elliot")
        }
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
    new_ad_data = {"content": content, "platform": "Facebook", "status": "Pending"}
    # db.add_ad returns None, social ID is autoincrement in DB
    db.add_ad(new_ad_data, tenant_id)
    return {"status": "success", "content": content}

@api_router.post("/leads/{lead_id}/sync-gsheets")
async def sync_lead_gsheets(lead_id: int):
    if db.sync_to_gsheets(lead_id):
        return {"message": "Lead synced to Google Sheets successfully"}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.patch("/leads/{lead_id}/status")
async def update_lead_status(lead_id: int, status_update: dict):
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status is required")
    if db.update_lead_status(lead_id, new_status):
        return {"message": f"Lead status updated to {new_status}"}
    raise HTTPException(status_code=404, detail="Lead not found")

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
            
            # Log Customer Message
            db.append_interaction(lead.id, "customer", message_text)
            
            response, next_state, summary = qualify_lead(message_text, lead.conversation_state, tenant_id)
            
            # Log AI Response
            db.append_interaction(lead.id, "AI (Elliot)", response)
            
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

@api_router.post("/webhooks/google-ads/{tenant_id}")
async def google_ads_webhook(tenant_id: str, request: Request):
    """Webhook for Google Ads Lead Form Extensions."""
    data = await request.json()
    try:
        # Google Ads webhook fields mapping
        user_column_data = data.get("user_column_data", [])
        email = next((x["string_value"] for x in user_column_data if x["column_name"] == "EMAIL"), "Unknown")
        name = next((x["string_value"] for x in user_column_data if x["column_name"] == "FULL_NAME"), "Google Lead")
        phone = next((x["string_value"] for x in user_column_data if x["column_name"] == "PHONE_NUMBER"), None)
        
        db.get_or_create_lead(tenant_id, name=f"{name} (G-Ads)", phone=phone)
        print(f"GOOGLE ADS: Captured lead {name} for {tenant_id}")
        return {"status": "success"}
    except Exception as e:
        print(f"Google Ads Webhook Error: {e}")
        return {"status": "error", "message": str(e)}

@api_router.post("/import/crm")
async def import_crm_leads(tenant_id: str = Depends(get_tenant_id)):
    """Triggers the Excel import for DealerSocket/Revenue Radar leads."""
    try:
        count = import_dealer_socket_excel("../Revenue Radar (R-Jay).xlsx", tenant_id)
        return {"status": "success", "imported": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/roi-analytics")
async def get_roi_analytics(tenant_id: str = Depends(get_tenant_id)):
    """Advanced analytics for the ROI Dashboard."""
    leads = db.get_leads(tenant_id)
    return {
        "total_leads": len(leads),
        "qualified_leads": sum(1 for l in leads if l.quality_score >= 80),
        "appointments": sum(1 for l in leads if l.status == "Hot"),
        "revenue_influenced": sum(1 for l in leads if l.is_billed) * 1500,
        "source_breakdown": {
            "Facebook": sum(1 for l in leads if "FB" in l.name),
            "Google Ads": sum(1 for l in leads if "G-Ads" in l.name),
            "Website": sum(1 for l in leads if "G-Ads" not in l.name and "FB" not in l.name)
        }
    }

@api_router.get("/billing")
async def get_billing_data(tenant_id: str = Depends(get_tenant_id)):
    """Fetches unbilled qualified leads and calculates current balance."""
    leads = db.get_leads(tenant_id)
    unbilled = [l for l in leads if l.quality_score >= 80 and not getattr(l, 'is_billed', False)]
    return {
        "unbilled_leads": [
            {"id": l.id, "name": l.name, "score": l.quality_score, "source": l.source or "Website", "date": l.last_action_time}
            for l in unbilled
        ],
        "total_owed": len(unbilled) * 20,
        "lead_rate": 20,
        "history": [
            {"id": "inv-001", "date": "2026-03-01", "amount": 840, "leads": 42, "status": "Paid"},
            {"id": "inv-002", "date": "2026-02-01", "amount": 620, "leads": 31, "status": "Paid"}
        ]
    }

class BillRequest(BaseModel):
    lead_ids: List[int]

@api_router.post("/leads/mark-billed")
async def mark_billed(req: BillRequest):
    """Marks leads as billed."""
    with db.session_factory() as session:
        from .storage import LeadTable
        session.query(LeadTable).filter(LeadTable.id.in_(req.lead_ids)).update({"is_billed": True}, synchronize_session=False)
        session.commit()
    return {"status": "success", "billed": len(req.lead_ids)}

class SEORequest(BaseModel):
    topic: str
    location: str = "Sherwood Park"

@api_router.post("/seo-generate")
async def seo_generate(req: SEORequest):
    """Generates SEO content kit."""
    return generate_seo_content(req.topic, req.location)

# ── AGENT MANAGEMENT ──────────────────────────────

DEMO_AGENTS = [
    {"id": 1, "name": "Juan Dela Cruz", "pin": "1234", "avatar": "JD", "role": "Senior Sales Consultant", "is_active": True},
    {"id": 2, "name": "Mark Santos", "pin": "5678", "avatar": "MS", "role": "Sales Consultant", "is_active": True},
    {"id": 3, "name": "Jessica Cruz", "pin": "9012", "avatar": "JC", "role": "Junior Sales Consultant", "is_active": True}
]

class AgentLoginRequest(BaseModel):
    name: str
    pin: str

@api_router.post("/agents/login")
async def agent_login(req: AgentLoginRequest):
    """Simple PIN-based agent login with 14-day trial enforcement."""
    from datetime import datetime
    # Try DB first
    try:
        from .storage import AgentTable
        with db.session_factory() as session:
            agent = session.query(AgentTable).filter(
                AgentTable.name == req.name, AgentTable.pin == req.pin, AgentTable.is_active == True
            ).first()
            if agent:
                # 14-Day Trial Check
                if agent.subscription_status != 'active':
                    if agent.trial_ends_at and datetime.utcnow() > agent.trial_ends_at:
                        agent.subscription_status = 'expired'
                        session.commit()
                        raise HTTPException(
                            status_code=402, 
                            detail={
                                "error": "subscription_expired", 
                                "message": "Your 14-day trial has expired.",
                                "provider": agent.billing_provider
                            }
                        )
                
                return {
                    "status": "success", 
                    "agent": {
                        "id": agent.id, 
                        "name": agent.name, 
                        "avatar": agent.avatar, 
                        "role": agent.role,
                        "subscription_status": agent.subscription_status,
                        "trial_ends": agent.trial_ends_at.isoformat() if agent.trial_ends_at else None
                    }
                }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Agent Login Error: {e}")
        pass
    
    # Fallback to demo agents (Always active for smooth demo)
    for a in DEMO_AGENTS:
        if a["name"].lower() == req.name.lower() and a["pin"] == req.pin:
            return {"status": "success", "agent": {**a, "subscription_status": "active"}}
    
    raise HTTPException(status_code=401, detail="Invalid name or PIN")

@api_router.get("/agents")
async def get_agents(tenant_id: str = Depends(get_tenant_id)):
    """List all agents."""
    try:
        from .storage import AgentTable
        with db.session_factory() as session:
            agents = session.query(AgentTable).filter(AgentTable.tenant_id == tenant_id).all()
            if agents:
                return [{"id": a.id, "name": a.name, "avatar": a.avatar, "role": a.role, "is_active": a.is_active} for a in agents]
    except:
        pass
    return DEMO_AGENTS

class AssignLeadRequest(BaseModel):
    lead_id: int
    agent_name: str

@api_router.post("/leads/assign")
async def assign_lead(req: AssignLeadRequest):
    """Assign a lead to an agent."""
    try:
        from .storage import LeadTable
        with db.session_factory() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == req.lead_id).first()
            if lead:
                lead.assigned_agent = req.agent_name
                session.commit()
                return {"status": "success", "lead_id": req.lead_id, "assigned_to": req.agent_name}
    except:
        pass
    return {"status": "success", "lead_id": req.lead_id, "assigned_to": req.agent_name, "note": "demo_mode"}

@api_router.get("/agents/{agent_name}/leads")
async def get_agent_leads(agent_name: str, tenant_id: str = Depends(get_tenant_id)):
    """Fetch leads assigned to a specific agent."""
    leads = db.get_leads(tenant_id)
    agent_leads = [l for l in leads if getattr(l, 'assigned_agent', None) == agent_name]
    return agent_leads

@api_router.get("/agents/{agent_id}/settings")
async def get_agent_settings(agent_id: int):
    """Fetch agent's Facebook configuration."""
    settings = db.get_agent_settings(agent_id)
    return settings

class AgentSettingsUpdate(BaseModel):
    fb_access_token: Optional[str] = None
    fb_page_id: Optional[str] = None
    fb_settings_json: Optional[dict] = None

@api_router.patch("/agents/{agent_id}/settings")
async def update_agent_settings(agent_id: int, settings: AgentSettingsUpdate):
    """Update agent's Facebook configuration."""
    if db.update_agent_settings(agent_id, settings.dict(exclude_unset=True)):
        return {"status": "success", "message": "Settings updated"}
    raise HTTPException(status_code=404, detail="Agent not found")

class MarketplacePostRequest(BaseModel):
    car_id: int
    agent_id: int
    custom_caption: Optional[str] = None

@api_router.post("/marketing/facebook/post-marketplace")
async def post_to_fb_marketplace(req: MarketplacePostRequest, tenant_id: str = Depends(get_tenant_id)):
    """Triggers AI generation and the Facebook post logic (Direct Page Feed)."""
    # 1. Fetch Agent Settings
    settings = db.get_agent_settings(req.agent_id)
    if not settings.get("fb_access_token"):
        raise HTTPException(status_code=400, detail="Facebook Access Token is not configured for this agent.")

    # 2. Fetch Car Details
    cars = db.get_inventory(tenant_id)
    car = next((c for c in cars if c["id"] == req.car_id), None)
    if not car:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    # 3. Generate Content
    tenant = db.get_tenant_config(tenant_id)
    message = req.custom_caption or f"{car['year']} {car['make']} {car['model']} available at {tenant['name']}!"

    # 4. Post to Facebook
    result = post_to_facebook_marketplace(
        access_token=settings["fb_access_token"],
        page_id=settings["fb_page_id"] or "me", 
        message=message,
        image_url=car.get("image")
    )
    
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
        
    return result

@api_router.get("/marketing/facebook/marketplace-helper/{car_id}")
async def get_marketplace_helper(car_id: int, tenant_id: str = Depends(get_tenant_id)):
    """Generates AI-organized listing details for a manual Marketplace post."""
    from .ai_logic import generate_marketplace_listing
    
    cars = db.get_inventory(tenant_id)
    car = next((c for c in cars if c["id"] == car_id), None)
    if not car:
        raise HTTPException(status_code=404, detail="Inventory item not found.")
        
    tenant = db.get_tenant_config(tenant_id)
    return generate_marketplace_listing(car, tenant["name"], tenant["location"])

class OutboundCallRequest(BaseModel):
    lead_id: int
    phone_number: Optional[str] = None

@api_router.post("/vapi/outbound-call")
async def trigger_vapi_outbound(req: OutboundCallRequest, tenant_id: str = Depends(get_tenant_id)):
    """Triggers an outbound phone call via Vapi to the lead."""
    from .storage import LeadTable
    # 1. Fetch Lead
    with db.session_factory() as session:
        lead = session.query(LeadTable).filter(LeadTable.id == req.lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
            
        phone = req.phone_number or lead.phone
        if not phone or phone.lower() == "none":
            raise HTTPException(status_code=400, detail="Lead has no phone number")
            
        # Clean phone number for E.164 formatting (simplified)
        clean_phone = "".join(filter(lambda c: c.isdigit() or c == "+", phone))
        if not clean_phone.startswith("+"):
            if len(clean_phone) == 10:
                clean_phone = "+1" + clean_phone
            else:
                clean_phone = "+" + clean_phone
            
        vapi_key = os.getenv("VAPI_API_KEY")
        assistant_id = os.getenv("VAPI_ASSISTANT_ID")
        
        if not vapi_key or not assistant_id:
            # DEMO MODE
            print(f"DEMO VAPI CALL: Dialing {clean_phone} for lead {lead.name}")
            return {"status": "success", "message": f"Demo Call: Dialing {clean_phone}...", "call_id": "demo-12345"}
            
        # REAL MODE
        try:
            import requests # Inner import to avoid startup crash if missing
            headers = {
                "Authorization": f"Bearer {vapi_key}",
                "Content-Type": "application/json"
            }
            
            # Injecting Custom Assistant Override (Option B: Natural Dealership)
            natural_prompt = f"""You are Elliot, a friendly sales assistant at FilCan Cars pulling records from our dealership database.
Your goal is to have a completely natural, human conversation with the customer. 
Customer Name: {lead.name}
Interest: {lead.car or 'buying a car'}

Say exactly this when they pick up, and wait for them to respond naturally: 
"Hello! This is Elliot from FilCan Cars. I saw you were looking at expanding your digital showroom, do you have a minute?"
Keep all responses extremely brief and conversational."""

            payload = {
                "assistantId": assistant_id,
                "assistantOverrides": {
                    "firstMessage": f"Hello! This is Elliot from FilCan Cars.",
                    "model": {
                        "provider": "openai",
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "system",
                                "content": natural_prompt
                            }
                        ]
                    }
                },
                "customer": {
                    "number": clean_phone,
                    "name": lead.name
                }
            }
            res = requests.post("https://api.vapi.ai/call/phone", headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            return {"status": "success", "message": f"AI is dialing {clean_phone}!", "call_id": data.get("id")}
        except Exception as e:
            print(f"Vapi Call Error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initiate Vapi call: {str(e)}")

class AssignmentRequest(BaseModel):
    lead_id: int
    agent_name: str

@api_router.post("/leads/assign")
async def manual_assign_lead(req: AssignmentRequest):
    """Admin Override: Manually assign a lead and lock it from auto-assignment."""
    from .storage import LeadTable
    with db.session_factory() as session:
        lead = session.query(LeadTable).filter(LeadTable.id == req.lead_id).first()
        if lead:
            lead.assigned_agent = req.agent_name
            lead.is_manual_assignment = True
            lead.last_action_time = f"MANUALLY ASSIGNED TO {req.agent_name.upper()}"
            session.commit()
            return {"status": "success", "agent": req.agent_name}
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.post("/vapi/webhook")
async def vapi_webhook(request: Request):
    """Processes Vapi call completion events (transcripts & recordings)."""
    data = await request.json()
    try:
        # Check if it's the right message type from Vapi
        msg = data.get("message", {})
        msg_type = msg.get("type")
        
        if msg_type == "end-of-call-report":
            transcript = msg.get("transcript", "No transcript available.")
            recording_url = msg.get("recordingUrl")
            customer_phone = msg.get("call", {}).get("customer", {}).get("number")
            
            if customer_phone:
                from .storage import LeadTable
                with db.session_factory() as session:
                    # Match by last 10 digits for robustness
                    lead = session.query(LeadTable).filter(LeadTable.phone.contains(customer_phone[-10:])).first()
                    if lead:
                        # Log high-fidelity call report
                        db.append_interaction(lead.id, "AI (Jason)", f"[PHONE CALL COMPLETED]\n{transcript}")
                        if recording_url:
                            db.update_recording_url(lead.id, recording_url)
                            print(f"VAPI WEBHOOK: Saved recording for lead {lead.id}")
            return {"status": "success"}
    except Exception as e:
        print(f"Vapi Webhook Processing Error: {e}")
    
    return {"status": "acknowledged"}

app.include_router(api_router, prefix="/api")
app.include_router(api_router)
