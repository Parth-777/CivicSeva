"""
gemini_pipeline.py

CivicSeva AI pipeline using ONLY the Gemini API -- no trained model, no
dataset. A single multimodal call handles all three requirements:

    1. Wrong image upload      -> "status": "INVALID_IMAGE"
    2. Category -> department  -> "department": Roadways / Waterways / Other
    3. Severity                -> "severity": LOW / MEDIUM / HIGH / CRITICAL

Setup:
    pip install google-genai pydantic
    export GEMINI_API_KEY="your_key_here"   # get free key at aistudio.google.com

Usage (standalone test):
    python gemini_pipeline.py --image test.jpg --text "Large pothole blocking the road"
"""

import argparse
import json
import os
import time
from enum import Enum
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

load_dotenv()  # reads .env in the current folder and loads it into os.environ

# --- Config -------------------------------------------------------------

MODEL_NAME = "gemini-3.5-flash"   # free-tier model as of Aug 2026 (15 RPM, 1500 RPD).
                                    # gemini-2.5-flash is closed to new API keys and
                                    # shuts down entirely Oct 16, 2026. If THIS model
                                    # also 404s by the time you read this, check
                                    # https://aistudio.google.com for the current
                                    # free-tier model name and swap it in here.

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # seconds, doubles each retry (handles 429 rate limits)


# --- Response schema (Gemini fills this in directly, no manual parsing) --

class Department(str, Enum):
    ROADS = "Roads & Public Works"
    DRAINAGE = "Drainage & Water Management"
    SANITATION = "Sanitation & Solid Waste"
    RAILWAY = "Railway / Transport"
    NOT_APPLICABLE = "N/A"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    NOT_APPLICABLE = "N/A"


class ComplaintAnalysis(BaseModel):
    is_valid_civic_image: bool = Field(
        description="False if the image does NOT show a genuine civic infrastructure "
        "problem (e.g. it's a selfie, random object, food, unrelated scene, or a "
        "duplicate/joke upload)."
    )
    text_matches_image: bool = Field(
        description="False if the citizen's text description describes a clearly "
        "different problem than what is actually visible in the image (e.g. text says "
        "'pothole' but the image shows an overflowing garbage bin, or text says "
        "'flooding' but the image shows a fallen tree). True if the text is consistent "
        "with the image, or if no text was provided."
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        description="If is_valid_civic_image is False, explain why (e.g. 'Image shows "
        "a person, not an infrastructure issue'). If text_matches_image is False, "
        "explain the mismatch instead (e.g. 'Text describes a pothole but the image "
        "shows an overflowing garbage bin').",
    )
    problem: Optional[str] = Field(
        default=None, description="Short name of the detected problem, e.g. 'Pothole', "
        "'Garbage dumping', 'Waterlogging', 'Broken streetlight'."
    )
    department: Department = Field(description="Which department this belongs to.")
    confidence: float = Field(description="Model's confidence in this classification, 0 to 1.")
    severity: Severity = Field(description="Severity of the issue.")
    severity_score: int = Field(description="Severity score from 0 (none) to 100 (critical), "
                                 "matching the severity label.")
    reasoning: str = Field(description="One sentence explaining the severity assessment, "
                            "referencing what's visible in the image and/or the text.")


SYSTEM_PROMPT = """You are the AI classification engine for CitySync, a citizen \
civic-complaint platform. You will be shown a photo a citizen uploaded, along with \
their text description of the problem.

Your job, in one pass:

1. VALIDATE THE IMAGE: Check whether the image actually shows a real civic \
infrastructure problem covered by one of the four departments below. If the image is \
irrelevant (selfies, random objects, food, pets, screenshots, memes, or anything \
unrelated to a civic issue), set is_valid_civic_image to false and explain why in \
rejection_reason. Do NOT guess a department or severity for invalid images -- use \
"N/A" for both, and set text_matches_image to true (mismatch doesn't apply if the \
image itself is invalid).

2. CHECK TEXT-IMAGE CONSISTENCY: Compare the citizen's text description to what is \
actually visible in the image. If they describe a clearly different problem than what \
the image shows (e.g. text says "pothole" but the image shows garbage, or text says \
"flooding" but the image shows a fallen tree), set text_matches_image to false and \
explain the mismatch in rejection_reason. This applies even when the image itself is a \
valid civic problem -- a real problem with a mismatched description is still flagged \
as a mismatch, not silently corrected. If no text was provided, or the text is \
consistent with the image, set text_matches_image to true.

3. CATEGORIZE: If the image is valid AND the text matches, identify the specific \
problem and map it to exactly one department:

   - Roads & Public Works: potholes, damaged roads, road cracks, broken/uneven \
footpaths, damaged road dividers, damaged bridges, road cave-ins, damaged speed \
breakers, missing/damaged road signs, road obstruction, damaged public infrastructure, \
illegal digging/damage to roads, fallen objects blocking roads, damaged bus stops, \
unsafe road conditions.

   - Drainage & Water Management: waterlogging, flooded roads, blocked drains, \
overflowing drains, open drains, broken drainage covers, open manholes, sewer \
overflow, sewage leakage, drainage pipe damage, storm-water drainage problems, water \
stagnation, rainwater accumulation, drain cleaning requests, local flooding, broken \
culverts.

   - Sanitation & Solid Waste: garbage dumping, uncollected garbage, overflowing \
garbage bins, garbage on roads, garbage in public places, illegal dumping, \
construction waste, dead animal waste, dirty streets, public-place cleanliness, waste \
collection problems, plastic/waste accumulation, burning of waste, garbage around \
markets, unsanitary public areas.

   - Railway / Transport: railway track obstruction, fallen objects on railway \
tracks, waterlogging near railway areas, garbage near railway premises, damaged \
railway infrastructure, broken railway fencing, damaged platforms, platform \
cleanliness, broken/unsafe railway facilities, railway crossing problems, railway \
signal-related complaints, encroachment near railway property, unauthorized dumping \
near railway tracks, safety hazards around railway areas.

   If a valid civic problem doesn't clearly fit any of these four departments, still \
pick the closest match rather than inventing a new category.

4. ASSESS SEVERITY: Based on both the image and the citizen's text, score severity \
0-100 and assign a label (skip this, use "N/A" and score 0, if the image is invalid or \
the text doesn't match):
   - LOW (0-29): minor, cosmetic, no safety risk
   - MEDIUM (30-54): noticeable problem, inconvenience, no immediate danger
   - HIGH (55-79): significant hazard, affecting traffic/access/health, needs prompt action
   - CRITICAL (80-100): immediate danger to life/property, needs urgent response

Be conservative and honest -- do not inflate severity, do not force a classification \
onto an image that doesn't clearly show a civic problem, and do not silently ignore a \
mismatch between the citizen's words and their photo."""


# --- Core pipeline function ---------------------------------------------

def analyze_complaint(image_path: str, text_description: str = "") -> dict:
    """Send image + text to Gemini and get back the full classification in
    one call. Retries on rate-limit (429) errors with exponential backoff."""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY not set. Get a free key at https://aistudio.google.com/apikey "
            "and run: export GEMINI_API_KEY='your_key_here'"
        )

    client = genai.Client(api_key=api_key)

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

    user_prompt = (
        f"Citizen's text description: \"{text_description or '(no description provided)'}\"\n\n"
        "Analyze the attached image and the description above according to your instructions."
    )

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    {"role": "user", "parts": [
                        {"text": user_prompt},
                        {"inline_data": {"mime_type": mime_type, "data": image_bytes}},
                    ]}
                ],
                config={
                    "system_instruction": SYSTEM_PROMPT,
                    "response_mime_type": "application/json",
                    "response_schema": ComplaintAnalysis,
                    "temperature": 0.1,  # low temperature: consistent, non-creative classification
                },
            )
            result: ComplaintAnalysis = response.parsed
            return _format_output(result)

        except genai_errors.APIError as e:
            last_error = e
            # 429 = rate limit hit; back off and retry. Anything else, fail fast.
            if getattr(e, "code", None) == 429 and attempt < MAX_RETRIES - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                print(f"Rate limited, retrying in {delay}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(delay)
                continue
            break

    # All retries exhausted or a non-retryable error occurred.
    return {
        "status": "ERROR",
        "message": f"Gemini API call failed: {last_error}",
    }


def _format_output(result: ComplaintAnalysis) -> dict:
    if not result.is_valid_civic_image:
        return {
            "status": "INVALID_IMAGE",
            "message": result.rejection_reason or "Image does not show a valid civic problem.",
        }

    if not result.text_matches_image:
        return {
            "status": "INVALID_IMAGE",
            "message": result.rejection_reason or "The description does not match what's shown in the image.",
        }

    return {
        "status": "VALID",
        "problem": result.problem,
        "department": result.department.value,
        "confidence": round(result.confidence, 3),
        "severity": result.severity.value,
        "severity_score": result.severity_score,
        "reasoning": result.reasoning,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True)
    parser.add_argument("--text", type=str, default="")
    args = parser.parse_args()

    result = analyze_complaint(args.image, args.text)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()