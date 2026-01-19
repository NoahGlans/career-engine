from flask import Blueprint, request, jsonify, session
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ai_bp = Blueprint("ai", __name__)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
#Static system prompt 
SYSTEM_PROMPT = (
    "You are an experienced hiring manager and career coach."
)
#Feedback prompt
FEEDBACK_PROMPT = """
Your task is to review a cover letter in the context of:
The candidate's resume
The job description

Your goal is to provide constructive, specific feedback to improve the cover letter.

Do NOT rewrite the cover letter.
Do NOT invent experience that is not present in the resume.
Base all feedback strictly on the provided documents.
If a section has no meaningful feedback, return an empty array rather than speculating.

Focus on:
- Alignment between the cover letter and the job description
- How well the resume's strongest points are reflected
- Missing or weak connections
- Clarity, specificity, and tone

Return your response strictly in JSON with keys in this order:
strengths, gaps, suggestions, tone_feedback.

Each item in "strengths", "gaps", and "suggestions" should be 1-2 sentences and reference concrete elements from the documents.
"tone_feedback" should assess professionalism, confidence, enthusiasm, and clarity in 2-3 sentences. ONLY answer in the specified JSON format.

JSON Structure:
{{
  "strengths": [string],
  "gaps": [string],
  "suggestions": [string],
  "tone_feedback": string
}}

Documents:

RESUME:
\"\"\"{resume}\"\"\"

JOB DESCRIPTION:
\"\"\"{job}\"\"\"

COVER LETTER:
\"\"\"{cover_letter}\"\"\"
"""



@ai_bp.route("/feedback", methods=["POST"])
def feedback():
    # Auth
    if not session.get("user_id"):
        return jsonify({"error": "Unauthorized"}), 401

    # Payload
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    resume = data.get("resume", "").strip()
    job = data.get("job", "").strip()
    cover_letter = data.get("cover_letter", "").strip()

    missing = []
    if not resume:
        missing.append("resume")
    if not job:
        missing.append("job")
    if not cover_letter:
        missing.append("cover_letter")

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing
        }), 400

    prompt = FEEDBACK_PROMPT.format(
        resume=resume,
        job=job,
        cover_letter=cover_letter
    )
    #OpenAI API call with their format
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )

        content = response.choices[0].message.content

        return jsonify({"feedback": content}), 200

    except Exception as e:
        return jsonify({
            "error": "AI feedback generation failed"
        }), 500
