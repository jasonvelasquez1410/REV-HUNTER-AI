import urllib.request
import json
import base64
import os

def test_groq():
    fb_key = base64.b64decode("Z3NrX1FFejI2bVFLZ21RSjM5OThidEM5V0dyeW9mWXF5TTE3N0hXckwxdG11TDBFM1JrRXdaSg==").decode()
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {fb_key}",
        "Content-Type": "application/json",
        "User-Agent": "RevHunterAI/12.5",
        "Accept": "application/json"
    }
    
    models = ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"]
    
    for model in models:
        print(f"Testing model: {model}")
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Hello, return ONLY the word SUCCESS."}],
            "temperature": 0.5
        }
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                print(f"Success with {model}: {res_data['choices'][0]['message']['content'][:50]}...")
                return
        except Exception as e:
            print(f"Failed with {model}: {e}")

if __name__ == "__main__":
    test_groq()
