from fastapi import FastAPI 
from routers import dcf, sensitivity
from fastapi.middleware.cors import CORSMiddleware
from routers import upload  # assuming inside routers/upload.py



app = FastAPI() 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.thinkinvestval.com",   # ✅ Production
        "https://thinkinvestval.com"        # ✅ Without www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

@app.get("/") 
def read_root(): 
    return {"message": "Backend is working!"} 

app.include_router(upload.router, prefix="/api")    
app.include_router(dcf.router)
app.include_router(sensitivity.router)
