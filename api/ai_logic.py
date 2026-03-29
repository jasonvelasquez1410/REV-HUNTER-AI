import os
import google.generativeai as genai
from .storage import db

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if GOOGLE_API_KEY:
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
    except Exception as e:
        print(f"Gemini Config Error: {e}")

def get_tenant_config(tenant_id="filcan"):
    return db.get_tenant_config(tenant_id)

def get_inventory(tenant_id="filcan"):
    return db.get_inventory(tenant_id)

def qualify_lead(message, context_str, tenant_id="filcan"):
    """
    Stateful AI Lead Qualification using Gemini 1.5 Flash.
    Enforces the 'Relentless 9-Step Sales Process' with persistence.
    """
    tenant = get_tenant_config(tenant_id)
    inventory = get_inventory(tenant_id)
    
    # Parse existing state if it's a string (from DB)
    import json
    try:
        context = json.loads(context_str) if isinstance(context_str, str) else (context_str or {})
    except:
        context = {}

    # Format inventory for the prompt
    inventory_str = "\n".join([f"- {c['year']} {c['make']} {c['model']} (${c['price']})" for c in inventory])
    
    current_step = context.get("step", 1)
    collected_data = context.get("data", {})

    system_prompt = f"""
    You are 'Elliot' (Digital Sales Specialist) for {tenant['name']}. 
    You are a RELENTLESS and PROFESSIONAL AI designed to lead customers through the 9-Step Sales Process.
    
    NATURAL CONVERSATION: DO NOT mention step numbers or step names (e.g., Do NOT say 'Step 1' or 'Discovery Phase'). Be smooth and human-like while ensuring you follow the methodology.
    
    POLYGLOT MODE: You must detect the customer's language (English, Tagalog, Spanish, etc.) and respond perfectly in the EXACT same language (including Tagalog/Bisaya). Respond formatted for the channel (conversational for voice, concise for chat).
    
    Inventory:
    {inventory_str}
    
    The 9-Step Relentless Process (FOLLOW INTERNALLY, DO NOT ANNOUNCE):
    1. Greeting (Warm & Professional)
    2. Discovery (What car are they looking for?)
    3. Lifestyle (How will they use the car? Daily commute, family, etc.)
    4. Must-Haves (Features like AWD, Sunroof, etc.)
    5. Current Car (What are they driving now?)
    6. Trade-in (Do they have a vehicle to trade in?)
    7. Finance & Credit (Extract Budget AND ask for SOFT CREDIT PRE-QUAL if step 6 is clear)
    8. Show Inventory (Explicitly match their needs and credit potential to the inventory list above)
    9. Closing (Book the physical test drive at {tenant['location']})
    
    OMNICHANNEL DNA: You have full memory of this lead across Facebook, Voice Call, and Web. If the context shows a history, reference it to build trust.
    
    Current Progress: Step {current_step}/9
    What we know so far: {json.dumps(collected_data)}
    
    Rules:
    - BE RELENTLESS: If the user avoids a question, politely but firmly bring them back to the 9-step process.
    - BE HELPFUL: If they ask for pricing or specs, provide it immediately from the inventory list.
    - If user is ready to move faster, skip steps as appropriate. 
    - Keep responses professional but NOT robotic. 
    
    Return your response ONLY in this JSON format:
    {{
        "response": "Your message to the user",
        "next_step": 1-9,
        "extracted_data": {{ "key": "value" }},
        "summary": "1-sentence summary of lead status"
    }}
    """
    
    if not GOOGLE_API_KEY:
        # Simulate state transition for Demo Mode
        new_step = min(current_step + 1, 9)
        new_context = {"step": new_step, "data": collected_data, "last_msg": message, "v": "11.2"}
        return f"System Note: GOOGLE_API_KEY is not configured. (V11.2 Demo Mode Active - Simulating Step {new_step})", json.dumps(new_context), f"V11.2 Demo Summary for Step {new_step}"

    try:
        # ATTEMPT MULTI-MODEL FALLBACK (Fixes 404 Model Not Found)
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro']
        model = None
        last_err = ""
        
        for model_id in models_to_try:
            try:
                model = genai.GenerativeModel(model_id)
                # Test with a very small prompt to see if it exists
                prompt = f"{system_prompt}\n\nUser Message: {message}\n\nIMPORTANT: Return ONLY valid JSON."
                response = model.generate_content(prompt)
                res_text = response.text.strip()
                break # Success!
            except Exception as e:
                last_err = str(e)
                continue
        
        if not model or not res_text:
            raise ValueError(f"All models failed: {last_err}")
            
        # Robust JSON Extraction using Regex
        import re
        match = re.search(r'\{.*\}', res_text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group())
            except:
                # If nested JSON fails, try a simpler parse or look for the last pair
                raise ValueError("JSON matching failed")
        else:
            raise ValueError("No JSON found in response")
        
        # Update context
        new_data = {**collected_data, **data.get("extracted_data", {})}
        new_context = {
            "step": data.get("next_step", current_step),
            "data": new_data,
            "last_msg": message,
            "v": "11.2"
        }
        
        return data["response"], new_context, data["summary"]
        
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini Error in Qualify: {error_msg}")
        # SMART FALLBACK: Increment step and acknowledge input to avoid repetition
        new_step = min(current_step + 1, 9)
        new_context = {"step": new_step, "data": collected_data, "last_msg": message, "error": error_msg[:100]}
        return f"I hear you! That's helpful. Let's talk more about your needs. Are we looking for something specific like an SUV or a Sedan? (Relentless Engine Active)", new_context, "Auto-Advanced Summary"

def generate_ad_copy(tenant_id: str = "filcan", context: str = "tactical") -> str:
    """
    Generates high-converting marketing copy using Gemini 1.5 Flash.
    """
    tenant = db.get_tenant_config(tenant_id)
    inventory = db.get_inventory(tenant_id)
    inventory_str = "\n".join([f"- {c['year']} {c['make']} {c['model']}" for c in inventory[:3]])
    
    contexts = {
        "tactical": f"Focus on moving inventory fast. Mention these cars: {inventory_str}",
        "strategic": f"Focus on {tenant['name']}'s reputation in {tenant['location']}, financing options, and trade-in value.",
        "seasonal": "Focus on seasonal offers (e.g., Spring Clearance, Winter Ready AWDs)."
    }
    
    selected_context = contexts.get(context, contexts["tactical"])
    
    prompt = f"""
    You are the AI Marketing Manager for {tenant['name']} for their car dealership in {tenant['location']}.
    Write a high-converting Facebook/Instagram ad copy for the following strategy: {selected_context}.
    
    Guidelines:
    - Include attention-grabbing emojis.
    - Mention that {tenant['name']} is located at {tenant.get('address', tenant['location'])}.
    - Include a clear Call to Action (e.g., 'DM us for a test drive').
    - Include hashtags like #{tenant['name'].replace(' ', '')} #{tenant['location'].replace(' ', '')}Cars.
    - Return ONLY the ad copy text.
    """
    
    if not GOOGLE_API_KEY:
        return f"🔥 FLASH SALE at {tenant['name']}! Looking for a reliable ride? ✅ $0 Down Options ✅ All Credit Levels Approved. DM us today! #RevHunterAI"

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Ad Generation Error: {e}")
        return f"Check out the latest deals at {tenant['name']}! #{tenant['name'].replace(' ', '')}"

def generate_ad_image_prompt(ad_copy: str) -> str:
    """
    Generates a visual prompt for image generation based on the ad copy.
    """
    prompt = f"Based on this ad copy, generate a short, descriptive 1-line prompt for an AI image generator (like DALL-E) to create a premium-looking automotive marketing image: '{ad_copy}'"
    
    if not GOOGLE_API_KEY:
        return "A premium car dealership lot with new SUVs under a bright sky."

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "Luxury car on a modern showroom floor."

def get_simulated_quality_leads():
    """
    Simulates the 'AI Hunter' finding high-intent leads.
    """
    return [
        {"name": "Leo Valdez", "intent": "High", "score": 98, "summary": "Ready to buy 2021 F-150, has trade-in."},
        {"name": "Piper McLean", "intent": "Medium", "score": 85, "summary": "Comparing SUVs, budget $500/mo."},
        {"name": "Jason Grace", "intent": "High", "score": 92, "summary": "Need quick approval for work truck."}
    ]
