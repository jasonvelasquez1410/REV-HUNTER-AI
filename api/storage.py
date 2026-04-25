import json
import os
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from contextlib import contextmanager
from fastapi import HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from .models import Lead as PydanticLead, Car, AdApproval

# Database Setup
DATABASE_URL = os.getenv("DATABASE_URL")

# Late initialization to prevent crash on import
engine = None
SessionLocal = None
Base = declarative_base()

def init_db():
    global engine, SessionLocal
    if engine is None:
        if not DATABASE_URL:
            # Local/Windows: Use a relative path so it works everywhere
            # Vercel: /tmp is the only writable directory
            db_path = "revhunter_local.db"
            if os.name != 'nt': # If not Windows (e.g. Vercel)
                db_path = "/tmp/test_revhunter.db"
            
            print(f"WARNING: DATABASE_URL not set. Using fallback: {db_path}")
            db_url = f"sqlite:///{db_path}"
        else:
            # RevHunter Cloud: Robust postgres connection for Vercel/Supabase
            db_url = DATABASE_URL
            # Supabase/Neon/Most Cloud DBs require SSL
            if "sslmode" not in db_url:
                separator = "&" if "?" in db_url else "?"
                db_url += f"{separator}sslmode=require"
            
            # Use psycopg2-binary for production stability on Vercel
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            
        try:
            # Elite Pooling: High resilience for serverless spikes
            engine = create_engine(
                db_url, 
                pool_size=5 if "sqlite" not in db_url else None,
                max_overflow=10 if "sqlite" not in db_url else None,
                pool_pre_ping=True,
                pool_recycle=300,
                connect_args={"sslmode": "require"} if "postgresql" in db_url else {}
            )
            # Test connection immediately
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            Base.metadata.create_all(bind=engine)
            
            # Migration check
            try:
                with engine.connect() as conn:
                    conn.execute(text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS edition VARCHAR DEFAULT 'enterprise'"))
                    conn.commit()
            except: pass
            
            print("DATABASE: Production Cloud Connected.")
            return True
        except Exception as e:
            print(f"DATABASE CLOUD FAILURE: {e}")
            # Ensure we store the error for later reporting
            raise e

# SQLAlchemy Models
class TenantTable(Base):
    __tablename__ = "tenants"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    address = Column(String, nullable=True)
    welcome_message = Column(Text)
    theme_color = Column(String)
    ai_name = Column(String, default="Elliot")
    tagline = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

class CarTable(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    make = Column(String)
    model = Column(String)
    year = Column(Integer)
    price = Column(Integer)
    mileage = Column(Integer)
    type = Column(String)
    image = Column(String)
    description = Column(Text)

class LeadTable(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, default="filcan")
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    credit_score = Column(Integer, nullable=True)
    monthly_budget = Column(Float, nullable=True)
    trade_in_details = Column(String, nullable=True)
    car = Column(String, nullable=True)
    status = Column(String, default="Pending")
    is_reported = Column(Boolean, default=False)
    is_billed = Column(Boolean, default=False)
    quality_score = Column(Integer, default=0)
    follow_up_streak = Column(Integer, default=0)
    last_action_time = Column(String, default="Just Now")
    is_aged = Column(Boolean, default=False)
    conversation_state = Column(Text, default="{}")  # JSON string of the current qualification state
    conversation_summary = Column(Text, default="New Lead - Discovery Phase")
    source = Column(String, default="Website")
    assigned_agent = Column(String, nullable=True)
    is_manual_assignment = Column(Boolean, default=False)
    interaction_history = Column(Text, default="[]") 
    vapi_recording_url = Column(String, nullable=True)

class AgentTable(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, default="filcan")
    name = Column(String)
    pin = Column(String)
    avatar = Column(String, default="AG")
    role = Column(String, default="Sales Consultant")
    edition = Column(String, default="enterprise") # 'standalone' | 'enterprise'
    is_active = Column(Boolean, default=True)
    fb_access_token = Column(Text, nullable=True)
    fb_page_id = Column(String, nullable=True)
    fb_settings_json = Column(Text, default='{}')
    assistant_name = Column(String, default="Adam")
    # Billing & 14-Day Trial Fields
    trial_ends_at = Column(DateTime, nullable=True)
    subscription_status = Column(String, default="trialing") # 'trialing', 'active', 'expired', 'canceled'
    billing_provider = Column(String, default="stripe") # 'stripe', 'paddle', etc.
    provider_customer_id = Column(String, nullable=True)

class AdTable(Base):
    __tablename__ = "ads"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, default="filcan")
    content = Column(Text)
    platform = Column(String)
    status = Column(String, default="Pending")

class AppointmentTable(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, default="filcan")
    lead_id = Column(Integer, ForeignKey("leads.id"))
    car_id = Column(Integer, ForeignKey("inventory.id"), nullable=True)
    time = Column(String)
    status = Column(String, default="CONFIRMED")
    notes = Column(Text, nullable=True)

# Note: metadata.create_all is moved to init_db()

# Default configuration path
TENANTS_FILE = os.path.join(os.path.dirname(__file__), "tenants.json")

class Storage:
    def __init__(self):
        self.init_error = None
        try:
            init_db()
            self.session_factory = SessionLocal
            self._seed_data_if_empty()
        except Exception as e:
            print(f"Storage Initialization Critical Error: {e}")
            self.init_error = str(e)
            self.session_factory = None

    @contextmanager
    def session(self):
        """Safe session management with hyper-resilient re-init."""
        global SessionLocal
        
        # If factory is missing or closed, force a heartbeat check/re-init
        if not self.session_factory or not SessionLocal:
            try:
                init_db()
                self.session_factory = SessionLocal
                self.init_error = None # Clear error on success
            except Exception as e:
                self.init_error = str(e)
                raise HTTPException(
                    status_code=503, 
                    detail=f"DB OFFLINE: {str(e)}. Please check your DATABASE_URL in Vercel settings."
                )
            
        if not self.session_factory:
            err_msg = f"Critical Connection Error: {self.init_error}" if self.init_error else "Could not reach lead database."
            raise HTTPException(
                status_code=503, 
                detail=f"{err_msg}. Check Vercel DATABASE_URL."
            )
            
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except:
            session.rollback()
            raise
        finally:
            session.close()

    def _seed_data_if_empty(self):
        with self.session() as session:
            # Seed Tenants
            if session.query(TenantTable).count() == 0:
                tenants = [
                    TenantTable(
                        id="filcan",
                        name="FilCan Cars",
                        location="Sherwood Park",
                        address="983 Fir Street",
                        welcome_message="Welcome to FilCan Cars! I'm Elliot, your digital specialist. I'm here to help you find the perfect vehicle. What brings you in today—looking for an upgrade, or just browsing?",
                        theme_color="#003366"
                    ),
                    TenantTable(
                        id="demo",
                        name="RevHunter Demo Shop",
                        location="Digital",
                        address="123 AI Avenue",
                        welcome_message="Welcome to the RevHunter AI Demo Shop! I'm Elliot, your digital assistant. What are you looking for today?",
                        theme_color="#D92027"
                    )
                ]
                session.add_all(tenants)
                session.commit()

            # Seed Inventory (Empty per User Request - Only show fetched/imported data)
            if session.query(CarTable).count() == 0:
                pass

            # Lead seeding for Solo Hunter Pitch (High-Intent Demo Prospects)
            if session.query(LeadTable).count() == 0:
                demo_leads = [
                    LeadTable(tenant_id="filcan", name="Dave (Family)", email="dave@example.com", phone="1234567890", car="2023 Ford F-150", status="Hot", monthly_budget=800, credit_score=720, interaction_history=json.dumps([{"role": "customer", "text": "Is the F-150 still available?", "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()}])),
                    LeadTable(tenant_id="filcan", name="Sarah Thompson", email="sarah.t@example.com", phone="9876543210", car="2024 Mazda CX-90", status="AI Nudge", monthly_budget=600, credit_score=680, interaction_history=json.dumps([{"role": "customer", "text": "What is the finance rate on the CX-90?", "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()}])),
                    LeadTable(tenant_id="filcan", name="Local Prospect", email="prospect@example.com", phone="5551234567", car="SUV Discovery", status="New", monthly_budget=500, credit_score=650)
                ]
                session.add_all(demo_leads)
                session.commit()
            
            # Seed Agents (The Premium Team)
            if session.query(AgentTable).count() == 0:
                agents = [
                    AgentTable(tenant_id="filcan", name="Juan Dela Cruz", pin="1234", avatar="JD", role="Senior Sales Consultant"),
                    AgentTable(tenant_id="filcan", name="Mark Santos", pin="5678", avatar="MS", role="Sales Consultant"),
                    AgentTable(tenant_id="filcan", name="Jessica Cruz", pin="9012", avatar="JC", role="Junior Sales Consultant"),
                    AgentTable(tenant_id="filcan", name="R-Jay", pin="1410", avatar="RJ", role="Sales Manager", subscription_status="active", edition="enterprise"),
                    AgentTable(tenant_id="filcan", name="Rjay", pin="2026", avatar="RJ", role="Sales Associate", subscription_status="active", edition="standalone")
                ]
                session.add_all(agents)
                session.commit()
            
            # Seed Ads
            if session.query(AdTable).count() == 0:
                ads = [
                    AdTable(tenant_id="filcan", content="Special offer on Toyota RAV4!", platform="Facebook", status="Pending"),
                    AdTable(tenant_id="filcan", content="Trade-in your old car for top value.", platform="Instagram", status="Approved")
                ]
                session.add_all(ads)
                session.commit()
                
            # Seed Agents (Grandfathering the Cousin's account)
            if session.query(AgentTable).count() == 0:
                agents = [
                    AgentTable(
                        tenant_id="filcan",
                        name="Cousin",
                        pin="1234",
                        avatar="CO",
                        role="Sales Executive",
                        is_active=True,
                        subscription_status="active", # Grandfathered in!
                        trial_ends_at=None,
                        billing_provider="none"
                    ),
                    AgentTable(
                        tenant_id="filcan",
                        name="Test Agent",
                        pin="0000",
                        avatar="TA",
                        role="Sales Representative",
                        is_active=True,
                        subscription_status="trialing",
                        trial_ends_at=datetime.utcnow() + timedelta(days=14),
                        billing_provider="stripe"
                    )
                ]
                session.add_all(agents)
                session.commit()

    def get_tenant_config(self, tenant_id: str = "filcan") -> Dict:
        # v14.0-ELITE: Forced Heartbeat Sync for Pitch Perfection
        fallback_config = {
            "id": tenant_id,
            "name": "RevHunter AI" if tenant_id == "filcan" else "Demo Motors",
            "location": "Global" if tenant_id == "filcan" else "Digital",
            "address": "Elite Sales OS" if tenant_id == "filcan" else "123 AI Avenue",
            "welcome_message": "Welcome! I'm Elliot, your digital specialist. How can I help you scale your sales today?",
            "theme_color": "#D92027"
        }
        
        if not self.session_factory:
            return fallback_config
            
        try:
            with self.session() as session:
                tenant = session.query(TenantTable).filter(TenantTable.id == tenant_id).first()
                if tenant:
                    # HEARBEAT: Force sync the latest greeting to the DB if it's outdated
                    latest_greet = fallback_config["welcome_message"]
                    if tenant.welcome_message != latest_greet:
                        tenant.welcome_message = latest_greet
                        session.commit()
                    
                    return {
                        "id": tenant.id,
                        "name": tenant.name,
                        "location": tenant.location,
                        "address": tenant.address,
                        "welcome_message": tenant.welcome_message,
                        "theme_color": tenant.theme_color
                    }
                return fallback_config
        except Exception as e:
            print(f"Database Fetch Error (get_tenant_config): {e}")
            return fallback_config

    def get_inventory(self, tenant_id: str = "filcan") -> List[Dict]:
        fallback_inventory = []
        
        if not self.session_factory:
            return fallback_inventory
            
        try:
            with self.session() as session:
                cars = session.query(CarTable).filter(CarTable.tenant_id == tenant_id).all()
                return [
                    {
                        "id": c.id,
                        "make": c.make,
                        "model": c.model,
                        "year": c.year,
                        "price": c.price,
                        "mileage": c.mileage,
                        "type": c.type,
                        "image": c.image,
                        "description": c.description
                    } for c in cars
                ]
        except Exception as e:
            print(f"Database Fetch Error (get_inventory): {e}")
            return fallback_inventory

    def get_leads(self, tenant_id: str = "filcan") -> List[PydanticLead]:
        fallback_leads = [
            PydanticLead(id=1, name="Marvin Raymundo", email="marvin@example.com", phone="587-888-1234", status="Hot", quality_score=98, conversation_summary="Highly interested in Mazda CX-90. (Local Backup Active)"),
            PydanticLead(id=2, name="Jessica Chen", email="jess@outlook.com", phone="587-555-9000", status="Qualified", quality_score=85, conversation_summary="Looking for a reliable SUV. (Local Backup Active)")
        ]
        
        if not self.session_factory:
            return fallback_leads
            
        try:
            with self.session() as session:
                leads = session.query(LeadTable).filter(LeadTable.tenant_id == tenant_id).all()
                return [PydanticLead(**l.__dict__) for l in leads]
        except Exception as e:
            print(f"Database Fetch Error (get_leads): {e}")
            return fallback_leads

    def report_lead(self, lead_id: int) -> bool:
        with self.session() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_reported = True
                session.commit()
                return True
            return False

    def charge_lead(self, lead_id: int) -> bool:
        with self.session() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_billed = True
                session.commit()
                return True
            return False

    def reactivate_lead(self, lead_id: int) -> bool:
        if not self.session_factory: return False
        with self.session() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_aged = False
                lead.last_action_time = "Just Now"
                lead.follow_up_streak = 1
                lead.status = "Qualified"
                session.commit()
                return True
            return False

    def update_lead_status(self, lead_id: int, new_status: str) -> bool:
        if not self.session_factory: return False
        try:
            with self.session() as session:
                lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                if lead:
                    lead.status = new_status
                    lead.last_action_time = "Stage Updated"
                    session.commit()
                    return True
                return False
        except Exception as e:
            print(f"DB Update Error (update_lead_status): {e}")
            return False

    def sync_to_gsheets(self, lead_id: int) -> bool:
        """
        Placeholder for real Google Sheets sync.
        TODO: Implement gspread logic when credentials are provided.
        """
        if not self.session_factory: return True # Simulate success in fallback mode
        try:
            with self.session() as session:
                lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                if lead:
                    print(f"SYNC-TO-GSHEETS: Lead {lead.name} would be synced to Google Sheets.")
                    return True
                return False
        except Exception as e:
            print(f"GSheets Sync Error: {e}")
            return False

    def update_lead_state(self, lead_id: int, state: Dict, summary: str) -> bool:
        if not self.session_factory: return False
        
        # v13.0-FINAL: Added basic retry logic for DB resilience
        max_retries = 2
        for attempt in range(max_retries):
            try:
                with self.session() as session:
                    lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                    if lead:
                        lead.conversation_state = json.dumps(state)
                        lead.conversation_summary = summary
                        lead.last_action_time = "Just Now"
                        session.commit()
                        return True
                    return False
            except Exception as e:
                print(f"DB Update Attempt {attempt+1} failed: {e}")
                if attempt == max_retries - 1: return False
        return False

    def get_or_create_lead(self, tenant_id: str, name: str, phone: str = None) -> LeadTable:
        with self.session() as session:
            lead = session.query(LeadTable).filter(
                LeadTable.tenant_id == tenant_id,
                LeadTable.name == name
            ).first()
            if not lead:
                lead = LeadTable(
                    tenant_id=tenant_id,
                    name=name,
                    phone=phone,
                    status="Discovery"
                )
                session.add(lead)
                session.commit()
                session.refresh(lead)
                
                # v20.0-AUTO: Automatically trigger assignment
                self.auto_assign_lead(lead.id, tenant_id)
            return lead

    def auto_assign_lead(self, lead_id: int, tenant_id: str = "filcan") -> Optional[str]:
        """Automatically assigns a lead to an active agent using Round-Robin logic."""
        if not self.session_factory: return None
        
        try:
            with self.session() as session:
                # 1. Get all active agents for this tenant
                agents = session.query(AgentTable).filter(
                    AgentTable.tenant_id == tenant_id,
                    AgentTable.is_active == True
                ).all()
                
                if not agents:
                    return None
                
                # 2. Find the agent with the fewest current leads to keep it fair (Round-Robin style)
                # Count leads assigned to each agent name
                agent_leads_counts = []
                for agent in agents:
                    count = session.query(LeadTable).filter(
                        LeadTable.tenant_id == tenant_id,
                        LeadTable.assigned_agent == agent.name
                    ).count()
                    agent_leads_counts.append((agent, count))
                
                # Sort by count ascending, then by ID to break ties consistently
                agent_leads_counts.sort(key=lambda x: (x[1], x[0].id))
                best_agent = agent_leads_counts[0][0]
                
                # 3. Assign the lead
                lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                if lead:
                    if lead.is_manual_assignment:
                        print(f"AUTO-ASSIGN: Skipping lead {lead_id} (Manual Override Active)")
                        return lead.assigned_agent
                    
                    lead.assigned_agent = best_agent.name
                    lead.last_action_time = f"AUTO-ASSIGNED TO {best_agent.name.upper()}"
                    session.commit()
                    print(f"AUTO-ASSIGN: Lead #{lead_id} assigned to agent {best_agent.name}")
                    return best_agent.name
                    
        except Exception as e:
            print(f"Auto-Assignment Error: {e}")
            return None

    def append_interaction(self, lead_id: int, role: str, text: str) -> bool:
        """Appends a message to the interaction_history JSON list."""
        if not self.session_factory: return False
        try:
            with self.session() as session:
                lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                if lead:
                    history = json.loads(lead.interaction_history or "[]")
                    history.append({
                        "role": role,
                        "text": text,
                        "timestamp": datetime.now().isoformat()
                    })
                    lead.interaction_history = json.dumps(history)
                    session.commit()
                    return True
                return False
        except Exception as e:
            print(f"Append Interaction Error: {e}")
            return False

    def update_recording_url(self, lead_id: int, url: str) -> bool:
        if not self.session_factory: return False
        try:
            with self.session() as session:
                lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
                if lead:
                    lead.vapi_recording_url = url
                    session.commit()
                    return True
                return False
        except Exception as e:
            print(f"Update Recording Error: {e}")
            return False
        return None

    def add_ad(self, ad_data: Dict, tenant_id: str = "filcan"):
        with self.session() as session:
            new_ad = AdTable(
                tenant_id=tenant_id,
                content=ad_data.get("content"),
                platform=ad_data.get("platform"),
                status=ad_data.get("status", "Pending")
            )
            session.add(new_ad)
            session.commit()

    def get_ads(self) -> List[Dict]:
        fallback_ads = [{"id": 0, "content": "Special offer on Toyota RAV4! (Local Backup Active)", "platform": "Facebook", "status": "Pending", "tenant_id": "filcan"}]
        
        if not self.session_factory:
            return fallback_ads
            
        try:
            with self.session() as session:
                ads = session.query(AdTable).all()
                return [{"id": a.id, "content": a.content, "platform": a.platform, "status": a.status, "tenant_id": a.tenant_id} for a in ads]
        except Exception as e:
            print(f"Database Fetch Error (get_ads): {e}")
            return fallback_ads

    def update_agent_settings(self, agent_id: int, settings: Dict) -> bool:
        if not self.session_factory: return False
        try:
            with self.session() as session:
                agent = session.query(AgentTable).filter(AgentTable.id == agent_id).first()
                if agent:
                    if "fb_access_token" in settings:
                        agent.fb_access_token = settings["fb_access_token"]
                    if "fb_page_id" in settings:
                        agent.fb_page_id = settings["fb_page_id"]
                    if "fb_settings_json" in settings:
                        agent.fb_settings_json = json.dumps(settings["fb_settings_json"])
                    session.commit()
                    return True
                return False
        except Exception as e:
            print(f"DB Update Error (update_agent_settings): {e}")
            return False

    def get_agent_settings(self, agent_id: int) -> Dict:
        if not self.session_factory: return {}
        try:
            with self.session() as session:
                agent = session.query(AgentTable).filter(AgentTable.id == agent_id).first()
                if agent:
                    return {
                        "fb_access_token": agent.fb_access_token,
                        "fb_page_id": agent.fb_page_id,
                        "fb_settings_json": json.loads(agent.fb_settings_json) if agent.fb_settings_json else {}
                    }
                return {}
        except Exception as e:
            print(f"DB Fetch Error (get_agent_settings): {e}")
            return {}

    def get_appointments(self, tenant_id: str = "filcan") -> List[Dict]:
        if not self.session_factory: return []
        try:
            with self.session() as session:
                appts = session.query(AppointmentTable).filter(AppointmentTable.tenant_id == tenant_id).all()
                return [{
                    "id": a.id,
                    "lead_id": a.lead_id,
                    "time": a.time,
                    "status": a.status,
                    "notes": a.notes
                } for a in appts]
        except Exception as e:
            print(f"DB Fetch Error (get_appointments): {e}")
            return []

    def create_appointment(self, appt_data: Dict, tenant_id: str = "filcan") -> bool:
        if not self.session_factory: return False
        try:
            with self.session() as session:
                new_appt = AppointmentTable(
                    tenant_id=tenant_id,
                    lead_id=appt_data.get("lead_id"),
                    time=appt_data.get("time"),
                    notes=appt_data.get("notes"),
                    status=appt_data.get("status", "CONFIRMED")
                )
                session.add(new_appt)
                session.commit()
                return True
        except Exception as e:
            print(f"DB Create Error (create_appointment): {e}")
            return False

    def get_agents(self, tenant_id: str = "filcan") -> List[Dict]:
        if not self.session_factory: return []
        try:
            with self.session() as session:
                agents = session.query(AgentTable).filter(AgentTable.tenant_id == tenant_id).all()
                return [{
                    "id": a.id,
                    "name": a.name,
                    "role": a.role,
                    "avatar": a.avatar,
                    "edition": a.edition
                } for a in agents]
        except Exception as e:
            print(f"DB Fetch Error (get_agents): {e}")
            return []

# Singleton instance
db = Storage()
