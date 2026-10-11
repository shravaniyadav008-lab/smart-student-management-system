from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    session,
    flash
)

from werkzeug.security import (
    check_password_hash,
    generate_password_hash
)

from app.models import db, User


auth = Blueprint("auth", __name__)


# =========================
# LOGIN
# =========================

@auth.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form.get("email")
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):

            session["user_id"] = user.id
            session["user_name"] = user.name

            return redirect(url_for("dashboard"))

        flash("Invalid email or password.", "error")

    return render_template("login.html")


# =========================
# REGISTER
# =========================

@auth.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")


        # Check password
        if password != confirm_password:

            flash("Passwords do not match.", "error")

            return redirect(url_for("auth.register"))


        # Check existing email
        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:

            flash(
                "An account with this email already exists.",
                "error"
            )

            return redirect(url_for("auth.register"))


        # Create new user
        new_user = User(
            name=name,
            email=email,
            password=generate_password_hash(password)
        )


        db.session.add(new_user)

        db.session.commit()


        flash(
            "Registration successful. Please login.",
            "success"
        )

        return redirect(url_for("auth.login"))


    return render_template("register.html")


# =========================
# LOGOUT
# =========================

@auth.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("auth.login"))