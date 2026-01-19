from flask import Blueprint, request, jsonify, session
from ..services import cover_letter_service
from ..services.ai_service import extract_text_from_pdf
import tempfile
import os

cover_letter_bp = Blueprint("cover_letter_bp", __name__)

# -----------------------------
# Get all cover letters
# -----------------------------
@cover_letter_bp.route("/list", methods=["GET"])
def get_cover_letters():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    cover_letters = cover_letter_service.get_cover_letters_by_user(user_id)
    return jsonify(cover_letters), 200


# -----------------------------
# Get single cover letter
# -----------------------------
@cover_letter_bp.route("/<int:cl_id>", methods=["GET"])
def get_cover_letter(cl_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    cl = cover_letter_service.get_cover_letter_by_id(user_id, cl_id)
    if not cl:
        return jsonify({"error": "Not found"}), 404

    return jsonify(cl), 200


# -----------------------------
# Create cover letter (PDF supported)
# -----------------------------
@cover_letter_bp.route("/create", methods=["POST"])
def create_cover_letter():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title")
    language = request.form.get("language")
    application_id = request.form.get("application_id")
    pdf_file = request.files.get("file")
    content = request.form.get("content")
    if content:
        content = " ".join(content.split())



    if pdf_file:
        if pdf_file.mimetype != "application/pdf":
            return jsonify({"error": "Invalid file type"}), 400
        if not pdf_file.filename.lower().endswith(".pdf"):
                return jsonify({"error": "Only PDF files are supported"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            content = extract_text_from_pdf(tmp.name)

        os.remove(tmp.name)

        if not content:
            return jsonify({"error": "Could not extract text from PDF"}), 400

    result, status = cover_letter_service.create_cover_letter(user_id, {
        "title": title,
        "language": language,
        "application_id": application_id,
        "content": content
    })

    return jsonify(result), status


# -----------------------------
# Update cover letter (PDF supported)
# -----------------------------
@cover_letter_bp.route("/update/<int:cl_id>", methods=["PUT"])
def update_cover_letter(cl_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title")
    language = request.form.get("language")
    application_id = request.form.get("application_id")
    pdf_file = request.files.get("file")
    content = request.form.get("content")

    if pdf_file:
        if pdf_file.mimetype != "application/pdf":
            return jsonify({"error": "Invalid file type"}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            pdf_file.save(tmp.name)
            content = extract_text_from_pdf(tmp.name)

        os.remove(tmp.name)

        if not content:
            return jsonify({"error": "Could not extract text from PDF"}), 400

    updates = {}
    if title is not None:
        updates["title"] = title
    if language is not None:
        updates["language"] = language
    if application_id is not None:
        updates["application_id"] = application_id
    if content:
        updates["content"] = content

    result, status = cover_letter_service.update_cover_letter(user_id, cl_id, updates)
    return jsonify(result), status


# -----------------------------
# Delete cover letter
# -----------------------------
@cover_letter_bp.route("/delete/<int:cl_id>", methods=["DELETE"])
def delete_cover_letter(cl_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    result, status = cover_letter_service.delete_cover_letter(user_id, cl_id)
    return jsonify(result), status
