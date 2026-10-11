from flask import Flask, redirect, url_for
from config import Config
from app.models import db, User
from werkzeug.security import generate_password_hash


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    # =========================
    # INITIALIZE DATABASE
    # =========================

    db.init_app(app)


    # =========================
    # REGISTER AUTH BLUEPRINT
    # =========================

    from app.auth import auth

    app.register_blueprint(auth)


    # =========================
    # REGISTER API BLUEPRINT
    # =========================

    from app.routes import routes

    app.register_blueprint(routes)


    # =========================
    # DATABASE
    # =========================

    with app.app_context():

        db.create_all()


        # Create default admin account
        admin = User.query.filter_by(
            email="admin@student.com"
        ).first()


        if not admin:

            admin = User(
                name="Administrator",
                email="admin@student.com",
                password=generate_password_hash("Admin@123")
            )

            db.session.add(admin)

            db.session.commit()


    # =========================
    # HOME
    # =========================

    @app.route("/")
    def home():

        return redirect(
            url_for("auth.login")
        )


    # =========================
    # DASHBOARD
    # =========================

    @app.route("/dashboard")
    def dashboard():

        from flask import session, render_template


        if "user_id" not in session:

            return redirect(
                url_for("auth.login")
            )


        return render_template(
            "dashboard.html"
        )


    # =========================
    # STUDENTS PAGE
    # =========================

    @app.route("/students")
    def students():

        from flask import session, render_template


        if "user_id" not in session:

            return redirect(
                url_for("auth.login")
            )


        return render_template(
            "students.html"
        )


    # =========================
    # COURSES PAGE
    # =========================

    @app.route("/courses")
    def courses():

        from flask import session, render_template


        if "user_id" not in session:

            return redirect(
                url_for("auth.login")
            )


        return render_template(
            "courses.html"
        )

    @app.route("/attendance")
    def attendance():
        from flask import session, render_template

        if "user_id" not in session:
            return redirect(url_for("auth.login"))

        return render_template("attendance.html")

    @app.route("/results")
    def results():
        from flask import session, render_template

        if "user_id" not in session:
            return redirect(url_for("auth.login"))

        return render_template("results.html")

    @app.route("/settings")
    def settings():
        from flask import session, render_template

        if "user_id" not in session:
            return redirect(url_for("auth.login"))

        return render_template("settings.html")
    # =========================
    # RETURN APP
    # =========================

    return app