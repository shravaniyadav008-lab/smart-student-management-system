let attendanceRecords = [];
let allStudents = [];
let selectedAttendanceId = null;


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function() {

    setDefaultAttendanceDate();

    loadStudents();

    loadAttendance();

    setupAttendanceEvents();

});


// =========================================================
// SET TODAY'S DATE
// =========================================================

function setDefaultAttendanceDate() {

    const dateInput = document.getElementById("attendance_date");

    if (dateInput) {

        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        dateInput.value = `${year}-${month}-${day}`;
    }

}


// =========================================================
// LOAD STUDENTS
// =========================================================

async function loadStudents() {

    try {

        const response = await fetch("/api/students");

        const result = await response.json();

        if (!result.success) {
            return;
        }

        allStudents = result.students || [];

        populateStudentDropdown();

    } catch (error) {

        console.error("Students loading error:", error);

    }

}


// =========================================================
// POPULATE STUDENT DROPDOWN
// =========================================================

function populateStudentDropdown() {

    const select = document.getElementById(
        "attendance_student_id"
    );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">Select Student</option>
    `;

    allStudents.forEach(function(student) {

        const option = document.createElement("option");

        option.value = student.id;

        option.textContent =
            `${student.full_name} (${student.student_id})`;

        select.appendChild(option);

    });

}


// =========================================================
// LOAD ATTENDANCE
// =========================================================

async function loadAttendance() {

    const tableBody =
        document.getElementById("attendanceTableBody");

    if (!tableBody) {
        return;
    }

    try {

        const response =
            await fetch("/api/attendance");

        const result =
            await response.json();

        if (!result.success) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p>Unable to load attendance.</p>
                            <small>Please try again.</small>
                        </div>
                    </td>
                </tr>
            `;

            return;
        }

        attendanceRecords =
            result.attendance || [];

        displayAttendance(attendanceRecords);

    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>Unable to load attendance.</p>
                        <small>Please try again.</small>
                    </div>
                </td>
            </tr>
        `;

    }

}


// =========================================================
// DISPLAY ATTENDANCE
// =========================================================

function displayAttendance(records) {

    const tableBody =
        document.getElementById("attendanceTableBody");

    const count =
        document.getElementById("attendanceCount");

    if (!tableBody) {
        return;
    }

    if (!records || records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div>
                        <i class="fa-solid fa-calendar-check"></i>
                        <p>No attendance records found.</p>
                        <small>Mark attendance to see records here.</small>
                    </div>
                </td>
            </tr>
        `;

        if (count) {
            count.textContent =
                "Showing 0 attendance records";
        }

        return;
    }


    tableBody.innerHTML = "";


    records.forEach(function(attendance) {

        const row =
            document.createElement("tr");


        const statusClass =
            attendance.status === "Present" ?
            "attendance-present" :
            "attendance-absent";


        row.innerHTML = `

            <td>

                <div class="attendance-student-info">

                    <div class="attendance-student-avatar">

                        ${attendance.student_name
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div>

                        <strong>
                            ${attendance.student_name}
                        </strong>

                        <span>
                            ${attendance.email || "-"}
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${attendance.student_code || "-"}
            </td>


            <td>
                ${formatAttendanceDate(
                    attendance.attendance_date
                )}
            </td>


            <td>

                <span class="attendance-status ${statusClass}">

                    <i class="fa-solid ${
                        attendance.status === "Present"
                            ? "fa-check"
                            : "fa-xmark"
                    }"></i>

                    ${attendance.status}

                </span>

            </td>


            <td>

                <div class="attendance-actions">

                    <button
                        type="button"
                        class="attendance-action-btn delete-action-btn"
                        title="Delete Attendance"
                        onclick="deleteAttendance(${attendance.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;

        tableBody.appendChild(row);

    });


    if (count) {

        count.textContent =
            `Showing ${records.length} attendance record${
                records.length === 1 ? "" : "s"
            }`;

    }

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatAttendanceDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// SEARCH + FILTER
// =========================================================

function filterAttendance() {

    const searchInput =
        document.getElementById(
            "attendanceSearch"
        );

    const dateInput =
        document.getElementById(
            "attendanceDateFilter"
        );

    const statusInput =
        document.getElementById(
            "attendanceStatusFilter"
        );


    const search =
        searchInput ?
        searchInput.value.toLowerCase().trim() :
        "";


    const selectedDate =
        dateInput ?
        dateInput.value :
        "";


    const selectedStatus =
        statusInput ?
        statusInput.value :
        "";


    const filtered =
        attendanceRecords.filter(function(attendance) {

            const studentName =
                (attendance.student_name || "")
                .toLowerCase();

            const studentCode =
                (attendance.student_code || "")
                .toLowerCase();


            const matchesSearch = !search ||
                studentName.includes(search) ||
                studentCode.includes(search);


            const matchesDate = !selectedDate ||
                attendance.attendance_date === selectedDate;


            const matchesStatus = !selectedStatus ||
                attendance.status === selectedStatus;


            return (
                matchesSearch &&
                matchesDate &&
                matchesStatus
            );

        });


    displayAttendance(filtered);

}


// =========================================================
// RESET FILTERS
// =========================================================

function resetAttendanceFilters() {

    const search =
        document.getElementById(
            "attendanceSearch"
        );

    const date =
        document.getElementById(
            "attendanceDateFilter"
        );

    const status =
        document.getElementById(
            "attendanceStatusFilter"
        );


    if (search) {
        search.value = "";
    }

    if (date) {
        date.value = "";
    }

    if (status) {
        status.value = "";
    }


    displayAttendance(attendanceRecords);

}


// =========================================================
// MODAL EVENTS
// =========================================================

function setupAttendanceEvents() {

    const openBtn =
        document.getElementById(
            "openAttendanceModal"
        );

    const closeBtn =
        document.getElementById(
            "closeAttendanceModal"
        );

    const cancelBtn =
        document.getElementById(
            "cancelAttendanceModal"
        );

    const modal =
        document.getElementById(
            "attendanceModal"
        );

    const form =
        document.getElementById(
            "attendanceForm"
        );


    if (openBtn) {

        openBtn.addEventListener(
            "click",
            function() {

                resetAttendanceForm();

                if (modal) {
                    modal.classList.add("show");
                }

            }
        );

    }


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeAttendanceModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeAttendanceModal
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            submitAttendance
        );

    }


    const search =
        document.getElementById(
            "attendanceSearch"
        );

    const dateFilter =
        document.getElementById(
            "attendanceDateFilter"
        );

    const statusFilter =
        document.getElementById(
            "attendanceStatusFilter"
        );

    const resetBtn =
        document.getElementById(
            "resetAttendanceFilters"
        );


    if (search) {
        search.addEventListener(
            "input",
            filterAttendance
        );
    }


    if (dateFilter) {
        dateFilter.addEventListener(
            "change",
            filterAttendance
        );
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            filterAttendance
        );
    }


    if (resetBtn) {
        resetBtn.addEventListener(
            "click",
            resetAttendanceFilters
        );
    }


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (event.target === modal) {
                    closeAttendanceModal();
                }

            }
        );

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeAttendanceModal() {

    const modal =
        document.getElementById(
            "attendanceModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

}


// =========================================================
// RESET FORM
// =========================================================

function resetAttendanceForm() {

    const form =
        document.getElementById(
            "attendanceForm"
        );

    if (form) {
        form.reset();
    }

    setDefaultAttendanceDate();

}


// =========================================================
// SUBMIT ATTENDANCE
// =========================================================

async function submitAttendance(event) {

    event.preventDefault();


    const studentId =
        document.getElementById(
            "attendance_student_id"
        ).value;


    const attendanceDate =
        document.getElementById(
            "attendance_date"
        ).value;


    const status =
        document.getElementById(
            "attendance_status"
        ).value;


    if (!studentId ||
        !attendanceDate ||
        !status) {

        alert(
            "Please fill all attendance details."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/attendance", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        student_id: Number(studentId),

                        attendance_date: attendanceDate,

                        status: status
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            alert(
                result.message ||
                "Unable to mark attendance."
            );

            return;
        }


        alert(
            "Attendance marked successfully."
        );


        closeAttendanceModal();

        resetAttendanceForm();

        loadAttendance();


    } catch (error) {

        console.error(
            "Attendance submit error:",
            error
        );

        alert(
            "Something went wrong while marking attendance."
        );

    }

}


// =========================================================
// DELETE ATTENDANCE
// =========================================================

async function deleteAttendance(
    attendanceId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/attendance/${attendanceId}`, {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            alert(
                result.message ||
                "Unable to delete attendance."
            );

            return;
        }


        alert(
            "Attendance deleted successfully."
        );


        loadAttendance();


    } catch (error) {

        console.error(
            "Attendance delete error:",
            error
        );

        alert(
            "Something went wrong while deleting attendance."
        );

    }

}