from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)

    course_code = db.Column(db.String(20), unique=True, nullable=False)

    course_name = db.Column(db.String(100), nullable=False)

    department = db.Column(db.String(100), nullable=False)

    duration = db.Column(db.String(50))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    students = db.relationship(
        "Student",
        backref="course",
        lazy=True
    )


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.String(20),
        unique=True,
        nullable=False
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20),
        nullable=False
    )

    date_of_birth = db.Column(
        db.String(20)
    )

    gender = db.Column(
        db.String(20)
    )

    address = db.Column(
        db.Text
    )

    year = db.Column(
        db.String(20)
    )

    admission_date = db.Column(
        db.String(20)
    )

    status = db.Column(
        db.String(20),
        default="Active"
    )

    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id"),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False
    )

    attendance_date = db.Column(
        db.String(20),
        nullable=False
    )

    status = db.Column(
        db.String(20),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    student = db.relationship(
        "Student",
        backref="attendance_records"
    )

class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False
    )

    subject = db.Column(
        db.String(100),
        nullable=False
    )

    marks = db.Column(
        db.Float,
        nullable=False
    )

    total_marks = db.Column(
        db.Float,
        nullable=False,
        default=100
    )

    grade = db.Column(
        db.String(10),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    student = db.relationship(
        "Student",
        backref="result_records"
    )    