from ..models import User
from .. import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask import session

# -----------------------------
# Serialize
# -----------------------------
def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at
    }

# -----------------------------
# CREATE
# -----------------------------
def create_user(data: dict):
    try:
        hashed_password = generate_password_hash(data["password"])
        new_user = User(
            username=data["username"],
            email=data["email"],
            password_hash=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        return new_user
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {e}")
        return None

# -----------------------------
# READ
# -----------------------------
def get_user_by_id(user_id):
    return User.query.get(user_id)

def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def get_all_users():
    return User.query.all()

# -----------------------------
# UPDATE
# -----------------------------
def update_user(user: User, updates: dict):
    try:
        for key, value in updates.items():
            if hasattr(user, key) and key not in ["id", "password_hash"]:
                setattr(user, key, value)
        db.session.commit()
        return user
    except Exception as e:
        db.session.rollback()
        print(f"Error updating user: {e}")
        return None

# -----------------------------
# DELETE
# -----------------------------
def delete_user(user: User):
    try:
        db.session.delete(user)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting user: {e}")
        return False

# -----------------------------
# AUTH
# -----------------------------
def verify_user_password(user: User, password: str) -> bool:
    return check_password_hash(user.password_hash, password)

def get_logged_in_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return get_user_by_id(user_id)
