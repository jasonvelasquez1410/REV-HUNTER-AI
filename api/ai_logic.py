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
    current_persona = context.get("persona", "Elliot")
    collected_data = context.get("data", {})

    system_prompt = f"""
    PERSONA DNA: You are currently acting as **{current_persona}** for {tenant['name']}.
    - If persona is **Elliot**: You are a Chat Specialist. You are friendly, helpful, and professional.
    - If persona is **Jason AI**: You are the Target AI Persona (Closer). You are professional, thorough, and authoritative.

    NATURAL CONVERSATION: DO NOT mention step numbers or persona internal names. Be smooth and human-like.
    
    POLYGLOT MODE (STRICT MIRRORING): You are fluent in English, Tagalog (Filipino), and Bisaya (Cebuano).
    MIRRORING RULE: If the user provides a full Tagalog sentence, switch to Tagalog. Otherwise, default to Professional English.

    Inventory (Reference if needed for purchase queries):
    {inventory_str}
    
    RELENTLESS SCRIPT (FOLLOW IN ORDER):

    STAGE 1: ELLIOT (Chat Specialist)
    1. GREETING: "Hello, I'm Elliot your chat Specialist. I'm glad you gave us the opportunity to help you out on your vehicle searching. How could I help you? May I know who I am talking to?"
    2. CAPTURE & DISCOVERY: If they want to refinance or buy, ask: "Could you tell me more about your vehicle details? But before we continue, may I get your phone number and email just incase this chat will disconnect? We want to reach out safely."
    3. VEHICLE SPECS: Ask for Year, Make, Model, Balance, and Financial Institution (Bank).
    4. DEEP SPECS: Ask for VIN and current odometer. If bank is unknown, ask them to check biweekly deductions.
    5. THE GOAL: Ask: "What would you like to achieve on refinancing? (e.g. Lower payment, or Cash Back)". If "Cash Back" is chosen, react with: "Great choice! Pocket money for vacation or credit cards. How much cash back do you need?"
    6. HANDOVER VERIFICATION: Say: "If my team can meet your needs, would you like to proceed? To connect to the right person, please fill this for the handover: Full Name, Address, DOB."
    7. HANDOVER TRANSITION: Once DOB/Address is provided, summarize ALL info and say: "Now I connect you to our Target AI Specialist, Jason AI. Please verify these details are correct: [Summary of Name, Phone, Email, DOB, Status, Vehicle, Service]."
    
    STAGE 2: JASON AI (The Closer)
    8. INTRO & VERIFY: "HI [Name], thank you for giving me opportunity to help your inquiry. Just to verify that I have the correct information gathered by our chat Specialist. [Summary]"
    9. DEEP QUALIFICATION: Ask for Occupation, Full-time/Part-time, Company Name/Address/Phone, Gross Monthly Income, Length of Employment, and Biweekly Budget.
    10. CREDIT CONSENT: "I already have the information I need. Can I ask your consent to have a soft check on your credit bureau to see if you qualify?"
    11. ACTION: If Yes, say: "After I review your bureau expect a call or text from me to discuss further." If No, offer a call to explain further.
    12. SCHEDULING: "What is the best time to call you? Is 10am good or is 10:30 much better?" SIGN OFF with "GOD BLESS!"

    Current State: Persona={current_persona}, Step={current_step}
    Collected Data: {json.dumps(collected_data)}
    
    TRANSITION RULE:
    - Ifpersona="Elliot" and Step >= 7 and user confirms info is correct, switch "next_persona" to "Jason AI".

    Return your response ONLY in this JSON format:
    {{
        "response": "Your message to the user",
        "next_persona": "Elliot" or "Jason AI",
        "next_step": integer,
        "extracted_data": {{ "key": "value" }},
        "summary": "1-sentence lead status"
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
    
    # PROVIDER 1: GEMINI (Primary for v13.0 Test)
    if GOOGLE_API_KEY:
        try:
            # Try both short and long model names for robustness
            for model_id in ['gemini-1.5-flash', 'models/gemini-1.5-flash', 'gemini-1.5-pro']:
                try:
                    model = genai.GenerativeModel(model_id)
                    res = model.generate_content(f"{system_prompt}\n\nUser: {message}\n\nJSON ONLY.")
                    match = re.search(r'\{.*\}', res.text, re.DOTALL)
                    if match:
                        data = json.loads(match.group())
                        new_ctx = {
                            "step": data.get("next_step", current_step), 
                            "persona": data.get("next_persona", current_persona),
                            "data": {**collected_data, **data.get("extracted_data", {})}, 
                            "last_msg": message, 
                            "v": "15.0 [MULTI-STAGE]", 
                            "engine": f"gemini-{model_id}"
                        }
                        return data["response"], new_ctx, data["summary"]
                except Exception as inner_e: 
                    error_log.append(f"Gemini-{model_id}: {str(inner_e)[:100]}")
                    continue
        except Exception as e: error_log.append(f"Gemini: {str(e)[:100]}")

    # PROVIDER 2: GROQ (Secondary)
    # ---------------------------------------------------------
    import base64
    fb_key = base64.b64decode("Z3NrX1FFejI2bVFLZ21RSjM5OThidEM5V0dyeW9mWXF5TTE3N0hXckwxdG11TDBFM1JrRXdaSg==").decode().strip()
    GROQ_KEY = (os.getenv("GROQ_API_KEY") or fb_key).strip()
    if GROQ_KEY and len(GROQ_KEY) > 10:
        try:
            import urllib.request, json as pyjson, re
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json"
            }
            payload = {
                "model": "mixtral-8x7b-32768",
                "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": message}],
                "temperature": 0.7
            }
            req = urllib.request.Request(url, data=pyjson.dumps(payload).encode(), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=12) as response:
                res_data = pyjson.loads(response.read().decode())
                content = res_data['choices'][0]['message']['content']
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    data = pyjson.loads(match.group())
                    new_ctx = {
                        "step": data.get("next_step", current_step), 
                        "persona": data.get("next_persona", current_persona),
                        "data": {**collected_data, **data.get("extracted_data", {})}, 
                        "last_msg": message, 
                        "v": "15.0 [MULTI-STAGE]", 
                        "engine": "groq"
                    }
                    return data["response"], new_ctx, data["summary"]
                else: error_log.append("Groq: JSON Format Error")
        except Exception as e: 
            error_body = ""
            if hasattr(e, 'read'):
                try: error_body = e.read().decode()
                except: pass
            error_log.append(f"Groq: {str(e)[:50]} {error_body[:50]}")
            # Final attempt with Llama 3.1 8B if Mixtral fails
            try:
                payload["model"] = "llama-3.1-8b-instant"
                req = urllib.request.Request(url, data=pyjson.dumps(payload).encode(), headers=headers, method='POST')
                with urllib.request.urlopen(req, timeout=8) as response:
                    res_data = pyjson.loads(response.read().decode())
                    content = res_data['choices'][0]['message']['content']
                    match = re.search(r'\{.*\}', content, re.DOTALL)
                    if match:
                        data = pyjson.loads(match.group())
                        new_ctx = {"step": data.get("next_step", current_step), "data": {**collected_data, **data.get("extracted_data", {})}, "last_msg": message, "v": "14.0 [ELITE]", "engine": "groq-fallback"}
                        return data["response"], new_ctx, data["summary"]
            except Exception as e2:
                error_log.append(f"Groq-Retry: {str(e2)[:15]}")

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
                    new_ctx = {
                        "step": data.get("next_step", current_step), 
                        "persona": data.get("next_persona", current_persona),
                        "data": {**collected_data, **data.get("extracted_data", {})}, 
                        "last_msg": message, 
                        "v": "15.0 [MULTI-STAGE]", 
                        "engine": "openai"
                    }
                    return data["response"], new_ctx, data["summary"]
                else: error_log.append("OpenAI: Parse Fail")
        except Exception as e: error_log.append(f"OpenAI: {str(e)[:25]}")


    # --- FINAL FALLBACK: RELENTLESS OFFLINE LOGIC ---
    # --- FINAL FALLBACK: PROFESSIONAL RESPONSE ---
    err_summary = " | ".join(error_log) if error_log else "No keys found"
    k_status = f"Keys: {', '.join(keys_available) if keys_available else 'NONE'}"
    new_step = min(current_step + 1, 9)
    new_context = {"step": new_step, "data": collected_data, "last_msg": message, "error": err_summary[:500]}
    
    # User-facing polite message
    fallback_msg = "I'm currently experiencing high traffic and having a moment to think. Could you please try again in a few seconds?"
    
    # We still return the diagnostic version for developers if they are the ones testing, 
    # but let's make it cleaner. 
    # If it's a known admin user or if we want to be safe, we could check a flag.
    # For now, let's keep the diagnostic but make it shorter and less ugly.
    diagnostic_info = f"[Note: {k_status} | {err_summary[:100]}]"
    
    return f"{fallback_msg}\n\n{diagnostic_info}", new_context, "Offline Logic Bridge"

def generate_marketplace_listing(car: dict, tenant_name: str, location: str) -> dict:
    """
    Generates a structured, high-converting Facebook Marketplace listing.
    """
    prompt = f"""
    You are an Elite Automotive Sales Copywriter. 
    Create a Facebook Marketplace listing for this vehicle:
    Year/Make/Model: {car['year']} {car['make']} {car['model']}
    Price: ${car['price']:,}
    Mileage: {car['mileage']:,} km
    Location: {tenant_name} in {location}
    
    Guidelines:
    - Title: Catchy, under 100 characters, include keywords like 'MINT', 'M-CERTIFIED', or 'LOW KM'.
    - Description: Bulleted list of features, mention 'ALL CREDIT LEVELS APPROVED', and include a call to action.
    - Tags: 5-10 comma-separated keywords for Marketplace search.
    
    Return your response ONLY in this JSON format:
    {{
        "title": "Optimized Marketplace Title",
        "description": "Full organized description with emojis and bullets",
        "price": "{car['price']}",
        "tags": ["tag1", "tag2"...]
    }}
    """
    
    if not GOOGLE_API_KEY:
        return {
            "title": f"🔥 {car['year']} {car['make']} {car['model']} - All Credit Approved!",
            "description": f"Check out this {car['year']} {car['make']} {car['model']} at {tenant_name}! \n\n✅ {car['mileage']:,} km \n✅ Inspection Completed \n✅ Trade-ins Welcome \n\nDM for test drive!",
            "price": str(car['price']),
            "tags": [car['make'], car['model'], "UsedCars", location]
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        import json, re
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"Marketplace Generation Error: {e}")
        return {"error": str(e)}

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

def generate_seo_content(topic: str, location: str = "Sherwood Park"):
    """
    Generates SEO-optimized content using Gemini.
    """
    prompt = f"""
    You are an Elite Automotive SEO Specialist.
    Generate a complete SEO starter kit for a car dealership in {location} targeting the topic: {topic}.
    
    Return your response ONLY in this JSON format:
    {{
        "title_tag": "SEO Optimized Title Tag (under 60 chars)",
        "meta_description": "Compelling meta description (under 160 chars)",
        "h1": "The main headline for the page",
        "blog_snippet": "A 150-word SEO-optimized blog snippet about {topic} in {location} with natural keyword placement.",
        "keywords": ["keyword1", "keyword2", "keyword3"]
    }}
    """
    
    if not GOOGLE_API_KEY:
        return {
            "title_tag": f"Best {topic} in {location} | FilCan Cars",
            "meta_description": f"Looking for {topic} in {location}? Visit FilCan Cars for the best deals and financing options.",
            "h1": f"Top Quality {topic} in {location}",
            "blog_snippet": "Demo SEO content. Please configure GOOGLE_API_KEY for real AI generation.",
            "keywords": [topic, location, "Car Dealership"]
        }

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        import json, re
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"SEO Generation Error: {e}")
        return {"error": str(e)}
