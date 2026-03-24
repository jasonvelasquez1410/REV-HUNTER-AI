import json
import os
from typing import List, Dict, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from models import Lead as PydanticLead, Car, AdApproval

# Database Setup
# Use environment variable for production, fallback to user's URI for now
DEFAULT_DB_URL = "postgresql://postgres:FOwELeUtVHXxm1Gm@db.llvucxbbvsfzkkhyqeuv.supabase.co:5432/postgres"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# Supabase requires some pooling adjustments for serverless
engine = create_engine(
    DATABASE_URL, 
    pool_size=10, 
    max_overflow=20,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# SQLAlchemy Models
class LeadTable(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, default="filcan")
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

class AdTable(Base):
    __tablename__ = "ads"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, index=True, default="filcan")
    content = Column(Text)
    platform = Column(String)
    status = Column(String, default="Pending")

# Create tables
Base.metadata.create_all(bind=engine)

# Default configuration path
TENANTS_FILE = os.path.join(os.path.dirname(__file__), "tenants.json")

class Storage:
    def __init__(self):
        self.session_factory = SessionLocal
        self._seed_data_if_empty()

    def _seed_data_if_empty(self):
        with self.session_factory() as session:
            if session.query(LeadTable).count() == 0:
                leads = [
                    LeadTable(name="John Doe", email="john@example.com", phone="555-0199", credit_score=720, monthly_budget=500, trade_in_details="2015 Honda Civic", status="Qualified", is_reported=True, is_billed=False, quality_score=95, follow_up_streak=15, last_action_time="Saturday 9:00 PM"),
                    LeadTable(name="Sarah Smith", email="sarah@gmail.com", phone="555-0123", credit_score=650, monthly_budget=400, trade_in_details="None", status="Pending", is_reported=False, is_billed=False, quality_score=60, follow_up_streak=5, last_action_time="Friday 2:00 PM"),
                    LeadTable(name="Mike Johnson", email="mike@icloud.com", phone="555-9876", credit_score=680, monthly_budget=600, trade_in_details="2018 Ford Escape", status="Hot", is_reported=True, is_billed=True, quality_score=98, follow_up_streak=45, last_action_time="Thursday 10:00 AM")
                ]
                session.add_all(leads)
                session.commit()
            
            if session.query(AdTable).count() == 0:
                ads = [
                    AdTable(content="Special offer on Toyota RAV4!", platform="Facebook", status="Pending"),
                    AdTable(content="Trade-in your old car for top value.", platform="Instagram", status="Approved")
                ]
                session.add_all(ads)
                session.commit()

    def get_tenant_config(self, tenant_id: str = "filcan") -> Dict:
        try:
            with open(TENANTS_FILE, "r") as f:
                configs = json.load(f)
                return configs.get(tenant_id, configs.get("filcan"))
        except (FileNotFoundError, json.JSONDecodeError):
            return {"name": "RevHunter AI", "location": "Global", "theme_color": "#003366"}

    def get_inventory(self, tenant_id: str = "filcan") -> List[Dict]:
        tenant = self.get_tenant_config(tenant_id)
        inventory_file = tenant.get("inventory_file", "mock_inventory.json")
        inventory_path = os.path.join(os.path.dirname(__file__), inventory_file)
        try:
            with open(inventory_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def get_leads(self, tenant_id: str = "filcan") -> List[PydanticLead]:
        with self.session_factory() as session:
            leads = session.query(LeadTable).filter(LeadTable.tenant_id == tenant_id).all()
            return [PydanticLead(**l.__dict__) for l in leads]

    def report_lead(self, lead_id: int) -> bool:
        with self.session_factory() as session:
            lead = session.query(LeadTable).get(lead_id)
            if lead:
                lead.is_reported = True
                session.commit()
                return True
            return False

    def charge_lead(self, lead_id: int) -> bool:
        with self.session_factory() as session:
            lead = session.query(LeadTable).get(lead_id)
            if lead:
                lead.is_billed = True
                session.commit()
                return True
            return False

    def reactivate_lead(self, lead_id: int) -> bool:
        with self.session_factory() as session:
            lead = session.query(LeadTable).get(lead_id)
            if lead:
                lead.is_aged = False
                lead.last_action_time = "Just Now"
                lead.follow_up_streak = 1
                session.commit()
                return True
            return False

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
        with self.session_factory() as session:
            ads = session.query(AdTable).all()
            return [{"id": a.id, "content": a.content, "platform": a.platform, "status": a.status} for a in ads]

# Singleton instance
db = Storage()
