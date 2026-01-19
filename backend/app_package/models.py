from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from . import db

# ==========================
# User Model
# ==========================
class User(db.Model):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Relationships
    resumes = db.relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = db.relationship("Application", back_populates="user", cascade="all, delete-orphan")
    jobs = db.relationship(
    "Job",
    back_populates="user",
    cascade="all, delete-orphan"
)

# ==========================
# Job Model
# ==========================
class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255))
    job_url = db.Column(db.String(500))
    description = db.Column(db.Text)
    date_posted = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    deadline = db.Column(db.DateTime)
    employment_type = db.Column(db.String(100), default="Full-time")

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False
    )

    # Relationships
    applications = db.relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan"
    )

    user = db.relationship("User", back_populates="jobs")

    # --------------------------------
    # Convert to dictionary for JSON
    # --------------------------------
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "job_url": self.job_url,
            "description": self.description,
            "date_posted": self.date_posted.isoformat() if self.date_posted else None,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "employment_type": self.employment_type,
            "user_id": self.user_id,
        }
    
    
# ==========================
# Resume Model
# ==========================
class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    title = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Foreign Key
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False
    )

    # Relationships
    user = db.relationship("User", back_populates="resumes")
    applications = db.relationship("Application", back_populates="resume")



# ==========================
# Application Model
# ==========================
class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    submitted_at = db.Column(db.DateTime)
    status = db.Column(db.String(100), default="Pending")

    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id", ondelete="SET NULL", onupdate="CASCADE"))

    # Relationships
    user = db.relationship("User", back_populates="applications")
    job = db.relationship("Job", back_populates="applications")
    resume = db.relationship("Resume", back_populates="applications")
    coverletters = db.relationship("CoverLetter", back_populates="application", cascade="all, delete-orphan")


# ==========================
# CoverLetter Model
# ==========================
class CoverLetter(db.Model):
    __tablename__ = "coverletters"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(50))
    content = db.Column(db.Text)
    status = db.Column(db.String(100), default="Draft")
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Foreign Key
    application_id = db.Column(db.Integer, db.ForeignKey("applications.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    # Relationships
    application = db.relationship("Application", back_populates="coverletters")
