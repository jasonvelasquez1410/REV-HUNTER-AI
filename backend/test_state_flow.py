import os
import json
import requests
import time

# Configuration
API_URL = "http://localhost:8000/api"
TENANT_ID = "filcan"

def test_chat_flow():
    print("--- Starting RevHunter V11 State Flow Test ---")
    
    # 1. First Message (Greeting/Discovery)
    print("\nPhase 1: Greeting")
    msg1 = {"message": "Hi, I'm looking for an SUV.", "context": {}}
    res1 = requests.post(f"{API_URL}/chat", json=msg1, headers={"X-Tenant-Id": TENANT_ID})
    data1 = res1.json()
    print(f"AI: {data1['response']}")
    print(f"State: {data1['context']}")
    print(f"Summary: {data1['summary']}")
    
    # 2. Second Message (Lifestyle/Must-Haves)
    print("\nPhase 2: Lifestyle")
    msg2 = {"message": "I need it for city driving and I really want a sunroof.", "context": json.loads(data1['context'])}
    res2 = requests.post(f"{API_URL}/chat", json=msg2, headers={"X-Tenant-Id": TENANT_ID})
    data2 = res2.json()
    print(f"AI: {data2['response']}")
    print(f"State: {data2['context']}")
    print(f"Summary: {data2['summary']}")
    
    # 3. Check Admin Dashboard Leads (Mocking DB state check via /leads)
    print("\nPhase 3: Verify Persistence (using /leads)")
    # Since the /chat endpoint doesn't automatically save to 'leads' unless it's a webhook or linked to a user,
    # we'll trigger the webhook placeholder to test DB persistence.
    print("Triggering Webhook Simulation...")
    webhook_payload = {
        "entry": [{
            "messaging": [{
                "sender": {"id": "test_user_123"},
                "message": {"text": "I'm interested in the VW Atlas."}
            }]
        }]
    }
    requests.post(f"{API_URL}/webhook", json=webhook_payload)
    
    # Now check /leads to see if "FB User test_user_123" exists with the correct state
    res_leads = requests.get(f"{API_URL}/leads", headers={"X-Tenant-Id": TENANT_ID})
    leads = res_leads.json()
    test_lead = next((l for l in leads if "test_user_123" in l['name']), None)
    
    if test_lead:
        print(f"SUCCESS: Lead found in DB.")
        print(f"Lead Name: {test_lead['name']}")
        print(f"Lead Summary: {test_lead['conversation_summary']}")
        print(f"Lead State: {test_lead['conversation_state']}")
    else:
        print("FAILURE: Lead not found in DB.")

if __name__ == "__main__":
    # Ensure server is running or wait for it
    try:
        test_chat_flow()
    except Exception as e:
        print(f"Error running test: {e}")
        print("Note: Ensure the backend server is running on localhost:8000 before running this test.")
