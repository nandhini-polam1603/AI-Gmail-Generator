import os
import json
import re
import time
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

app = FastAPI(
    title="AI Gmail Generator API",
    description="Backend API for generating emails using Google Gemini API",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    recipient: str = Field(..., description="Recipient of the email, e.g., Professor, HR Manager")
    purpose: str = Field(..., description="Purpose/Category of email, e.g., Leave Request, Internship")
    situation: str = Field(..., description="Details and context of the email")
    tone: str = Field(default="Professional", description="Tone: Formal, Professional, Friendly, Simple")
    length: str = Field(default="Medium", description="Length: Short, Medium, Detailed")

class EmailResponse(BaseModel):
    subject: str
    body: str

def clean_json_response(raw_text: str) -> dict:
    """Safely extracts and parses JSON from the AI response."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    
    try:
        return json.loads(cleaned)
    except Exception:
        # Fallback regex extraction
        match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError("Could not parse valid JSON from AI output")

def is_permanent_error(error_msg: str) -> bool:
    """Identify non-retryable errors like invalid credentials or bad auth."""
    msg = error_msg.lower()
    permanent_keywords = ["api_key_invalid", "invalid api key", "unauthenticated", "401", "403", "permission_denied", "api key not found"]
    return any(k in msg for k in permanent_keywords)

def generate_with_gemini(request: EmailRequest, simulate_503: bool = False) -> EmailResponse:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=400,
            detail="Gemini API Key is not configured. Please set your GEMINI_API_KEY in backend/.env file."
        )

    if simulate_503:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service is temporarily busy (Simulated 503). Please click Retry to try again."
        )

    length_guidelines = {
        "Short": "1 concise paragraph with clear greeting and closing",
        "Medium": "2-3 well-structured paragraphs with greeting and closing",
        "Detailed": "3-4 detailed paragraphs explaining context, specifics, and action items thoroughly"
    }
    length_desc = length_guidelines.get(request.length, "2-3 well-structured paragraphs")

    prompt = f"""
You are an expert executive email communication assistant.
Draft a complete, polished email with the following specifications:

- Recipient / Target Audience: {request.recipient}
- Category / Purpose: {request.purpose}
- Specific Situation & Context: {request.situation}
- Tone: {request.tone}
- Desired Length: {request.length} ({length_desc})

Instructions:
1. Subject line: Create a clear, compelling, professional subject line appropriate for the context.
2. Greeting: Appropriate greeting addressing '{request.recipient}' (e.g. 'Dear Professor [Last Name],' or 'Hi [Name],').
3. Email Body: Well-phrased body paragraphs that directly address the situation with the specified '{request.tone}' tone and '{request.length}' length.
4. Closing: Professional sign-off (e.g. 'Best regards,', 'Sincerely,', 'Warm regards,') followed by '[Your Name]' on a new line.
5. Return ONLY a valid JSON object with keys "subject" and "body". Do NOT wrap in extra prose.

JSON Format:
{{
  "subject": "Subject line text",
  "body": "Greeting\\n\\nBody paragraphs...\\n\\nClosing,\\n[Your Name]"
}}
"""

    models_to_try = [
        "gemini-3.8-flash",
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
    ]
    last_error = None
    is_transient = False

    for model_name in models_to_try:
        max_attempts = 3
        for attempt in range(1, max_attempts + 1):
            try:
                from google import genai
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                data = clean_json_response(response.text)
                return EmailResponse(
                    subject=data.get("subject", f"Regarding {request.purpose}"),
                    body=data.get("body", response.text)
                )
            except Exception as e:
                err_str = str(e)
                last_error = e

                # Do not retry permanent authorization / key errors
                if is_permanent_error(err_str):
                    raise HTTPException(
                        status_code=401,
                        detail=f"Gemini API Key Authentication Error: {err_str}"
                    )

                if any(k in err_str for k in ["503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "OVERLOADED", "DEADLINE_EXCEEDED"]):
                    is_transient = True

                # Model not available/deprecated for this account -> switch to next model immediately
                if "404" in err_str or "NOT_FOUND" in err_str:
                    break

                # Transient error backoff retry
                if attempt < max_attempts:
                    time.sleep(1.0 * attempt)
                else:
                    break

    if is_transient:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service is temporarily busy (503 / Rate Limit). Please click Retry to try again."
        )

    raise HTTPException(
        status_code=500,
        detail=f"Gemini API Error: {str(last_error)}"
    )

@app.get("/")
def read_root():
    return {
        "app": "AI Gmail Generator Backend",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    api_key_configured = bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here")
    return {
        "status": "healthy",
        "api_key_configured": api_key_configured
    }

@app.post("/generate-email", response_model=EmailResponse)
def generate_email_endpoint(
    request: EmailRequest,
    x_simulate_error: Optional[str] = Header(None, alias="X-Simulate-Error")
):
    if not request.recipient.strip():
        raise HTTPException(status_code=400, detail="Recipient is required.")
    if not request.situation.strip():
        raise HTTPException(status_code=400, detail="Situation description is required.")
    
    simulate_503 = (x_simulate_error == "503")
    return generate_with_gemini(request, simulate_503=simulate_503)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
