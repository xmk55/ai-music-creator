"""FastAPI server for AI music generation and remix."""

from __future__ import annotations

import asyncio
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from backend.generator import RemixGenerator, TextMusicGenerator

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "outputs"
UPLOAD_DIR = ROOT / "uploads"
STATIC_DIR = ROOT / "static"

for folder in (OUTPUT_DIR, UPLOAD_DIR, STATIC_DIR):
    folder.mkdir(exist_ok=True)

app = FastAPI(title="AI Music Creator", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

text_generator = TextMusicGenerator()
remix_generator = RemixGenerator()
executor = ThreadPoolExecutor(max_workers=1)

jobs: dict[str, dict] = {}
MAX_UPLOAD_BYTES = 25 * 1024 * 1024


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    duration: float = Field(default=15.0, ge=5.0, le=30.0)
    guidance_scale: float = Field(default=3.0, ge=1.0, le=6.0)
    temperature: float = Field(default=1.0, ge=0.5, le=2.0)


class GenerateResponse(BaseModel):
    job_id: str
    status: str
    job_type: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    job_type: str | None = None
    prompt: str | None = None
    error: str | None = None
    duration_seconds: float | None = None
    model_name: str | None = None
    device: str | None = None
    download_url: str | None = None


def _run_create(
    job_id: str,
    prompt: str,
    duration: float,
    guidance_scale: float,
    temperature: float,
) -> None:
    jobs[job_id]["status"] = "generating"
    try:
        output_path = OUTPUT_DIR / f"{job_id}.mp3"
        result = text_generator.generate(
            prompt,
            str(output_path),
            duration_seconds=duration,
            guidance_scale=guidance_scale,
            temperature=temperature,
        )
        jobs[job_id].update(
            {
                "status": "complete",
                "duration_seconds": result.duration_seconds,
                "model_name": result.model_name,
                "device": result.device,
                "file": str(output_path),
            }
        )
    except Exception as exc:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(exc)


def _run_remix(
    job_id: str,
    prompt: str,
    source_path: str,
    duration: float,
    guidance_scale: float,
    temperature: float,
) -> None:
    jobs[job_id]["status"] = "generating"
    try:
        output_path = OUTPUT_DIR / f"{job_id}.mp3"
        result = remix_generator.remix(
            prompt,
            source_path,
            str(output_path),
            duration_seconds=duration,
            guidance_scale=guidance_scale,
            temperature=temperature,
        )
        jobs[job_id].update(
            {
                "status": "complete",
                "duration_seconds": result.duration_seconds,
                "model_name": result.model_name,
                "device": result.device,
                "file": str(output_path),
            }
        )
    except Exception as exc:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(exc)
    finally:
        Path(source_path).unlink(missing_ok=True)


@app.get("/api/health")
def health() -> dict:
    import torch

    return {
        "status": "ok",
        "cuda_available": torch.cuda.is_available(),
        "create_model_loaded": text_generator.model_name is not None,
        "create_model_name": text_generator.model_name,
        "remix_model": remix_generator.model_name,
        "version": "2.0.0",
    }


@app.post("/api/generate", response_model=GenerateResponse)
async def create_generation(request: GenerateRequest) -> GenerateResponse:
    job_id = uuid.uuid4().hex
    jobs[job_id] = {
        "status": "queued",
        "job_type": "create",
        "prompt": request.prompt.strip(),
        "duration": request.duration,
    }

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        executor,
        _run_create,
        job_id,
        request.prompt.strip(),
        request.duration,
        request.guidance_scale,
        request.temperature,
    )

    return GenerateResponse(job_id=job_id, status="queued", job_type="create")


@app.post("/api/remix", response_model=GenerateResponse)
async def create_remix(
    prompt: str = Form(..., min_length=3, max_length=500),
    duration: float = Form(15.0),
    guidance_scale: float = Form(3.0),
    temperature: float = Form(1.0),
    file: UploadFile = File(...),
) -> GenerateResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".mp3", ".wav", ".m4a", ".ogg", ".flac"}:
        raise HTTPException(status_code=400, detail="Supported formats: MP3, WAV, M4A, OGG, FLAC.")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 25 MB).")
    if len(content) < 1000:
        raise HTTPException(status_code=400, detail="File is too small or empty.")

    job_id = uuid.uuid4().hex
    source_path = UPLOAD_DIR / f"{job_id}_source{ext}"
    source_path.write_bytes(content)

    duration = max(5.0, min(duration, 30.0))
    guidance_scale = max(1.0, min(guidance_scale, 6.0))
    temperature = max(0.5, min(temperature, 2.0))

    jobs[job_id] = {
        "status": "queued",
        "job_type": "remix",
        "prompt": prompt.strip(),
        "duration": duration,
    }

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        executor,
        _run_remix,
        job_id,
        prompt.strip(),
        str(source_path),
        duration,
        guidance_scale,
        temperature,
    )

    return GenerateResponse(job_id=job_id, status="queued", job_type="remix")


@app.get("/api/status/{job_id}", response_model=JobStatusResponse)
def get_status(job_id: str) -> JobStatusResponse:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    download_url = f"/api/download/{job_id}" if job.get("status") == "complete" else None
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        job_type=job.get("job_type"),
        prompt=job.get("prompt"),
        error=job.get("error"),
        duration_seconds=job.get("duration_seconds"),
        model_name=job.get("model_name"),
        device=job.get("device"),
        download_url=download_url,
    )


@app.get("/api/download/{job_id}")
def download(job_id: str) -> FileResponse:
    job = jobs.get(job_id)
    if not job or job.get("status") != "complete":
        raise HTTPException(status_code=404, detail="Track not ready.")

    file_path = Path(job["file"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File missing.")

    prefix = "remix" if job.get("job_type") == "remix" else "track"
    safe_name = "".join(c if c.isalnum() or c in " -_" else "_" for c in job.get("prompt", prefix)[:40])
    return FileResponse(
        file_path,
        media_type="audio/mpeg",
        filename=f"{safe_name.strip() or prefix}.mp3",
    )


app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")
