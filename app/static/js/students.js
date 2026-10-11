// =========================================================
// STUDENT MANAGEMENT SYSTEM
// STUDENTS PAGE JAVASCRIPT
// =========================================================

let allStudents = [];
let editingStudentId = null;
let deletingStudentId = null;


// =========================================================
// ADD STUDENT MODAL
// =========================================================

const modal =
    document.getElementById("studentModal");

const openBtn =
    document.getElementById("openStudentModal");

const emptyAddBtn =
    document.getElementById("emptyAddStudent");

const closeBtn =
    document.getElementById("closeStudentModal");

const cancelBtn =
    document.getElementById("cancelStudentModal");

const studentForm =
    document.getElementById("studentForm");


// =========================================================
// EDIT STUDENT MODAL
// =========================================================

const editModal =
    document.getElementById("editStudentModal");

const closeEditBtn =
    document.getElementById("closeEditStudentModal");

const cancelEditBtn =
    document.getElementById("cancelEditStudentModal");

const editStudentForm =
    document.getElementById("editStudentForm");


// =========================================================
// VIEW STUDENT MODAL
// =========================================================

const viewModal =
    document.getElementById("viewStudentModal");

const closeViewBtn =
    document.getElementById("closeViewStudentModal");

const closeViewStudentBtn =
    document.getElementById("closeViewStudentBtn");


// =========================================================
// DELETE STUDENT MODAL
// =========================================================

const deleteModal =
    document.getElementById("deleteStudentModal");

const deleteStudentName =
    document.getElementById("deleteStudentName");

const cancelDeleteBtn =
    document.getElementById("cancelDeleteStudent");

const confirmDeleteBtn =
    document.getElementById("confirmDeleteStudent");


// =========================================================
// TABLE ELEMENTS
// =========================================================

const tableBody =
    document.getElementById("studentsTableBody");

const studentCount =
    document.getElementById("studentCount");

const searchInput =
    document.getElementById("studentSearch");

const statusFilter =
    document.getElementById("statusFilter");

const yearFilter =
    document.getElementById("yearFilter");

const resetFilters =
    document.getElementById("resetFilters");


// =========================================================
// ADD STUDENT MODAL FUNCTIONS
// =========================================================

function openStudentModal() {

    modal.classList.add("show");

    document.body.classList.add(
        "modal-open"
    );
}


function closeStudentModal() {

    modal.classList.remove("show");

    document.body.classList.remove(
        "modal-open"
    );
}


openBtn.addEventListener(
    "click",
    openStudentModal
);


emptyAddBtn.addEventListener(
    "click",
    openStudentModal
);


closeBtn.addEventListener(
    "click",
    closeStudentModal
);


cancelBtn.addEventListener(
    "click",
    closeStudentModal
);


modal.addEventListener(
    "click",
    function(event) {

        if (event.target === modal) {

            closeStudentModal();

        }

    }
);


// =========================================================
// ADD STUDENT
// =========================================================

studentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const studentData = {

            student_id: document
                .getElementById("student_id")
                .value
                .trim(),

            full_name: document
                .getElementById("full_name")
                .value
                .trim(),

            email: document
                .getElementById("email")
                .value
                .trim(),

            phone: document
                .getElementById("phone")
                .value
                .trim(),

            date_of_birth: document
                .getElementById("date_of_birth")
                .value,

            gender: document
                .getElementById("gender")
                .value,

            year: document
                .getElementById("year")
                .value,

            admission_date: document
                .getElementById("admission_date")
                .value,

            address: document
                .getElementById("address")
                .value
                .trim()
        };


        try {

            const response =
                await fetch(
                    "/api/students", {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(
                            studentData
                        )
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Student added successfully!"
                );

                studentForm.reset();

                closeStudentModal();

                await loadStudents();

            } else {

                alert(
                    result.message ||
                    "Failed to add student."
                );

            }

        } catch (error) {

            console.error(
                "Add Student Error:",
                error
            );

            alert(
                "Something went wrong. Please try again."
            );

        }

    }
);


// =========================================================
// LOAD STUDENTS
// =========================================================

async function loadStudents() {

    try {

        const response =
            await fetch(
                "/api/students"
            );


        const result =
            await response.json();


        if (!result.success) {

            console.error(
                result.message
            );

            return;
        }


        allStudents =
            result.students || [];


        displayStudents(
            allStudents
        );

    } catch (error) {

        console.error(
            "Load Students Error:",
            error
        );

    }
}


// =========================================================
// DISPLAY STUDENTS
// =========================================================

function displayStudents(students) {

    tableBody.innerHTML = "";

    studentCount.textContent =
        students.length;


    if (students.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-students">

                        <div class="empty-icon">

                            <i class="fa-solid fa-user-graduate"></i>

                        </div>

                        <h3>
                            No students found
                        </h3>

                        <p>
                            Add your first student to get started.
                        </p>

                        <button
                            type="button"
                            class="empty-add-btn"
                            id="dynamicEmptyAddStudent"
                        >

                            <i class="fa-solid fa-plus"></i>

                            Add Student

                        </button>

                    </div>

                </td>

            </tr>

        `;


        const dynamicButton =
            document.getElementById(
                "dynamicEmptyAddStudent"
            );


        dynamicButton.addEventListener(
            "click",
            openStudentModal
        );


        return;
    }


    students.forEach(
        function(student) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <strong>
                        ${student.student_id}
                    </strong>
                </td>


                <td>
                    <strong>
                        ${student.full_name}
                    </strong>
                </td>


                <td>
                    ${student.email}
                </td>


                <td>
                    ${student.phone}
                </td>


                <td>
                    ${student.year}
                </td>


                <td>

                    <span
                        class="student-status active-status"
                    >
                        ${student.status}
                    </span>

                </td>


                <td>

                    <!-- VIEW BUTTON -->

                    <button
                        type="button"
                        class="student-action-btn"
                        title="View Student"
                        onclick="viewStudent(${student.id})"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    <!-- EDIT BUTTON -->

                    <button
                        type="button"
                        class="student-action-btn"
                        title="Edit Student"
                        onclick="editStudent(${student.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <!-- DELETE BUTTON -->

                    <button
                        type="button"
                        class="student-action-btn delete-action-btn"
                        title="Delete Student"
                        onclick="openDeleteStudent(${student.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );
}


// =========================================================
// SEARCH AND FILTER
// =========================================================

function filterStudents() {

    const searchValue =
        searchInput.value
        .toLowerCase()
        .trim();


    const statusValue =
        statusFilter.value;


    const yearValue =
        yearFilter.value;


    const filteredStudents =
        allStudents.filter(
            function(student) {

                const matchesSearch =

                    student.full_name
                    .toLowerCase()
                    .includes(searchValue)

                ||

                student.student_id
                    .toLowerCase()
                    .includes(searchValue)

                ||

                student.email
                    .toLowerCase()
                    .includes(searchValue);


                const matchesStatus =

                    statusValue === ""

                ||

                student.status ===
                    statusValue;


                const matchesYear =

                    yearValue === ""

                ||

                student.year ===
                    yearValue;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesYear
                );

            }
        );


    displayStudents(
        filteredStudents
    );
}


searchInput.addEventListener(
    "input",
    filterStudents
);


statusFilter.addEventListener(
    "change",
    filterStudents
);


yearFilter.addEventListener(
    "change",
    filterStudents
);


resetFilters.addEventListener(
    "click",
    function() {

        searchInput.value = "";

        statusFilter.value = "";

        yearFilter.value = "";

        displayStudents(
            allStudents
        );

    }
);


// =========================================================
// VIEW STUDENT
// =========================================================

function viewStudent(studentId) {

    const student =
        allStudents.find(
            function(item) {

                return item.id === studentId;

            }
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;
    }


    document.getElementById(
            "view_full_name"
        ).textContent =
        student.full_name || "-";


    document.getElementById(
            "view_student_id"
        ).textContent =
        student.student_id || "-";


    document.getElementById(
            "view_status"
        ).textContent =
        student.status || "Active";


    document.getElementById(
            "view_name_detail"
        ).textContent =
        student.full_name || "-";


    document.getElementById(
            "view_email"
        ).textContent =
        student.email || "-";


    document.getElementById(
            "view_phone"
        ).textContent =
        student.phone || "-";


    document.getElementById(
            "view_date_of_birth"
        ).textContent =
        student.date_of_birth || "-";


    document.getElementById(
            "view_gender"
        ).textContent =
        student.gender || "-";


    document.getElementById(
            "view_year"
        ).textContent =
        student.year || "-";


    document.getElementById(
            "view_admission_date"
        ).textContent =
        student.admission_date || "-";


    document.getElementById(
            "view_address"
        ).textContent =
        student.address || "-";


    viewModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );
}


// =========================================================
// CLOSE VIEW MODAL
// =========================================================

function closeViewStudentModal() {

    viewModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );
}


closeViewBtn.addEventListener(
    "click",
    closeViewStudentModal
);


closeViewStudentBtn.addEventListener(
    "click",
    closeViewStudentModal
);


viewModal.addEventListener(
    "click",
    function(event) {

        if (event.target === viewModal) {

            closeViewStudentModal();

        }

    }
);


// =========================================================
// EDIT STUDENT
// =========================================================

function editStudent(studentId) {

    const student =
        allStudents.find(
            function(item) {

                return item.id === studentId;

            }
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;
    }


    editingStudentId =
        student.id;


    document.getElementById(
            "edit_student_id"
        ).value =
        student.student_id || "";


    document.getElementById(
            "edit_full_name"
        ).value =
        student.full_name || "";


    document.getElementById(
            "edit_email"
        ).value =
        student.email || "";


    document.getElementById(
            "edit_phone"
        ).value =
        student.phone || "";


    document.getElementById(
            "edit_date_of_birth"
        ).value =
        student.date_of_birth || "";


    document.getElementById(
            "edit_gender"
        ).value =
        student.gender || "";


    document.getElementById(
            "edit_year"
        ).value =
        student.year || "";


    document.getElementById(
            "edit_admission_date"
        ).value =
        student.admission_date || "";


    document.getElementById(
            "edit_address"
        ).value =
        student.address || "";


    editModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );
}


// =========================================================
// CLOSE EDIT MODAL
// =========================================================

function closeEditStudentModal() {

    editModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    editingStudentId = null;
}


closeEditBtn.addEventListener(
    "click",
    closeEditStudentModal
);


cancelEditBtn.addEventListener(
    "click",
    closeEditStudentModal
);


editModal.addEventListener(
    "click",
    function(event) {

        if (event.target === editModal) {

            closeEditStudentModal();

        }

    }
);


// =========================================================
// UPDATE STUDENT
// =========================================================

editStudentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!editingStudentId) {

            alert(
                "No student selected."
            );

            return;
        }


        const updatedStudent = {

            student_id: document
                .getElementById(
                    "edit_student_id"
                )
                .value
                .trim(),

            full_name: document
                .getElementById(
                    "edit_full_name"
                )
                .value
                .trim(),

            email: document
                .getElementById(
                    "edit_email"
                )
                .value
                .trim(),

            phone: document
                .getElementById(
                    "edit_phone"
                )
                .value
                .trim(),

            date_of_birth: document
                .getElementById(
                    "edit_date_of_birth"
                )
                .value,

            gender: document
                .getElementById(
                    "edit_gender"
                )
                .value,

            year: document
                .getElementById(
                    "edit_year"
                )
                .value,

            admission_date: document
                .getElementById(
                    "edit_admission_date"
                )
                .value,

            address: document
                .getElementById(
                    "edit_address"
                )
                .value
                .trim()
        };


        try {

            const response =
                await fetch(
                    `/api/students/${editingStudentId}`, {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(
                            updatedStudent
                        )
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                alert(
                    "Student updated successfully!"
                );


                closeEditStudentModal();


                await loadStudents();

            } else {

                alert(
                    result.message ||
                    "Failed to update student."
                );

            }

        } catch (error) {

            console.error(
                "Update Student Error:",
                error
            );


            alert(
                "Something went wrong. Please try again."
            );

        }

    }
);


// =========================================================
// OPEN DELETE MODAL
// =========================================================

function openDeleteStudent(studentId) {

    const student =
        allStudents.find(
            function(item) {

                return item.id === studentId;

            }
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;
    }


    deletingStudentId =
        student.id;


    deleteStudentName.textContent =
        student.full_name;


    deleteModal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );
}


// =========================================================
// CLOSE DELETE MODAL
// =========================================================

function closeDeleteStudentModal() {

    deleteModal.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    deletingStudentId = null;
}


cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteStudentModal
);


deleteModal.addEventListener(
    "click",
    function(event) {

        if (event.target === deleteModal) {

            closeDeleteStudentModal();

        }

    }
);


// =========================================================
// CONFIRM DELETE
// =========================================================

confirmDeleteBtn.addEventListener(
    "click",
    async function() {

        if (!deletingStudentId) {

            return;
        }


        try {

            const response =
                await fetch(
                    `/api/students/${deletingStudentId}`, {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            if (result.success) {

                closeDeleteStudentModal();


                await loadStudents();


                alert(
                    "Student deleted successfully!"
                );

            } else {

                alert(
                    result.message ||
                    "Failed to delete student."
                );

            }

        } catch (error) {

            console.error(
                "Delete Student Error:",
                error
            );


            alert(
                "Something went wrong. Please try again."
            );

        }

    }
);


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            if (
                modal.classList.contains("show")
            ) {

                closeStudentModal();

            }


            if (
                editModal.classList.contains("show")
            ) {

                closeEditStudentModal();

            }


            if (
                viewModal.classList.contains("show")
            ) {

                closeViewStudentModal();

            }


            if (
                deleteModal.classList.contains("show")
            ) {

                closeDeleteStudentModal();

            }

        }

    }
);


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadStudents();

    }
);