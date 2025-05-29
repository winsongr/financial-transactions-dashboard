from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.transactions import router as transactions_router
from app.core.database import db_health_check

async def lifespan(app: FastAPI):
    healthy = await db_health_check()
    if not healthy:
        print("Database connection failed at startup.")
        raise RuntimeError("Database is unreachable at startup.")
    print("Database connection OK at startup.")
    yield

app = FastAPI(lifespan=lifespan)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"ping": datetime.now()}

app.include_router(transactions_router, prefix="/api")

