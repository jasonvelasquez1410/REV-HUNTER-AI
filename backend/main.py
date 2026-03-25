from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from models import UserMessage, Lead, AdApproval, Car
from ai_logic import qualify_lead, get_inventory, generate_ad_copy, get_tenant_config
from typing import List, Optional, Annotated
import os
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

from storage import db
from typing import List, Optional, Annotated
from fastapi import Depends

async def get_tenant_id(x_tenant_id: Annotated[Optional[str], Header()] = None) -> str:
    """Dependency to resolve tenant_id from headers/domain."""
    return x_tenant_id or "filcan"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # Deprecated
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    # We'll allow it to run for now but warn, as per project.md requirements
    print("WARNING: GOOGLE_API_KEY not set. Gemini AI features may be limited.")

@app.get("/")
async def root():
    return {"message": "RevHunter AI API is Running"}

@app.get("/tenant-config")
async def get_config(tenant_id: str = Depends(get_tenant_id)):
    return db.get_tenant_config(tenant_id)

@app.get("/inventory", response_model=List[Car])
async def req_inventory(tenant_id: str = Depends(get_tenant_id)):
    return db.get_inventory(tenant_id)

@app.post("/chat")
async def chat_endpoint(user_msg: UserMessage, tenant_id: str = Depends(get_tenant_id)):
    response, new_context = qualify_lead(user_msg.message, user_msg.context, tenant_id)
    return {"response": response, "context": new_context}

@app.get("/leads", response_model=List[Lead])
async def get_leads(tenant_id: str = Depends(get_tenant_id)):
    return db.get_leads(tenant_id)

@app.post("/leads/{lead_index}/report")
async def report_lead(lead_index: int):
    if db.report_lead(lead_index):
        return {"message": "Lead reported as quality pick"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.post("/leads/{lead_index}/charge")
async def charge_lead(lead_index: int):
    if db.charge_lead(lead_index):
        return {"message": "Lead marked as billed"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.get("/daily-report")
async def get_daily_report(tenant_id: str = Depends(get_tenant_id)):
    tenant = db.get_tenant_config(tenant_id)
    leads = db.get_leads(tenant_id)
    quality_leads = [lead for lead in leads if lead.is_reported]
    return {
        "date": "2026-03-22",
        "client": f"{tenant['name']} {tenant['location']}",
        "leads": quality_leads[:10],
        "total_quality_leads": len(quality_leads),
        "total_billed": sum(1 for lead in quality_leads if lead.is_billed),
        "estimated_roi": "$45,000",
        "system_status": "24/7 Monitoring Active",
        "instant_engagements_today": 14
    }

@app.get("/leads/aged", response_model=List[Lead])
async def get_aged_leads(tenant_id: str = Depends(get_tenant_id)):
    leads = db.get_leads(tenant_id)
    return [lead for lead in leads if lead.is_aged]

@app.post("/leads/{lead_index}/reactivate")
async def reactivate_lead(lead_index: int):
    if db.reactivate_lead(lead_index):
        return {"message": "Lead brought back to life!"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.post("/generate-ad")
async def create_ad(tenant_id: str = Depends(get_tenant_id)):
    content = generate_ad_copy(tenant_id)
    new_ad = {"id": 100, "content": content, "platform": "Facebook", "status": "Pending"}
    db.add_ad(new_ad)
    return new_ad

@app.get("/ads", response_model=List[AdApproval])
async def get_ads():
    return db.get_ads()

@app.get("/marketing-report")
async def get_report():
    ads = db.get_ads()
    return {
        "published_ads": sum(1 for ad in ads if ad["status"] == "Approved"),
        "pending_ads": sum(1 for ad in ads if ad["status"] == "Pending"),
        "daily_impressions": 1250,
        "daily_reach": 850,
        "leads_captured_24h": 5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
