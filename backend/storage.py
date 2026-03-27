import json
import os
from typing import List, Dict, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from models import Lead as PydanticLead, Car, AdApproval

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
            print("WARNING: DATABASE_URL not set. Falling back to in-memory for safety.")
            db_url = "sqlite:///./test.db"
        else:
            db_url = DATABASE_URL
            
        try:
            # Supabase requires some pooling adjustments for serverless
            engine = create_engine(
                db_url, 
                pool_size=5, 
                max_overflow=10,
                pool_pre_ping=True
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
        init_db()
        self.session_factory = SessionLocal
        try:
            self._seed_data_if_empty()
        except Exception as e:
            print(f"Seeding Error: {e}")

    def _seed_data_if_empty(self):
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

            # Seed Inventory
            if session.query(CarTable).count() == 0:
                inventory = [
                    CarTable(tenant_id="filcan", make="Volkswagen", model="Atlas", year=2024, price=54900, mileage=15, type="SUV", image="https://images.unsplash.com/photo-1594976612316-401266a4cc44?auto=format&fit=crop&w=400&q=80", description="2024 VW Atlas EXECLINE. Loaded with AWD, Panoramic Sunroof, and Leather."),
                    CarTable(tenant_id="filcan", make="Mazda", model="CX-5", year=2023, price=38500, mileage=12400, type="SUV", image="https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=400&q=80", description="Turbo AWD signature trim. Soul Red Crystal Metallic. One owner, local."),
                    CarTable(tenant_id="filcan", make="Ford", model="F-150", year=2021, price=46000, mileage=45000, type="Truck", image="https://images.unsplash.com/photo-1591115765373-520b7a21f7cd?auto=format&fit=crop&w=400&q=80", description="Lariat Sport Supercrew. 5.0L V8. Clean Carfax, Sherword Park driven.")
                ]
                # Also seed for demo
                inventory.extend([
                    CarTable(tenant_id="demo", make="Tesla", model="Model S", year=2023, price=89000, mileage=1000, type="Sedan", image="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80", description="2023 Tesla Model S Plaid. Ludicrous speed and futuristic tech."),
                ])
                session.add_all(inventory)
                session.commit()

            # Seed Leads
            if session.query(LeadTable).count() == 0:
                leads = [
                    LeadTable(tenant_id="filcan", name="John Doe", email="john@example.com", phone="555-0199", credit_score=720, monthly_budget=500, trade_in_details="2015 Honda Civic", status="Qualified", is_reported=True, is_billed=False, quality_score=95, follow_up_streak=15, last_action_time="Saturday 9:00 PM"),
                    LeadTable(tenant_id="filcan", name="Sarah Smith", email="sarah@gmail.com", phone="555-0123", credit_score=650, monthly_budget=400, trade_in_details="None", status="Pending", is_reported=False, is_billed=False, quality_score=60, follow_up_streak=5, last_action_time="Friday 2:00 PM"),
                    LeadTable(tenant_id="filcan", name="Mike Johnson", email="mike@icloud.com", phone="555-9876", credit_score=680, monthly_budget=600, trade_in_details="2018 Ford Escape", status="Hot", is_reported=True, is_billed=True, quality_score=98, follow_up_streak=45, last_action_time="Thursday 10:00 AM")
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
        if not self.session_factory:
            # Revert to hardcoded/local logic if DB is down
            return {
                "id": tenant_id,
                "name": "FilCan Cars" if tenant_id == "filcan" else "Demo Motors",
                "location": "Sherwood Park" if tenant_id == "filcan" else "Digital",
                "address": "983 Fir Street" if tenant_id == "filcan" else "123 AI Avenue",
                "welcome_message": "Welcome to FilCan Cars! (Local Backup Active)",
                "theme_color": "#003366"
            }
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
            return {"name": "RevHunter AI", "location": "Global", "theme_color": "#003366"}

    def get_inventory(self, tenant_id: str = "filcan") -> List[Dict]:
        if not self.session_factory:
            return [
                {"id": 1, "make": "Volkswagen", "model": "Atlas", "year": 2024, "price": 54900, "mileage": 15, "type": "SUV", "image": "", "description": "Local Backup Inventory"}
            ]
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

    def get_leads(self, tenant_id: str = "filcan") -> List[PydanticLead]:
        if not self.session_factory:
            return [PydanticLead(name="Local Lead", email="local@backup.com", phone="555-0000", status="Hot")]
        with self.session_factory() as session:
            leads = session.query(LeadTable).filter(LeadTable.tenant_id == tenant_id).all()
            return [PydanticLead(**l.__dict__) for l in leads]

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
        with self.session_factory() as session:
            lead = session.query(LeadTable).filter(LeadTable.id == lead_id).first()
            if lead:
                lead.is_aged = False
                lead.last_action_time = "Just Now"
                lead.follow_up_streak = 1
                session.commit()
                return True
            return False

    def update_lead_state(self, lead_id: int, state: Dict, summary: str) -> bool:
        if not self.session_factory: return False
        
        # V11.2: Added basic retry logic for DB resilience
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
        if not self.session_factory:
            return [{"id": 0, "content": "Ad system is currently offline (DB Connection Issue)", "platform": "N/A", "status": "Error", "tenant_id": "all"}]
        with self.session_factory() as session:
            ads = session.query(AdTable).all()
            return [{"id": a.id, "content": a.content, "platform": a.platform, "status": a.status, "tenant_id": a.tenant_id} for a in ads]

# Singleton instance
db = Storage()
