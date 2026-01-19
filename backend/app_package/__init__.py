from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from flask_migrate import Migrate

db = SQLAlchemy()
migrate= Migrate()

def create_app():
    app = Flask(__name__)

    load_dotenv()

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret_key")

    # Initialize database
    db.init_app(app)
    
    # Initialize Flask-Migrate
    migrate.init_app(app, db)

    # Allow frontend to talk to backend
    CORS(
        app,
        origins=["http://localhost:3000"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Import models so SQLAlchemy detects them
    from . import models

    # Import blueprints
    from .routes.auth_route import auth_bp
    from .routes.ai_route import ai_bp
    from .routes.application_route import application_bp
    from .routes.resume_route import resume_bp
    from .routes.cover_letter_route import cover_letter_bp
    from .routes.job_route import job_bp

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")
    app.register_blueprint(application_bp, url_prefix="/api/applications")
    app.register_blueprint(resume_bp, url_prefix="/api/resumes")
    app.register_blueprint(cover_letter_bp, url_prefix="/api/cover-letters")
    app.register_blueprint(job_bp, url_prefix="/api/jobs")

    @app.route("/")
    def home():
        return "Backend running on port 5000!"

    return app