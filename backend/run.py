from sqlalchemy import text 
from app_package import create_app, db
from flask_migrate import Migrate
from app_package.models import User, Job, Resume, Application, CoverLetter

app = create_app()
migrate = Migrate(app, db)

if __name__ == "__main__":
    with app.app_context():
        try:
            with db.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                print("Database connection successful:", result.fetchone())
        except Exception as e:
            print("Database connection failed:", e)

    # Start server
    app.run(debug=True)
