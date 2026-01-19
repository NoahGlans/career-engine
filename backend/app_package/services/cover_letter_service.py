from .. import db
from ..models import CoverLetter, Application

MAX_CONTENT_LENGTH = 8000

# -----------------------------
# Serializer
# -----------------------------
def serialize_cover_letter(cl: CoverLetter):
    return {
        "id": cl.id,
        "title": cl.title,
        "language": cl.language,
        "content": cl.content,
        "status": cl.status,
        "created_at": cl.created_at.isoformat(),
        "application_id": cl.application_id,
    }


# -----------------------------
# Create
# -----------------------------
def create_cover_letter(user_id, data):
    title = data.get("title")
    application_id = data.get("application_id")
    content = data.get("content")

    if not title:
        return {"error": "Title is required"}, 400

    if not application_id:
        return {"error": "application_id is required"}, 400

    if not content or not content.strip():
        return {"error": "Cover letter content is required"}, 400
    #Make sure content is not too long
    if len(content) > MAX_CONTENT_LENGTH:
        return {"error": f"Content exceeds maximum length of {MAX_CONTENT_LENGTH} characters"}, 400
    # Ensure application belongs to user
    app = Application.query.filter_by(
        id=application_id,
        user_id=user_id
    ).first()

    if not app:
        return {"error": "Invalid application_id"}, 404

    new_cl = CoverLetter(
        title=title,
        language=data.get("language"),
        content=content,
        application_id=application_id
    )

    db.session.add(new_cl)
    db.session.commit()

    return serialize_cover_letter(new_cl), 201


# -----------------------------
# Get all for user
# -----------------------------
def get_cover_letters_by_user(user_id):
    cover_letters = (
        CoverLetter.query
        .join(Application)
        .filter(Application.user_id == user_id)
        .all()
    )
    return [serialize_cover_letter(cl) for cl in cover_letters]


# -----------------------------
# Get by id (ownership enforced)
# -----------------------------
def get_cover_letter_by_id(user_id, cl_id):
    cl = (
        CoverLetter.query
        .join(Application)
        .filter(
            CoverLetter.id == cl_id,
            Application.user_id == user_id
        )
        .first()
    )

    return serialize_cover_letter(cl) if cl else None


# -----------------------------
# Update
# -----------------------------
def update_cover_letter(user_id, cl_id, updates):
    cl = (
        CoverLetter.query
        .join(Application)
        .filter(
            CoverLetter.id == cl_id,
            Application.user_id == user_id
        )
        .first()
    )

    if not cl:
        return {"error": "Not found"}, 404

    allowed_fields = {"title", "language", "content", "application_id"}

    # Validate content only if it is being updated
    content = updates.get("content")
    if content is not None:
        if not content.strip():
            return {"error": "Cover letter content cannot be empty"}, 400
        if len(content) > MAX_CONTENT_LENGTH:
            return {
                "error": f"Content exceeds maximum length of {MAX_CONTENT_LENGTH} characters"
            }, 400

    for key, value in updates.items():
        if key in allowed_fields and value is not None:
            setattr(cl, key, value)

    db.session.commit()
    return serialize_cover_letter(cl), 200


# -----------------------------
# Delete
# -----------------------------
def delete_cover_letter(user_id, cl_id):
    cl = (
        CoverLetter.query
        .join(Application)
        .filter(
            CoverLetter.id == cl_id,
            Application.user_id == user_id
        )
        .first()
    )

    if not cl:
        return {"error": "Not found"}, 404

    db.session.delete(cl)
    db.session.commit()

    return {"message": "Cover letter deleted"}, 200
