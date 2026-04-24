from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle — startup and shutdown."""
    logger.info("Dravya Labs Skin AI starting up...")
    yield
    logger.info("Dravya Labs Skin AI shutting down.")


app = FastAPI(
    title="Dravya Labs Skin AI",
    description="Skin disease detection API powered by EfficientNet-B0.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "message": "Dravya Labs Skin AI is running.",
        "docs": "/docs",
        "predict": "POST /predict (upload image)",
        "health": "GET /health",
    }


if __name__ == "__main__":
    import uvicorn
    import os

    PORT = int(os.getenv("PORT", 8006))
    uvicorn.run(app, host="0.0.0.0", port=PORT)
