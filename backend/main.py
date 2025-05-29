from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.transactions import router as transactions_router
from app.core.database import db_health_check
import asyncio
from alembic.config import Config
from alembic import command
import os


async def run_alembic_upgrade():
    def _upgrade():
        try:
            alembic_cfg = Config(
                os.path.join(os.path.dirname(__file__), "alembic.ini")
            )
            command.upgrade(alembic_cfg, "head")
            print("Alembic migrations applied successfully.")
        except Exception as e:
            print(f"Alembic migration failed: {e}")
            raise

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upgrade)


async def lifespan(app: FastAPI):
    await run_alembic_upgrade()
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
