import json

def get_inventory():
    try:
        with open("backend/mock_inventory.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def qualify_lead(message, context):
    """
    Role-based 9-step Sales Process State Machine.
    Roles: Receptionist (0-2), Sales Agent (3-7), Lead Hunter (8-9)
    """
    msg = message.lower()
    new_context = context or {"stage": "receptionist_greet", "role": "Receptionist"}
    stage = new_context.get("stage")
    
    # 9-Step logic based on FilCan PDF
    if stage == "receptionist_greet":
        resp = "👋 Welcome to FilCan Cars! I'm your digital receptionist. I'd love to help you find the perfect vehicle. What brings you in today—looking for an upgrade, or just browsing?"
        new_context["stage"] = "lifestyle_discovery"
    
    elif stage == "lifestyle_discovery":
        # Role Transitions to Sales Agent
        new_context["role"] = "Sales Agent"
        resp = "That's exciting! 🚗 To help narrow things down: What's your typical drive like? Mostly city commuting, or do you do a lot of weekend highway trips?"
        new_context["stage"] = "must_haves"
    
    elif stage == "must_haves":
        resp = "Understood. Efficiency vs Power is key. Are there any 'must-have' features for your next ride? (AWD, Heated Seats, Android Auto/CarPlay, etc.)"
        new_context["stage"] = "current_car"
    
    elif stage == "current_car":
        resp = "Great choices. And what are you driving now? Is there anything you absolute HATE about your current car that we MUST avoid in the next one?"
        new_context["stage"] = "trade_in"
    
    elif stage == "trade_in":
        resp = "That helps a lot. Are you planning to trade that vehicle in? We're currently offering top-dollar appraisals for our Sherwood Park inventory."
        new_context["stage"] = "finance_stakeholders"
    
    elif stage == "finance_stakeholders":
        resp = "Perfect. Last couple of things: Besides yourself, is there anyone else who needs to see the car before you decide? And how would you prefer to handle the paperwork—financing or outright?"
        new_context["stage"] = "closing_hunter"
    
    elif stage == "closing_hunter":
        new_context["role"] = "Lead Hunter"
        resp = "I have 3 matches currently in stock (and 2 coming in next week!) that fit you perfectly. Would you like me to send the details to your phone so you can book a VIP test drive?"
        new_context["stage"] = "completed"
    
    else:
        resp = "I'm here to help! Would you like to check our latest inventory or get a trade-in value?"
        new_context["stage"] = "receptionist_greet"

    return resp, new_context

def generate_ad_copy(prompt="FilCan Cars Special"):
    return f"🔥 FLASH SALE at FilCan Cars Sherwood Park! 🔥\n\nLooking for a reliable ride? We've got fresh inventory arriving daily at 983 Fir Street.\n\n✅ $0 Down Options\n✅ All Credit Levels Approved\n✅ Top Dollar for Trade-ins\n\nDM us today to book a test drive! #FilCanCars #SherwoodParkCars"

def get_simulated_quality_leads():
    """
    Simulates the 'AI Hunter' finding high-intent leads.
    """
    return [
        {"name": "Leo Valdez", "intent": "High", "score": 98, "summary": "Ready to buy 2021 F-150, has trade-in."},
        {"name": "Piper McLean", "intent": "Medium", "score": 85, "summary": "Comparing SUVs, budget $500/mo."},
        {"name": "Jason Grace", "intent": "High", "score": 92, "summary": "Need quick approval for work truck."}
    ]
