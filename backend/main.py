from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from models import UserMessage, Lead, AdApproval, Car
from ai_logic import qualify_lead, get_inventory, generate_ad_copy, get_tenant_config
from typing import List, Optional

app = FastAPI(title="RevHunter AI Sales Engine API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
leads_db = [
    Lead(id=0, name="John Doe", email="john@example.com", phone="555-0199", credit_score=720, monthly_budget=500, trade_in_details="2015 Honda Civic", status="Qualified", is_reported=True, is_billed=False, quality_score=95, follow_up_streak=15, last_action_time="Saturday 9:00 PM", is_aged=False),
    Lead(id=1, name="Sarah Smith", email="sarah@gmail.com", phone="555-0123", credit_score=650, monthly_budget=400, trade_in_details="None", status="Pending", is_reported=False, is_billed=False, quality_score=60, follow_up_streak=5, last_action_time="Friday 2:00 PM", is_aged=False),
    Lead(id=2, name="Mike Johnson", email="mike@icloud.com", phone="555-9876", credit_score=680, monthly_budget=600, trade_in_details="2018 Ford Escape", status="Hot", is_reported=True, is_billed=True, quality_score=98, follow_up_streak=45, last_action_time="Thursday 10:00 AM", is_aged=False),
    Lead(id=3, name="Old Prospect", email="old@demo.com", phone="555-0000", credit_score=600, monthly_budget=300, trade_in_details="2005 Jetta", status="Pending", is_reported=False, is_billed=False, quality_score=40, follow_up_streak=0, last_action_time="October 2025", is_aged=True)
]
ads_db = [
    {"id": 1, "content": "Special offer on Toyota RAV4!", "platform": "Facebook", "status": "Pending"},
    {"id": 2, "content": "Trade-in your old car for top value.", "platform": "Instagram", "status": "Approved"}
]

@app.get("/")
async def root():
    return {"message": "RevHunter AI API is Running"}

@app.get("/tenant-config")
async def get_config(x_tenant_id: Optional[str] = Header(None)):
    tenant_id = x_tenant_id or "filcan"
    return get_tenant_config(tenant_id)

@app.get("/inventory", response_model=List[Car])
async def req_inventory(x_tenant_id: Optional[str] = Header(None)):
    tenant_id = x_tenant_id or "filcan"
    return get_inventory(tenant_id)

@app.post("/chat")
async def chat_endpoint(user_msg: UserMessage, x_tenant_id: Optional[str] = Header(None)):
    tenant_id = x_tenant_id or "filcan"
    response, new_context = qualify_lead(user_msg.message, user_msg.context, tenant_id)
    return {"response": response, "context": new_context}

@app.get("/leads", response_model=List[Lead])
async def get_leads():
    return leads_db

@app.post("/leads/{lead_index}/report")
async def report_lead(lead_index: int):
    if 0 <= lead_index < len(leads_db):
        leads_db[lead_index].is_reported = True
        return {"message": f"Lead {leads_db[lead_index].name} reported as quality pick"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.post("/leads/{lead_index}/charge")
async def charge_lead(lead_index: int):
    if 0 <= lead_index < len(leads_db):
        leads_db[lead_index].is_billed = True
        return {"message": f"Lead {leads_db[lead_index].name} marked as billed"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.get("/daily-report")
async def get_daily_report(x_tenant_id: Optional[str] = Header(None)):
    tenant_id = x_tenant_id or "filcan"
    tenant = get_tenant_config(tenant_id)
    quality_leads = [lead for lead in leads_db if lead.is_reported]
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
async def get_aged_leads():
    return [lead for lead in leads_db if lead.is_aged]

@app.post("/leads/{lead_index}/reactivate")
async def reactivate_lead(lead_index: int):
    if 0 <= lead_index < len(leads_db):
        leads_db[lead_index].is_aged = False
        leads_db[lead_index].last_action_time = "Just Now"
        leads_db[lead_index].follow_up_streak = 1
        return {"message": f"Lead {leads_db[lead_index].name} brought back to life!"}
    raise HTTPException(status_code=404, detail="Lead not found")

@app.post("/generate-ad")
async def create_ad(x_tenant_id: Optional[str] = Header(None)):
    tenant_id = x_tenant_id or "filcan"
    content = generate_ad_copy(tenant_id)
    new_ad = {"id": len(ads_db) + 1, "content": content, "platform": "Facebook", "status": "Pending"}
    ads_db.append(new_ad)
    return new_ad

@app.get("/ads", response_model=List[AdApproval])
async def get_ads():
    return ads_db

@app.get("/marketing-report")
async def get_report():
    return {
        "published_ads": sum(1 for ad in ads_db if ad["status"] == "Approved"),
        "pending_ads": sum(1 for ad in ads_db if ad["status"] == "Pending"),
        "daily_impressions": 1250,
        "daily_reach": 850,
        "leads_captured_24h": 5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
