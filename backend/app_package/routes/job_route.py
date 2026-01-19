from flask import Blueprint, request, jsonify, session
from ..services import job_service

job_bp = Blueprint("job_bp", __name__)
# -----------------------------
# CREATE JOB
# -----------------------------
@job_bp.route("/create", methods=["POST"])
def create_job_route():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    new_job, status = job_service.create_job(user_id, data)
    return jsonify(new_job), status

# -----------------------------
# LIST jobs for current user
# -----------------------------
@job_bp.route("/list", methods=["GET"])
def list_jobs():
    user_id = session.get("user_id")
    print(f"[DEBUG] list_jobs called. session user_id={user_id}")

    if not user_id:
        print("[WARN] Unauthorized access to /list")
        return jsonify({"error": "Unauthorized"}), 401

    jobs = job_service.get_jobs_by_user(user_id)
    print(f"[DEBUG] Returning {len(jobs)} jobs for user_id={user_id}")
    for job in jobs:
        print(f"[DEBUG] Job: {job}")

    return jsonify(jobs), 200
# -----------------------------
# GET SINGLE
# -----------------------------
@job_bp.route("/<int:job_id>", methods=["GET"])
def get_job(job_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    job = job_service.get_job_by_id(user_id, job_id)
    if not job:
        return jsonify({"error": "Not found"}), 404
    return jsonify(job), 200
# -----------------------------
# UPDATE job
# -----------------------------
@job_bp.route("/<int:job_id>", methods=["PUT"])
def update_job_route(job_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    updated_job = job_service.update_job(user_id, job_id, data)
    if not updated_job:
        return jsonify({"error": "Not found or permission denied"}), 404

    return jsonify(updated_job), 200
