from fastapi import FastAPI
app = FastAPI()
@app.get("/api/status")
async def status():
    return {"status": "Minimal Boot Successful"}

@app.get("/api/tenant-config")
async def config():
    return {"name": "Diagnostic Mode", "theme_color": "#003366"}
