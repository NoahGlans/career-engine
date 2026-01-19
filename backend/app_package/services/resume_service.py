from .. import db
from ..models import Resume
from ..services.ai_service import extract_text_from_pdf
import os
import uuid
from flask import current_app

# -----------------------------
# SERIALIZER
# -----------------------------
def serialize_resume(resume: Resume):
    return {
        "id": resume.id,
        "title": resume.title,
        "content": resume.content,
        "user_id": resume.user_id
    }

# -----------------------------
# CREATE RESUME
# -----------------------------
def create_resume(user_id: int, data: dict):
    title = data.get("title")
    content = data.get("content")

    if not title:
        return {"error": "Title is required"}, 400

    if not content or not content.strip():
        return {"error": "Resume content is required"}, 400

    new_resume = Resume(
        user_id=user_id,
        title=title,
        content=content
    )

    db.session.add(new_resume)
    db.session.commit()

    return serialize_resume(new_resume), 201


# -----------------------------
# GET ALL RESUMES FOR USER
# -----------------------------
def get_resumes_by_user(user_id: int):
    try:
        resumes = Resume.query.filter_by(user_id=user_id).all()
        return [serialize_resume(r) for r in resumes], 200
    except Exception as e:
        print(f"Error fetching resumes by user ID: {e}")
        return {"error": "Internal server error"}, 500

# -----------------------------
# GET RESUME BY ID
# -----------------------------
def get_resume_by_id(user_id: int, resume_id: int):
    try:
        resume = Resume.query.get(resume_id)
        if not resume or resume.user_id != user_id:
            return {"error": "Not found"}, 404
        return serialize_resume(resume), 200
    except Exception as e:
        print(f"Error fetching resume by ID: {e}")
        return {"error": "Internal server error"}, 500

# -----------------------------
# UPDATE RESUME (PDF SUPPORTED)
# -----------------------------
def update_resume(user_id: int, resume_id: int, updates: dict, pdf_file=None):
    try:
        resume = Resume.query.get(resume_id)
        if not resume or resume.user_id != user_id:
            return {"error": "Not found"}, 404

        # Update title/content_url from form
        if "title" in updates and updates["title"]:
            resume.title = updates["title"]

        if pdf_file:
            temp_dir = get_temp_upload_dir()
            filename = f"{uuid.uuid4()}_{pdf_file.filename}"
            temp_path = os.path.join(temp_dir, filename)
            try:
                pdf_file.save(temp_path)
                resume.content_url = extract_text_from_pdf(temp_path)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        elif "content_url" in updates and updates["content_url"]:
            resume.content_url = updates["content_url"]

        db.session.commit()
        return serialize_resume(resume), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating resume: {e}")
        return {"error": "Internal server error"}, 500

# -----------------------------
# DELETE RESUME
# -----------------------------
def delete_resume(user_id: int, resume_id: int):
    try:
        resume = Resume.query.get(resume_id)
        if not resume or resume.user_id != user_id:
            return {"error": "Not found"}, 404

        db.session.delete(resume)
        db.session.commit()
        return {"message": "Deleted"}, 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting resume: {e}")
        return {"error": "Internal server error"}, 500
