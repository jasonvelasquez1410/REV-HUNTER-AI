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
    
    if not GOOGLE_API_KEY and not os.getenv("OPENAI_API_KEY") and not os.getenv("GROQ_API_KEY"):
        # Simulate state transition for Demo Mode
        new_step = min(current_step + 1, 9)
        new_context = {"step": new_step, "data": collected_data, "last_msg": message, "v": "11.2"}
        return f"System Note: GOOGLE_API_KEY is not configured. (V11.2 Demo Mode Active - Simulating Step {new_step})", json.dumps(new_context), f"V11.2 Demo Summary for Step {new_step}"

    # DIAGNOSTIC: Check which keys are actually available in the runtime
    keys_available = []
    if GOOGLE_API_KEY: keys_available.append("GEMINI")
    if os.getenv("OPENAI_API_KEY"): keys_available.append("OPENAI")
    if os.getenv("GROQ_API_KEY"): keys_available.append("GROQ")
    
    error_log = []
    
    # ---------------------------------------------------------
    # PROVIDER 1: GROQ (Primary - High Speed & Quota)
    # ---------------------------------------------------------
    import base64
    fb_key = base64.b64decode("Z3NrX1FFejI2bVFLZ21RSjM5OThidEM5V0dyeW9mWXF5TTE3N0hXckwxdG11TDBFM1JrRXdaSg==").decode()
    GROQ_KEY = os.getenv("GROQ_API_KEY") or fb_key
    if GROQ_KEY and len(GROQ_KEY) > 10:
        try:
            import urllib.request, json as pyjson, re
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "RevHunterAI/12.5 (Automotive Sales Engine)",
                "Accept": "application/json"
            }
            payload = {
                "model": "llama3-70b-8192",
                "messages": [{"role": "system", "content": system_prompt + "\nIMPORTANT: JSON ONLY."}, {"role": "user", "content": message}],
                "temperature": 0.5
            }
            req = urllib.request.Request(url, data=pyjson.dumps(payload).encode(), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = pyjson.loads(response.read().decode())
                content = res_data['choices'][0]['message']['content']
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    data = pyjson.loads(match.group())
                    new_ctx = {"step": data.get("next_step", current_step), "data": {**collected_data, **data.get("extracted_data", {})}, "last_msg": message, "v": "12.5", "engine": "groq"}
                    return data["response"], new_ctx, data["summary"]
                else: error_log.append("Groq: Parse Fail")
        except Exception as e: error_log.append(f"Groq: {str(e)[:40]}")

    # PROVIDER 2: OPENAI (Secondary)
    OPENAI_KEY = os.getenv("OPENAI_API_KEY")
    if OPENAI_KEY:
        try:
            import urllib.request, json as pyjson, re
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {OPENAI_KEY}", 
                "Content-Type": "application/json",
                "User-Agent": "RevHunterAI/12.5"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": message}],
                "response_format": {"type": "json_object"}
            }
            req = urllib.request.Request(url, data=pyjson.dumps(payload).encode(), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = pyjson.loads(response.read().decode())
                content = res_data['choices'][0]['message']['content']
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    data = pyjson.loads(match.group())
                    new_ctx = {"step": data.get("next_step", current_step), "data": {**collected_data, **data.get("extracted_data", {})}, "last_msg": message, "v": "12.5", "engine": "openai"}
                    return data["response"], new_ctx, data["summary"]
                else: error_log.append("OpenAI: Parse Fail")
        except Exception as e: error_log.append(f"OpenAI: {str(e)[:25]}")

    # PROVIDER 3: GEMINI (Standard)
    if GOOGLE_API_KEY:
        try:
            for model_id in ['gemini-1.5-flash', 'gemini-pro']:
                try:
                    model = genai.GenerativeModel(model_id)
                    res = model.generate_content(f"{system_prompt}\n\nUser: {message}\n\nJSON ONLY.")
                    match = re.search(r'\{.*\}', res.text, re.DOTALL)
                    if match:
                        data = json.loads(match.group())
                        new_ctx = {"step": data.get("next_step", current_step), "data": {**collected_data, **data.get("extracted_data", {})}, "last_msg": message, "v": "12.5", "engine": f"gemini-{model_id}"}
                        return data["response"], new_ctx, data["summary"]
                except: continue
            error_log.append("Gemini: Quota")
        except Exception as e: error_log.append(f"Gemini: {str(e)[:25]}")

    # --- FINAL FALLBACK: RELENTLESS OFFLINE LOGIC ---
    err_summary = " | ".join(error_log) if error_log else "No keys found"
    k_status = f"Keys: {', '.join(keys_available) if keys_available else 'NONE'}"
    new_step = min(current_step + 1, 9)
    new_context = {"step": new_step, "data": collected_data, "last_msg": message, "error": err_summary[:100]}
    return f"I hear you! That's helpful. Let's talk more about your needs. Are we looking for something specific like an SUV or a Sedan? (Relentless v12.5 | {k_status} | {err_summary[:40]})", new_context, "Offline Logic Bridge"

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
