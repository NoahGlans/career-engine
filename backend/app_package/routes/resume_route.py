from flask import Blueprint, request, jsonify, session
from ..services import resume_service
from ..services.ai_service import extract_text_from_pdf
import tempfile
import os

resume_bp = Blueprint("resume_bp", __name__)

# -----------------------------
# List all resumes
# -----------------------------
@resume_bp.route("/list", methods=["GET"])
def list_resumes():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    result, status = resume_service.get_resumes_by_user(user_id)
    return jsonify(result), status


# -----------------------------
# Create a new resume (PDF supported)
# -----------------------------
@resume_bp.route("/create", methods=["POST"])
def create_resume():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title")
    content = request.form.get("content")  # fallback if user provides text instead of PDF
    pdf_file = request.files.get("file")

    if pdf_file:
        if pdf_file.mimetype != "application/pdf" or not pdf_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are supported"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            extracted_text = extract_text_from_pdf(tmp.name)
        os.remove(tmp.name)

        if not extracted_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        content = extracted_text 

    result, status = resume_service.create_resume(user_id, {
        "title": title,
        "content": content
    })
    return jsonify(result), status


# -----------------------------
# Update an existing resume (PDF supported)
# -----------------------------
@resume_bp.route("/update/<int:resume_id>", methods=["PUT"])
def update_resume(resume_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title")
    content = request.form.get("content")
    pdf_file = request.files.get("file")

    if pdf_file:
        if pdf_file.mimetype != "application/pdf" or not pdf_file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are supported"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            extracted_text = extract_text_from_pdf(tmp.name)
        os.remove(tmp.name)

        if not extracted_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        content = extracted_text

    updates = {}
    if title is not None:
        updates["title"] = title
    if content is not None:
        updates["content"] = content

    result, status = resume_service.update_resume(user_id, resume_id, updates)
    return jsonify(result), status


# -----------------------------
# Delete a resume
# -----------------------------
@resume_bp.route("/delete/<int:resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    result, status = resume_service.delete_resume(user_id, resume_id)
    return jsonify(result), status
