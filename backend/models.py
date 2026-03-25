from pydantic import BaseModel
from typing import List, Optional

class UserMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class Tenant(BaseModel):
    id: str
    name: str
    location: str
    address: Optional[str] = None
    welcome_message: str
    theme_color: str
    inventory_file: Optional[str] = None

class Car(BaseModel):
    id: int
    make: str
    model: str
    year: int
    price: float
    mileage: int
    type: str
    image: str
    description: str

class Lead(BaseModel):
    name: str
    email: str
    phone: str
    credit_score: Optional[int] = None
    monthly_budget: Optional[float] = None
    trade_in_details: Optional[str] = None
    status: str = "Pending"  # "Hot", "Qualified", "Pending"
    is_reported: bool = False
    is_billed: bool = False
    quality_score: int = 0  # 0-100
    follow_up_streak: int = 0  # 0-90 days
    last_action_time: str = "Saturday 9:00 PM"  # Mock for demo
    is_aged: bool = False
    assigned_rep: str = "User/Rjay"

class AdApproval(BaseModel):
    id: int
    content: str
    platform: str
    status: str  # "Approved", "Pending"
