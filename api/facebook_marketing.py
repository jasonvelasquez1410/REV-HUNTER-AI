import requests
import json
import os
from typing import Dict, Optional

def post_to_facebook_marketplace(
    access_token: str, 
    page_id: str, 
    message: str, 
    image_url: Optional[str] = None
) -> Dict:
    """
    Simulates or executes a post to Facebook.
    Note: Direct Marketplace posting via API is restricted. 
    This implementation posts to the Page Feed as a primary marketing action.
    """
    if not access_token or not page_id:
        return {"status": "error", "message": "Missing Facebook credentials (Token or Page ID)"}

    # Facebook Graph API Endpoint for Page Feed
    url = f"https://graph.facebook.com/v19.0/{page_id}/feed"
    
    payload = {
        "message": message,
        "access_token": access_token
    }
    
    if image_url:
        # If it's a photo post, use the /photos endpoint instead
        url = f"https://graph.facebook.com/v19.0/{page_id}/photos"
        payload["url"] = image_url
        payload["caption"] = message

    try:
        # For Demo/Testing: If token starts with 'mock_', simulate success
        if access_token.startswith("mock_"):
            return {
                "status": "success", 
                "id": "mock_post_12345", 
                "message": "SIMULATED: Post sent to Facebook Page Feed successfully."
            }

        response = requests.post(url, data=payload, timeout=10)
        res_data = response.json()
        
        if response.status_code == 200:
            return {
                "status": "success", 
                "id": res_data.get("id"), 
                "message": "Post published to Facebook successfully!"
            }
        else:
            error_msg = res_data.get("error", {}).get("message", "Unknown Facebook API Error")
            return {"status": "error", "message": f"Facebook Error: {error_msg}"}

    except Exception as e:
        return {"status": "error", "message": f"Connection Error: {str(e)}"}

def generate_marketplace_payload(car: Dict, tenant_name: str) -> str:
    """
    Generates a structured message for Facebook Marketplace.
    """
    return (
        f"🔥 JUST IN: {car['year']} {car['make']} {car['model']}\n\n"
        f"💰 Price: ${car['price']:,}\n"
        f"📍 Location: {tenant_name}\n"
        f"🛣️ Mileage: {car['mileage']:,} km\n\n"
        f"{car['description']}\n\n"
        "✅ All Credit Levels Approved\n"
        "✅ Trade-ins Welcome\n"
        "✅ Inspection Report Available\n\n"
        "DM me for a test drive! #CarSales #Inventory #RevHunter"
    )
