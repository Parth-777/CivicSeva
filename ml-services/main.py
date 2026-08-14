"""
main.py

FastAPI service exposing the Gemini-based CivicSeva AI pipeline as an
HTTP endpoint. This is what your backend team calls.

Setup:
    pip install fastapi uvicorn python-multipart google-genai pydantic
    export GEMINI_API_KEY="your_key_here"

Run:
    uvicorn main:app --reload --port 8000

Test:
    curl -X POST http://localhost:8000/analyze \
        -F "image=@test.jpg" \
        -F "text=Large pothole blocking half the road"
"""

import shutil
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

from gemini_pipeline import analyze_complaint

app = FastAPI(title="CivicSeva AI Service")

# Allow the CivicSeva backend/frontend to call this from a different origin
# during development. Tighten this to your actual domain before production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CivicSeva AI (Gemini)"}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...), text: str = Form("")):
    # Save the upload to a temp file since analyze_complaint reads from disk.
    suffix = Path(image.filename).suffix or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(image.file, tmp)
        tmp_path = tmp.name

    try:
        result = analyze_complaint(tmp_path, text)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    return result
