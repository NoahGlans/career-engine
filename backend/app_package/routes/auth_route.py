# backend/app_package/routes/auth_route.py
from flask import Blueprint, request, jsonify, session
from ..services import user_service

auth_bp = Blueprint("auth_bp", __name__)

# -----------------------------
# Helper: Serialize user
# -----------------------------
def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at
    }

# -----------------------------
# Register
# -----------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    # Check if user already exists
    if user_service.get_user_by_email(data["email"]):
        return jsonify({"error": "User already exists"}), 400

    new_user = user_service.create_user(data)
    if not new_user:
        return jsonify({"error": "Registration failed"}), 500

    return jsonify({"message": "User registered successfully", "user": serialize_user(new_user)}), 201

# -----------------------------
# Login
# -----------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    user = user_service.get_user_by_username(data["username"])
    if not user or not user_service.verify_user_password(user, data["password"]):
        return jsonify({"error": "Invalid username or password"}), 401

    session["user_id"] = user.id
    session["logged_in"] = True

    return jsonify({"message": "Login successful", "user": serialize_user(user)}), 200

# -----------------------------
# Logout
# -----------------------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# -----------------------------
# Current logged-in user
# -----------------------------
@auth_bp.route("/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    from app_package.services import user_service

    user = user_service.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": user.id, "username": user.username, "email": user.email}), 200
