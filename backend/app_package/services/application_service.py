from ..models import Application
from ..import db
from sqlalchemy.orm import joinedload
import datetime

def serialize_application(app: Application):
    return {
        "id": app.id,
        "title": app.title,
        "submitted_at": app.submitted_at,
        "status": app.status,
        "user_id": app.user_id,
        "job_id": app.job_id,
        "resume_id": app.resume_id,
        "job": {
            "id": app.job.id if app.job else None,
            "title": app.job.title if app.job else None,
            "description": app.job.description if app.job else None,
            "company": app.job.company if app.job else None,
            "location": app.job.location if app.job else None,
            "employment_type": app.job.employment_type if app.job else None,
            "job_url": app.job.job_url if app.job else None,
            "deadline": app.job.deadline if app.job else None
        } if app.job else None
    }

# -----------------------------
# CREATE
# -----------------------------
def create_application(user_id: int, data: dict):
    title = data.get("title")
    job_id = data.get("job_id")

    if not title:
        return {"error": "Application title is required"}, 400
    if not job_id:
        return {"error": "job_id is required"}, 400

    try:
        new_app = Application(
            title=title,
            status=data.get("status", "Pending"),
            submitted_at=datetime.datetime.now(),
            user_id=user_id,
            job_id=job_id,
            resume_id=data.get("resume_id")
        )

        db.session.add(new_app)
        db.session.commit()
        return serialize_application(new_app), 201

    except Exception as e:
        db.session.rollback()
        print("Error creating application:", e)
        return {"error": "Internal server error"}, 500


# -----------------------------
# GET ALL (FOR USER)
# -----------------------------
def get_applications_by_user(user_id: int):
    try:
        apps = (
            Application.query
            .options(joinedload(Application.job))  # load job relationship
            .filter_by(user_id=user_id)
            .order_by(Application.id.desc())
            .all()
        )
        return [serialize_application(a) for a in apps]
    except Exception as e:
        print("Error fetching applications:", e)
        return []

# -----------------------------
# GET ONE APPLICATION
# -----------------------------
def get_application_by_id(user_id: int, app_id: int):
    try:
        app = (
            Application.query
            .options(joinedload(Application.job))
            .get(app_id)
        )
        if not app or app.user_id != user_id:
            return None
        return serialize_application(app)
    except Exception as e:
        print("Error fetching application:", e)
        return None


# -----------------------------
# UPDATE
# -----------------------------
def update_application(user_id: int, app_id: int, updates: dict):
    try:
        app = Application.query.get(app_id)
        if not app or app.user_id != user_id:
            return None

        for key, value in updates.items():
            if hasattr(app, key):
                setattr(app, key, value)

        db.session.commit()
        return serialize_application(app)

    except Exception as e:
        db.session.rollback()
        print("Error updating application:", e)
        return None


# -----------------------------
# DELETE
# -----------------------------
def delete_application(user_id: int, app_id: int):
    try:
        app = Application.query.get(app_id)
        if not app or app.user_id != user_id:
            return False

        db.session.delete(app)
        db.session.commit()
        return True

    except Exception as e:
        db.session.rollback()
        print("Error deleting application:", e)
        return False
