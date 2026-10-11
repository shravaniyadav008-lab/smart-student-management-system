from flask import Blueprint, request, jsonify, session

from app.models import db, User, Student, Course, Attendance, Result

from werkzeug.security import check_password_hash, generate_password_hash


routes = Blueprint("routes", __name__)


# =========================================================
# ADD STUDENT
# =========================================================

@routes.route("/api/students", methods=["POST"])
def add_student():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    student_id = data.get("student_id")
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    year = data.get("year")

    if not student_id or not full_name or not email or not phone or not year:
        return jsonify({
            "success": False,
            "message": "Please fill all required fields."
        }), 400

    existing_student = Student.query.filter_by(
        student_id=student_id
    ).first()

    if existing_student:
        return jsonify({
            "success": False,
            "message": "Student ID already exists."
        }), 400

    existing_email = Student.query.filter_by(
        email=email
    ).first()

    if existing_email:
        return jsonify({
            "success": False,
            "message": "Email already exists."
        }), 400

    new_student = Student(
        student_id=student_id,
        full_name=full_name,
        email=email,
        phone=phone,
        date_of_birth=data.get("date_of_birth"),
        gender=data.get("gender"),
        address=data.get("address"),
        year=year,
        admission_date=data.get("admission_date"),
        status="Active"
    )

    db.session.add(new_student)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Student added successfully.",
        "student": {
            "id": new_student.id,
            "student_id": new_student.student_id,
            "full_name": new_student.full_name,
            "email": new_student.email,
            "phone": new_student.phone,
            "year": new_student.year,
            "status": new_student.status
        }
    }), 201


# =========================================================
# GET ALL STUDENTS
# =========================================================

@routes.route("/api/students", methods=["GET"])
def get_students():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    students = Student.query.order_by(
        Student.id.desc()
    ).all()

    student_list = []

    for student in students:

        student_list.append({
            "id": student.id,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "phone": student.phone,
            "date_of_birth": student.date_of_birth,
            "gender": student.gender,
            "address": student.address,
            "year": student.year,
            "admission_date": student.admission_date,
            "status": student.status
        })

    return jsonify({
        "success": True,
        "students": student_list
    })


# =========================================================
# UPDATE STUDENT
# =========================================================

@routes.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    data = request.get_json()

    student_id_value = data.get("student_id")
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    year = data.get("year")

    if (
        not student_id_value
        or not full_name
        or not email
        or not phone
        or not year
    ):
        return jsonify({
            "success": False,
            "message": "Please fill all required fields."
        }), 400

    existing_student = Student.query.filter(
        Student.student_id == student_id_value,
        Student.id != student_id
    ).first()

    if existing_student:
        return jsonify({
            "success": False,
            "message": "Student ID already exists."
        }), 400

    existing_email = Student.query.filter(
        Student.email == email,
        Student.id != student_id
    ).first()

    if existing_email:
        return jsonify({
            "success": False,
            "message": "Email already exists."
        }), 400

    student.student_id = student_id_value
    student.full_name = full_name
    student.email = email
    student.phone = phone
    student.date_of_birth = data.get("date_of_birth")
    student.gender = data.get("gender")
    student.address = data.get("address")
    student.year = year
    student.admission_date = data.get("admission_date")

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Student updated successfully."
    })


# =========================================================
# DELETE STUDENT
# =========================================================

@routes.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    db.session.delete(student)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Student deleted successfully."
    })


# =========================================================
# DASHBOARD STATISTICS
# =========================================================

@routes.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    total_students = Student.query.count()

    male_students = Student.query.filter_by(
        gender="Male"
    ).count()

    female_students = Student.query.filter_by(
        gender="Female"
    ).count()

    total_courses = Course.query.count()

    recent_students = Student.query.order_by(
        Student.created_at.desc()
    ).limit(5).all()

    students_data = []

    for student in recent_students:

        students_data.append({
            "id": student.id,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "email": student.email,
            "gender": student.gender,
            "year": student.year,
            "status": student.status,
            "course_name": (
                student.course.course_name
                if student.course
                else "-"
            )
        })

    return jsonify({
        "success": True,
        "data": {
            "total_students": total_students,
            "male_students": male_students,
            "female_students": female_students,
            "total_courses": total_courses,
            "recent_students": students_data
        }
    })


# =========================================================
# ADD COURSE
# =========================================================

@routes.route("/api/courses", methods=["POST"])
def add_course():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    course_code = data.get("course_code", "").strip()
    course_name = data.get("course_name", "").strip()
    department = data.get("department", "").strip()
    duration = data.get("duration", "").strip()

    if not course_code or not course_name or not department:
        return jsonify({
            "success": False,
            "message": (
                "Course code, course name and department "
                "are required."
            )
        }), 400

    existing_course = Course.query.filter_by(
        course_code=course_code
    ).first()

    if existing_course:
        return jsonify({
            "success": False,
            "message": "Course code already exists."
        }), 409

    new_course = Course(
        course_code=course_code,
        course_name=course_name,
        department=department,
        duration=duration
    )

    db.session.add(new_course)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Course added successfully.",
        "course": {
            "id": new_course.id,
            "course_code": new_course.course_code,
            "course_name": new_course.course_name,
            "department": new_course.department,
            "duration": new_course.duration,
            "student_count": 0
        }
    }), 201


# =========================================================
# GET ALL COURSES
# =========================================================

@routes.route("/api/courses", methods=["GET"])
def get_courses():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    courses = Course.query.order_by(
        Course.created_at.desc()
    ).all()

    courses_data = []

    for course in courses:

        student_count = Student.query.filter_by(
            course_id=course.id
        ).count()

        courses_data.append({
            "id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "department": course.department,
            "duration": course.duration or "-",
            "student_count": student_count
        })

    return jsonify({
        "success": True,
        "courses": courses_data
    })


# =========================================================
# GET SINGLE COURSE
# =========================================================

@routes.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course(course_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    course = db.session.get(Course, course_id)

    if not course:
        return jsonify({
            "success": False,
            "message": "Course not found."
        }), 404

    student_count = Student.query.filter_by(
        course_id=course.id
    ).count()

    return jsonify({
        "success": True,
        "course": {
            "id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "department": course.department,
            "duration": course.duration or "-",
            "student_count": student_count
        }
    })


# =========================================================
# UPDATE COURSE
# =========================================================

@routes.route("/api/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    course = db.session.get(Course, course_id)

    if not course:
        return jsonify({
            "success": False,
            "message": "Course not found."
        }), 404

    data = request.get_json()

    course_code = data.get("course_code", "").strip()
    course_name = data.get("course_name", "").strip()
    department = data.get("department", "").strip()
    duration = data.get("duration", "").strip()

    if not course_code or not course_name or not department:
        return jsonify({
            "success": False,
            "message": (
                "Course code, course name and department "
                "are required."
            )
        }), 400

    duplicate_course = Course.query.filter(
        Course.course_code == course_code,
        Course.id != course_id
    ).first()

    if duplicate_course:
        return jsonify({
            "success": False,
            "message": "Course code already exists."
        }), 409

    course.course_code = course_code
    course.course_name = course_name
    course.department = department
    course.duration = duration

    db.session.commit()

    student_count = Student.query.filter_by(
        course_id=course.id
    ).count()

    return jsonify({
        "success": True,
        "message": "Course updated successfully.",
        "course": {
            "id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "department": course.department,
            "duration": course.duration or "-",
            "student_count": student_count
        }
    })


# =========================================================
# DELETE COURSE
# =========================================================

@routes.route("/api/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    course = db.session.get(Course, course_id)

    if not course:
        return jsonify({
            "success": False,
            "message": "Course not found."
        }), 404

    student_count = Student.query.filter_by(
        course_id=course.id
    ).count()

    if student_count > 0:
        return jsonify({
            "success": False,
            "message": (
                f"Cannot delete this course because "
                f"{student_count} student(s) are assigned to it."
            )
        }), 409

    db.session.delete(course)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Course deleted successfully."
    })


# =========================================================
# ATTENDANCE MANAGEMENT
# =========================================================

@routes.route("/api/attendance", methods=["POST"])
def add_attendance():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    student_id = data.get("student_id")
    attendance_date = data.get(
        "attendance_date",
        ""
    ).strip()

    status = data.get(
        "status",
        ""
    ).strip()

    if not student_id or not attendance_date or not status:
        return jsonify({
            "success": False,
            "message": "Student, date and status are required."
        }), 400

    student = db.session.get(Student, student_id)

    if not student:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    if status not in ["Present", "Absent"]:
        return jsonify({
            "success": False,
            "message": "Invalid attendance status."
        }), 400

    existing_attendance = Attendance.query.filter_by(
        student_id=student_id,
        attendance_date=attendance_date
    ).first()

    if existing_attendance:
        return jsonify({
            "success": False,
            "message": "Attendance already marked for this date."
        }), 409

    new_attendance = Attendance(
        student_id=student_id,
        attendance_date=attendance_date,
        status=status
    )

    db.session.add(new_attendance)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Attendance marked successfully.",
        "attendance": {
            "id": new_attendance.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "attendance_date": new_attendance.attendance_date,
            "status": new_attendance.status
        }
    }), 201


# =========================================================
# GET ATTENDANCE
# =========================================================

@routes.route("/api/attendance", methods=["GET"])
def get_attendance():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    attendance_records = Attendance.query.order_by(
        Attendance.attendance_date.desc(),
        Attendance.id.desc()
    ).all()

    attendance_data = []

    for record in attendance_records:

        student = record.student

        attendance_data.append({
            "id": record.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_code": student.student_id,
            "email": student.email,
            "attendance_date": record.attendance_date,
            "status": record.status
        })

    return jsonify({
        "success": True,
        "attendance": attendance_data
    })


# =========================================================
# DELETE ATTENDANCE
# =========================================================

@routes.route(
    "/api/attendance/<int:attendance_id>",
    methods=["DELETE"]
)
def delete_attendance(attendance_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    attendance = db.session.get(
        Attendance,
        attendance_id
    )

    if not attendance:
        return jsonify({
            "success": False,
            "message": "Attendance record not found."
        }), 404

    db.session.delete(attendance)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Attendance deleted successfully."
    })


# =========================================================
# ADD RESULT
# =========================================================

@routes.route("/api/results", methods=["POST"])
def add_result():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    data = request.get_json()

    student_id = data.get("student_id")
    subject = data.get(
        "subject",
        ""
    ).strip()

    marks = data.get("marks")
    total_marks = data.get(
        "total_marks",
        100
    )

    if not student_id or not subject or marks is None:
        return jsonify({
            "success": False,
            "message": "Student, subject and marks are required."
        }), 400

    student = db.session.get(
        Student,
        student_id
    )

    if not student:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    try:
        marks = float(marks)
        total_marks = float(total_marks)

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "message": "Marks must be a valid number."
        }), 400

    if total_marks <= 0:
        return jsonify({
            "success": False,
            "message": "Total marks must be greater than zero."
        }), 400

    if marks < 0 or marks > total_marks:
        return jsonify({
            "success": False,
            "message": "Marks must be between 0 and total marks."
        }), 400

    percentage = (
        marks / total_marks
    ) * 100

    if percentage >= 90:
        grade = "A+"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B+"
    elif percentage >= 60:
        grade = "B"
    elif percentage >= 50:
        grade = "C"
    elif percentage >= 40:
        grade = "D"
    else:
        grade = "F"

    new_result = Result(
        student_id=student_id,
        subject=subject,
        marks=marks,
        total_marks=total_marks,
        grade=grade
    )

    db.session.add(new_result)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Result added successfully.",
        "result": {
            "id": new_result.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_code": student.student_id,
            "subject": new_result.subject,
            "marks": new_result.marks,
            "total_marks": new_result.total_marks,
            "grade": new_result.grade
        }
    }), 201


# =========================================================
# GET RESULTS
# =========================================================

@routes.route("/api/results", methods=["GET"])
def get_results():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    results = Result.query.order_by(
        Result.created_at.desc(),
        Result.id.desc()
    ).all()

    results_data = []

    for result in results:

        student = result.student

        results_data.append({
            "id": result.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_code": student.student_id,
            "subject": result.subject,
            "marks": result.marks,
            "total_marks": result.total_marks,
            "grade": result.grade
        })

    return jsonify({
        "success": True,
        "results": results_data
    })


# =========================================================
# UPDATE RESULT
# =========================================================

@routes.route(
    "/api/results/<int:result_id>",
    methods=["PUT"]
)
def update_result(result_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    result = db.session.get(
        Result,
        result_id
    )

    if not result:
        return jsonify({
            "success": False,
            "message": "Result not found."
        }), 404

    data = request.get_json()

    student_id = data.get("student_id")

    subject = data.get(
        "subject",
        ""
    ).strip()

    marks = data.get("marks")

    total_marks = data.get(
        "total_marks",
        100
    )

    if not student_id or not subject or marks is None:
        return jsonify({
            "success": False,
            "message": "Student, subject and marks are required."
        }), 400

    student = db.session.get(
        Student,
        student_id
    )

    if not student:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    try:
        marks = float(marks)
        total_marks = float(total_marks)

    except (TypeError, ValueError):

        return jsonify({
            "success": False,
            "message": "Marks must be a valid number."
        }), 400

    if total_marks <= 0:
        return jsonify({
            "success": False,
            "message": "Total marks must be greater than zero."
        }), 400

    if marks < 0 or marks > total_marks:
        return jsonify({
            "success": False,
            "message": "Marks must be between 0 and total marks."
        }), 400

    percentage = (
        marks / total_marks
    ) * 100

    if percentage >= 90:
        grade = "A+"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B+"
    elif percentage >= 60:
        grade = "B"
    elif percentage >= 50:
        grade = "C"
    elif percentage >= 40:
        grade = "D"
    else:
        grade = "F"

    result.student_id = student_id
    result.subject = subject
    result.marks = marks
    result.total_marks = total_marks
    result.grade = grade

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Result updated successfully.",
        "result": {
            "id": result.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "student_code": student.student_id,
            "subject": result.subject,
            "marks": result.marks,
            "total_marks": result.total_marks,
            "grade": result.grade
        }
    })


# =========================================================
# DELETE RESULT
# =========================================================

@routes.route(
    "/api/results/<int:result_id>",
    methods=["DELETE"]
)
def delete_result(result_id):

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    result = db.session.get(
        Result,
        result_id
    )

    if not result:
        return jsonify({
            "success": False,
            "message": "Result not found."
        }), 404

    db.session.delete(result)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Result deleted successfully."
    })


# =========================================================
# SETTINGS - GET PROFILE
# =========================================================

@routes.route(
    "/api/settings/profile",
    methods=["GET"]
)
def get_profile():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    user = db.session.get(
        User,
        session["user_id"]
    )

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    })


# =========================================================
# SETTINGS - UPDATE PROFILE
# =========================================================

@routes.route(
    "/api/settings/profile",
    methods=["PUT"]
)
def update_profile():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    user = db.session.get(
        User,
        session["user_id"]
    )

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    data = request.get_json()

    name = data.get(
        "name",
        ""
    ).strip()

    email = data.get(
        "email",
        ""
    ).strip()

    if not name or not email:
        return jsonify({
            "success": False,
            "message": "Name and email are required."
        }), 400

    existing_user = User.query.filter(
        User.email == email,
        User.id != user.id
    ).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "Email is already in use."
        }), 409

    user.name = name
    user.email = email

    session["user_name"] = name

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Profile updated successfully.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    })


# =========================================================
# SETTINGS - CHANGE PASSWORD
# =========================================================

@routes.route(
    "/api/settings/password",
    methods=["PUT"]
)
def change_password():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Unauthorized"
        }), 401

    user = db.session.get(
        User,
        session["user_id"]
    )

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404

    data = request.get_json()

    current_password = data.get(
        "current_password",
        ""
    )

    new_password = data.get(
        "new_password",
        ""
    )

    confirm_password = data.get(
        "confirm_password",
        ""
    )

    if (
        not current_password
        or not new_password
        or not confirm_password
    ):
        return jsonify({
            "success": False,
            "message": "All password fields are required."
        }), 400

    if not check_password_hash(
        user.password,
        current_password
    ):
        return jsonify({
            "success": False,
            "message": "Current password is incorrect."
        }), 400

    if new_password != confirm_password:
        return jsonify({
            "success": False,
            "message": "New passwords do not match."
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "message": (
                "New password must contain at least 6 characters."
            )
        }), 400

    user.password = generate_password_hash(
        new_password
    )

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Password changed successfully."
    })