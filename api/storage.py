import json
import os
from typing import List, Dict, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Text
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
            # Vercel Serverless: Only /tmp is writable
            print("WARNING: DATABASE_URL not set. Falling back to /tmp/test.db for Vercel safety.")
            db_url = "sqlite:////tmp/test_revhunter.db"
        else:
            # Fix postgres:// to postgresql:// and use pure-python pg8000 for Vercel
            db_url = DATABASE_URL
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
            elif db_url.startswith("postgresql://"):
                db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
            
        try:
            # Supabase requires some pooling adjustments for serverless
            # Vercel Serverless: Reduce pool size and max overflow for stability
            engine = create_engine(
                db_url, 
                pool_size=2, 
                max_overflow=0,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 5}
            )
            SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
            # Create tables if they don't exist
            Base.metadata.create_all(bind=engine)
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Database Initialization Error: {e}")
            # We don't raise here to allow the app to start in 'Degraded' mode
            # Endpoints will handle the lack of engine/SessionLocal gracefully

# SQLAlchemy Models
class TenantTable(Base):
    __tablename__ = "tenants"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    location = Column(String)
    address = Column(String, nullable=True)
    welcome_message = Column(Text)
    theme_color = Column(String)

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
    status = Column(String, default="Pending")
    is_reported = Column(Boolean, default=False)
    is_billed = Column(Boolean, default=False)
    quality_score = Column(Integer, default=0)
    follow_up_streak = Column(Integer, default=0)
    last_action_time = Column(String, default="Just Now")
    is_aged = Column(Boolean, default=False)
    conversation_state = Column(Text, default="{}")  # JSON string of the current qualification state
    conversation_summary = Column(Text, default="New Lead - Discovery Phase")

class AdTable(Base):
    __tablename__ = "ads"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, ForeignKey("tenants.id"), index=True, default="filcan")
    content = Column(Text)
    platform = Column(String)
    status = Column(String, default="Pending")

# Note: metadata.create_all is moved to init_db()

# Default configuration path
TENANTS_FILE = os.path.join(os.path.dirname(__file__), "tenants.json")

class Storage:
    def __init__(self):
        try:
            init_db()
            self.session_factory = SessionLocal
            self._seed_data_if_empty()
        except Exception as e:
            print(f"Storage Initialization Critical Error: {e}")
            self.session_factory = None

    def _seed_data_if_empty(self):
        if not self.session_factory: return
        with self.session_factory() as session:
            # Seed Tenants
            if session.query(TenantTable).count() == 0:
                tenants = [
                    TenantTable(
                        id="filcan",
                        name="FilCan Cars",
                        location="Sherwood Park",
                        address="983 Fir Street",
                        welcome_message="Welcome to FilCan Cars! I'm your digital receptionist. I'd love to help you find the perfect vehicle. What brings you in today—looking for an upgrade, or just browsing?",
                        theme_color="#003366"
                    ),
                    TenantTable(
                        id="demo",
                        name="RevHunter Demo Shop",
                        location="Digital",
                        address="123 AI Avenue",
                        welcome_message="Welcome to the RevHunter AI Demo Shop! We specialize in high-performance automotive sales. What are you looking for today?",
                        theme_color="#D92027"
                    )
                ]
                session.add_all(tenants)
                session.commit()

            # Seed Inventory (Premium FilCan Edition)
            if session.query(CarTable).count() == 0:
                inventory = [
                    CarTable(tenant_id="filcan", make="Volkswagen", model="Atlas EXECLINE", year=2024, price=58900, mileage=12, type="SUV", image="https://images.unsplash.com/photo-1594976612316-401266a4cc44?auto=format&fit=crop&w=800&q=80", description="2024 VW Atlas EXECLINE. AWD, Panoramic Sunroof, Leather. The ultimate family SUV."),
                    CarTable(tenant_id="filcan", make="Mazda", model="CX-5 Signature", year=2023, price=39500, mileage=8400, type="SUV", image="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80", description="Turbo AWD Signature Trim. Soul Red Crystal. Local one-owner vehicle."),
                    CarTable(tenant_id="filcan", make="Ford", model="F-150 Lariat", year=2021, price=48500, mileage=32000, type="Truck", image="https://images.unsplash.com/photo-1591115765373-520b7a21f7cd?auto=format&fit=crop&w=800&q=80", description="Lariat Sport Supercrew. 5.0L V8. Sherword Park driven, immaculate condition."),
                    CarTable(tenant_id="filcan", make="Honda", model="Civic Type R", year=2023, price=52000, mileage=5000, type="Sedan", image="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80", description="Performance hatch in Championship White. Rare find, tracked & verified.")
                ]
                # Also seed for demo
                inventory.extend([
                    CarTable(tenant_id="demo", make="Tesla", model="Model S Plaid", year=2023, price=95000, mileage=500, type="Sedan", image="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80", description="Ludicrous speed, futuristic tech. 0-60 in 1.99s."),
                ])
                session.add_all(inventory)
                session.commit()

            # Seed Leads (Impressive Pitch Edition)
            if session.query(LeadTable).count() == 0:
                leads = [
                    LeadTable(tenant_id="filcan", name="Marvin Raymundo", email="marvin@example.com", phone="587-888-1234", credit_score=750, monthly_budget=800, trade_in_details="2018 Toyota RAV4", status="Hot", is_reported=True, is_billed=True, quality_score=98, follow_up_streak=4, last_action_time="Today 10:45 AM", conversation_summary="Highly interested in VW Atlas. Ready for test drive tomorrow."),
                    LeadTable(tenant_id="filcan", name="Jessica Chen", email="jess@outlook.com", phone="587-555-9000", credit_score=680, monthly_budget=550, trade_in_details="None", status="Qualified", is_reported=True, is_billed=False, quality_score=85, follow_up_streak=2, last_action_time="Today 9:15 AM", conversation_summary="Looking for a reliable SUV. Comparing Atlas and CX-5. Financing approved."),
                    LeadTable(tenant_id="filcan", name="Robert Downey", email="rob@gmail.com", phone="780-123-4567", credit_score=720, monthly_budget=700, trade_in_details="2015 Ford Escape", status="Hot", is_reported=True, is_billed=True, quality_score=94, follow_up_streak=3, last_action_time="Yesterday", conversation_summary="Interested in Mazda CX-5. Asked about trade-in value & winter tires."),
                    LeadTable(tenant_id="filcan", name="Alice Wonderland", email="alice@magic.com", phone="555-9876", credit_score=650, monthly_budget=400, trade_in_details="None", status="Pending", is_reported=False, is_billed=False, quality_score=60, follow_up_streak=1, last_action_time="2h ago", conversation_summary="Discovery Phase: Browsing SUVs for city commute.")
                ]
                session.add_all(leads)
                session.commit()
            
            # Seed Ads
            if session.query(AdTable).count() == 0:
                ads = [
                    AdTable(tenant_id="filcan", content="Special offer on Toyota RAV4!", platform="Facebook", status="Pending"),
                    AdTable(tenant_id="filcan", content="Trade-in your old car for top value.", platform="Instagram", status="Approved")
                ]
                session.add_all(ads)
                session.commit()

    def get_tenant_config(self, tenant_id: str = "filcan") -> Dict:
        # v13.0-FINAL Pitch Resilience: Comprehensive error wrapping to prevent 500 errors
        fallback_config = {
            "id": tenant_id,
            "name": "FilCan Cars" if tenant_id == "filcan" else "Demo Motors",
            "location": "Sherwood Park" if tenant_id == "filcan" else "Digital",
            "address": "983 Fir Street" if tenant_id == "filcan" else "123 AI Avenue",
            "welcome_message": "Welcome to FilCan Cars! (Relentless Mode Active)",
            "theme_color": "#003366"
        }
        
        if not self.session_factory:
            return fallback_config
            
        try:
            with self.session_factory() as session:
                tenant = session.query(TenantTable).filter(TenantTable.id == tenant_id).first()
                if tenant:
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
        fallback_inventory = [
            {"id": 1, "make": "Volkswagen", "model": "Atlas EXECLINE", "year": 2024, "price": 58900, "mileage": 12, "type": "SUV", "image": "", "description": "Local Backup Inventory - Premium Edition"}
        ]
        
        if not self.session_factory:
            return fallback_inventory
            
        try:
            with self.session_factory() as session:
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
            PydanticLead(id=1, name="Marvin Raymundo", email="marvin@example.com", phone="587-888-1234", status="Hot", quality_score=98, conversation_summary="Highly interested in VW Atlas. (Local Backup Active)"),
            PydanticLead(id=2, name="Jessica Chen", email="jess@outlook.com", phone="587-555-9000", status="Qualified", quality_score=85, conversation_summary="Looking for a reliable SUV. (Local Backup Active)")
        ]
        
        if not self.session_factory:
            return fallback_leads
            
        try:
            with self.session_factory() as session:
                leads = session.query(LeadTable).filter(LeadTable.tenant_id == tenant_id).all()
                return [PydanticLead(**l.__dict__) for l in leads]
        except Exception as e:
            print(f"Database Fetch Error (get_leads): {e}")
            return fallback_leads

    def report_lead(self, lead_id: int) -> bool:
        with self.session_factory() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_reported = True
                session.commit()
                return True
            return False

    def charge_lead(self, lead_id: int) -> bool:
        with self.session_factory() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_billed = True
                session.commit()
                return True
            return False

    def reactivate_lead(self, lead_id: int) -> bool:
        if not self.session_factory: return False
        with self.session_factory() as session:
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
            with self.session_factory() as session:
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
            with self.session_factory() as session:
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
                with self.session_factory() as session:
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
        with self.session_factory() as session:
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
            return lead

    def add_ad(self, ad_data: Dict, tenant_id: str = "filcan"):
        with self.session_factory() as session:
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
            with self.session_factory() as session:
                ads = session.query(AdTable).all()
                return [{"id": a.id, "content": a.content, "platform": a.platform, "status": a.status, "tenant_id": a.tenant_id} for a in ads]
        except Exception as e:
            print(f"Database Fetch Error (get_ads): {e}")
            return fallback_ads

# Singleton instance
db = Storage()
