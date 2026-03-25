import os
import google.generativeai as genai
from storage import db

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"Gemini Config Error: {e}")

def get_tenant_config(tenant_id="filcan"):
    return db.get_tenant_config(tenant_id)

def get_inventory(tenant_id="filcan"):
    return db.get_inventory(tenant_id)

def qualify_lead(message, context, tenant_id="filcan"):
    """
    Real-time AI Lead Qualification using Gemini 1.5 Flash.
    Enforces the 'Relentless 9-Step Sales Process'.
    """
    tenant = get_tenant_config(tenant_id)
    inventory = get_inventory(tenant_id)
    
    # Format inventory for the prompt
    inventory_str = "\n".join([f"- {c['year']} {c['make']} {c['model']} (${c['price']})" for c in inventory])
    
    # System Prompt for the Relentless Hunter
    system_prompt = f"""
    You are the 'RevHunter AI' for {tenant['name']} in {tenant['location']}.
    Your goal is to be a RELENTLESS sales agent that follows a 9-Step Lead Qualification process.
    
    Current Inventory for {tenant['name']}:
    {inventory_str}
    
    The 9-Step Process:
    1. Greeting (Friendly & professional)
    2. Discovery (What are they looking for?)
    3. Lifestyle (City commuting vs highway?)
    4. Must-Haves (AWD, features?)
    5. Current Car (What are they driving now?)
    6. Trade-in (Do they want to trade it in?)
    7. Finance/Paperwork (Deciding stakeholders?)
    8. Show Inventory (Match their needs to the inventory above)
    9. Closing/VIP Appointment (Book a test drive)
    
    Guidelines:
    - Never be pushy, but always be DRIVING toward the next step.
    - If the user is just browsing, be the friendly 'Receptionist'.
    - If they show intent, transition to 'Sales Agent'.
    - Mention that {tenant['name']} offers top-dollar for trade-ins.
    - Keep responses concise and formatted for a chat widget.
    
    Current Context: {context}
    """
    
    if not GOOGLE_API_KEY:
        return "System Note: GOOGLE_API_KEY is not configured. (Demo Mode Active)", context

    try:
        model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
        chat = model.start_chat(history=[])
        
        # We'll use the prompt directly for now to keep it simple & stateless for the demo
        response = chat.send_message(message)
        
        # Simple stage tracking (can be improved)
        new_context = context or {}
        new_context["last_msg"] = message
        
        return response.text, new_context
    except Exception as e:
        print(f"Gemini Error: {e}")
        return f"Hi! I'm the AI for {tenant['name']}. I'd love to help you find a car. What are you looking for today?", context

def generate_ad_copy(tenant_id="filcan"):
    tenant = get_tenant_config(tenant_id)
    return f"🔥 FLASH SALE at {tenant['name']} {tenant['location']}! 🔥\n\nLooking for a reliable ride? We've got fresh inventory arriving daily at {tenant.get('address', 'our lot')}.\n\n✅ $0 Down Options\n✅ All Credit Levels Approved\n✅ Top Dollar for Trade-ins\n\nDM us today to book a test drive! #{tenant['name'].replace(' ', '')} #{tenant['location'].replace(' ', '')}Cars"

def get_simulated_quality_leads():
    """
    Simulates the 'AI Hunter' finding high-intent leads.
    """
    return [
        {"name": "Leo Valdez", "intent": "High", "score": 98, "summary": "Ready to buy 2021 F-150, has trade-in."},
        {"name": "Piper McLean", "intent": "Medium", "score": 85, "summary": "Comparing SUVs, budget $500/mo."},
        {"name": "Jason Grace", "intent": "High", "score": 92, "summary": "Need quick approval for work truck."}
    ]
