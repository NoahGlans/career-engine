from flask import Blueprint, request, jsonify, session
from ..services import application_service

application_bp = Blueprint("application_bp", __name__)

# -----------------------------
# LIST all applications for the logged-in user
# -----------------------------
@application_bp.route("/list", methods=["GET"])
def list_applications():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    apps = application_service.get_applications_by_user(user_id)
    return jsonify(apps), 200  # already serialized in service

# -----------------------------
# CREATE a new application
# -----------------------------
@application_bp.route("/create", methods=["POST"])
def create_application():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    if not data or not data.get("job_id") or not data.get("title"):
        return jsonify({"error": "Missing required fields"}), 400

    new_app, status = application_service.create_application(user_id, data)
    return jsonify(new_app), status


# -----------------------------
# GET a single application by ID
# -----------------------------
@application_bp.route("/<int:app_id>", methods=["GET"])
def get_application(app_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    app = application_service.get_application_by_id(user_id, app_id)
    if not app:
        return jsonify({"error": "Not found"}), 404

    return jsonify(app), 200


# -----------------------------
# UPDATE an application by ID
# -----------------------------
@application_bp.route("/update/<int:app_id>", methods=["PUT"])
def update_application(app_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    updated_app = application_service.update_application(user_id, app_id, data)
    if not updated_app:
        return jsonify({"error": "Not found"}), 404

    return jsonify(updated_app), 200


# -----------------------------
# DELETE an application by ID
# -----------------------------
@application_bp.route("/delete/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    success = application_service.delete_application(user_id, app_id)
    if not success:
        return jsonify({"error": "Not found"}), 404

    return jsonify({"message": "Application deleted"}), 200
