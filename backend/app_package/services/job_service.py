from .. import db
from ..models import Job
from datetime import datetime, timezone

# -----------------------------
# SERIALIZER
# -----------------------------
def serialize_job(job: Job):
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "job_url": job.job_url,
        "description": job.description,
        "date_posted": job.date_posted.isoformat() if job.date_posted else None,
        "deadline": job.deadline.isoformat() if job.deadline else None,
        "employment_type": job.employment_type,
        "user_id": job.user_id
    }

# -----------------------------
# CREATE
# -----------------------------
def create_job(user_id, data: dict):
    print(f"[DEBUG] create_job called with user_id={user_id}, data={data}")
    title = data.get("title")
    company = data.get("company")
    if not title or not company:
        print("[WARN] Missing title or company")
        return {"error": "Job title and company are required"}, 400

    try:
        date_posted = data.get("date_posted") or datetime.now(timezone.utc)
        new_job = Job(
            user_id=user_id,
            title=title,
            company=company,
            location=data.get("location"),
            job_url=data.get("job_url"),
            description=data.get("description"),
            date_posted=date_posted,
            deadline=data.get("deadline"),
            employment_type=data.get("employment_type")
        )
        db.session.add(new_job)
        db.session.commit()
        print(f"[DEBUG] Job created successfully: {serialize_job(new_job)}")
        return serialize_job(new_job), 201
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error creating job: {e}")
        return {"error": "Internal server error"}, 500

# -----------------------------
# GET JOBS BY USER
# -----------------------------
def get_jobs_by_user(user_id):
    print(f"[DEBUG] get_jobs_by_user called with user_id={user_id}")
    try:
        jobs = Job.query.filter_by(user_id=user_id).all()
        print(f"[DEBUG] Found {len(jobs)} jobs for user_id={user_id}")
        serialized = [serialize_job(j) for j in jobs]
        print(f"[DEBUG] Serialized jobs: {serialized}")
        return serialized
    except Exception as e:
        print(f"[ERROR] Error fetching jobs by user ID: {e}")
        return []

# -----------------------------
# GET SINGLE JOB BY ID (OWNER CHECK)
# -----------------------------
def get_job_by_id(user_id, job_id):
    print(f"[DEBUG] get_job_by_id called with user_id={user_id}, job_id={job_id}")
    job = Job.query.get(job_id)
    if not job or job.user_id != user_id:
        print(f"[WARN] Job not found or does not belong to user")
        return None
    serialized = serialize_job(job)
    print(f"[DEBUG] Returning job: {serialized}")
    return serialized

# -----------------------------
# UPDATE JOB
# -----------------------------
def update_job(user_id, job_id, updates: dict):
    print(f"[DEBUG] update_job called with user_id={user_id}, job_id={job_id}, updates={updates}")
    job = Job.query.get(job_id)
    if not job or job.user_id != user_id:
        print(f"[WARN] Job not found or does not belong to user")
        return None
    try:
        for key, value in updates.items():
            if hasattr(job, key):
                setattr(job, key, value)
                print(f"[DEBUG] Updated {key} -> {value}")
        db.session.commit()
        serialized = serialize_job(job)
        print(f"[DEBUG] Job updated successfully: {serialized}")
        return serialized
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error updating job: {e}")
        return None

# -----------------------------
# DELETE JOB
# -----------------------------
def delete_job(user_id, job_id):
    print(f"[DEBUG] delete_job called with user_id={user_id}, job_id={job_id}")
    job = Job.query.get(job_id)
    if not job or job.user_id != user_id:
        print(f"[WARN] Job not found or does not belong to user")
        return False
    try:
        db.session.delete(job)
        db.session.commit()
        print(f"[DEBUG] Job deleted successfully: id={job_id}")
        return True
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Error deleting job: {e}")
        return False
