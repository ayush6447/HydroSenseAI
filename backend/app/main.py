from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, sensor, predict, actuator
from app.routes import orchestrator
from app.database import engine, Base
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import sys

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hydroponic AI Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/api/auth",         tags=["auth"])
app.include_router(sensor.router,       prefix="/api/sensor",       tags=["sensor"])
app.include_router(predict.router,      prefix="/api/predict",      tags=["predict"])
app.include_router(actuator.router,     prefix="/api/actuator",     tags=["actuator"])
app.include_router(orchestrator.router, prefix="/api/orchestrate",  tags=["orchestrate"])

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    print("--- 422 VALIDATION ERROR ---", file=sys.stderr)
    print(exc.errors(), file=sys.stderr)
    print("--- ------------------- ---", file=sys.stderr)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.get("/health")
def health():
    return {"status": "ok"}
