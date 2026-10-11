/* =========================================================
   COURSE MANAGEMENT
========================================================= */

let allCourses = [];
let currentEditCourseId = null;
let currentDeleteCourseId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function() {

    loadCourses();

    setupCourseEvents();

});


/* =========================================================
   COURSE EVENTS
========================================================= */

function setupCourseEvents() {

    /* Add Course */

    const openAddCourseModal =
        document.getElementById("openAddCourseModal");

    const closeAddCourseModal =
        document.getElementById("closeAddCourseModal");

    const cancelAddCourseModal =
        document.getElementById("cancelAddCourseModal");

    if (openAddCourseModal) {

        openAddCourseModal.addEventListener(
            "click",
            function() {

                openModal("addCourseModal");

            }
        );

    }


    if (closeAddCourseModal) {

        closeAddCourseModal.addEventListener(
            "click",
            function() {

                closeModal("addCourseModal");

            }
        );

    }


    if (cancelAddCourseModal) {

        cancelAddCourseModal.addEventListener(
            "click",
            function() {

                closeModal("addCourseModal");

            }
        );

    }


    /* Add Course Form */

    const addCourseForm =
        document.getElementById("addCourseForm");

    if (addCourseForm) {

        addCourseForm.addEventListener(
            "submit",
            addCourse
        );

    }


    /* Edit Course */

    const closeEditCourseModal =
        document.getElementById("closeEditCourseModal");

    const cancelEditCourseModal =
        document.getElementById("cancelEditCourseModal");

    if (closeEditCourseModal) {

        closeEditCourseModal.addEventListener(
            "click",
            function() {

                closeModal("editCourseModal");

            }
        );

    }


    if (cancelEditCourseModal) {

        cancelEditCourseModal.addEventListener(
            "click",
            function() {

                closeModal("editCourseModal");

            }
        );

    }


    const editCourseForm =
        document.getElementById("editCourseForm");

    if (editCourseForm) {

        editCourseForm.addEventListener(
            "submit",
            updateCourse
        );

    }


    /* View Course */

    const closeViewCourseModal =
        document.getElementById("closeViewCourseModal");

    const closeViewCourseBtn =
        document.getElementById("closeViewCourseBtn");

    if (closeViewCourseModal) {

        closeViewCourseModal.addEventListener(
            "click",
            function() {

                closeModal("viewCourseModal");

            }
        );

    }


    if (closeViewCourseBtn) {

        closeViewCourseBtn.addEventListener(
            "click",
            function() {

                closeModal("viewCourseModal");

            }
        );

    }


    /* Delete Course */

    const cancelDeleteCourse =
        document.getElementById("cancelDeleteCourse");

    const confirmDeleteCourse =
        document.getElementById("confirmDeleteCourse");

    if (cancelDeleteCourse) {

        cancelDeleteCourse.addEventListener(
            "click",
            function() {

                closeModal("deleteCourseModal");

            }
        );

    }


    if (confirmDeleteCourse) {

        confirmDeleteCourse.addEventListener(
            "click",
            deleteCourse
        );

    }


    /* Search */

    const courseSearch =
        document.getElementById("courseSearch");

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            filterCourses
        );

    }


    /* Department Filter */

    const departmentFilter =
        document.getElementById("departmentFilter");

    if (departmentFilter) {

        departmentFilter.addEventListener(
            "change",
            filterCourses
        );

    }


    /* Reset */

    const resetCourseFilters =
        document.getElementById("resetCourseFilters");

    if (resetCourseFilters) {

        resetCourseFilters.addEventListener(
            "click",
            function() {

                if (courseSearch) {
                    courseSearch.value = "";
                }

                if (departmentFilter) {
                    departmentFilter.value = "";
                }

                renderCourses(allCourses);

            }
        );

    }


    /* Close modal when clicking outside */

    document.querySelectorAll(".student-modal")
        .forEach(function(modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (event.target === modal) {

                        modal.classList.remove("show");

                    }

                }
            );

        });


    /* Escape key */

    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                document.querySelectorAll(".student-modal")
                    .forEach(function(modal) {

                        modal.classList.remove("show");

                    });

            }

        }
    );

}


/* =========================================================
   MODAL FUNCTIONS
========================================================= */

function openModal(modalId) {

    const modal =
        document.getElementById(modalId);

    if (modal) {

        modal.classList.add("show");

    }

}


function closeModal(modalId) {

    const modal =
        document.getElementById(modalId);

    if (modal) {

        modal.classList.remove("show");

    }

}


/* =========================================================
   LOAD COURSES
========================================================= */

async function loadCourses() {

    const tableBody =
        document.getElementById("coursesTableBody");

    if (!tableBody) {
        return;
    }


    try {

        const response =
            await fetch("/api/courses");

        const result =
            await response.json();


        if (!response.ok || !result.success) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p>Unable to load courses</p>
                            <small>
                                Please try again later.
                            </small>
                        </div>
                    </td>
                </tr>
            `;

            return;

        }


        allCourses = result.courses || [];


        populateDepartmentFilter(
            allCourses
        );


        renderCourses(
            allCourses
        );


    } catch (error) {

        console.error(
            "Course loading error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>Unable to load courses</p>
                        <small>
                            Server connection failed.
                        </small>
                    </div>
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   RENDER COURSES
========================================================= */

function renderCourses(courses) {

    const tableBody =
        document.getElementById("coursesTableBody");

    const courseCount =
        document.getElementById("courseCount");


    if (!tableBody) {
        return;
    }


    if (!courses || courses.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div>
                        <i class="fa-solid fa-book-open"></i>
                        <p>No courses found</p>
                        <small>
                            Add a course to see it here.
                        </small>
                    </div>
                </td>
            </tr>
        `;


        if (courseCount) {

            courseCount.textContent =
                "Showing 0 courses";

        }

        return;

    }


    tableBody.innerHTML = "";


    courses.forEach(function(course) {

        const row =
            document.createElement("tr");


        row.innerHTML = `
            <td>
                <div class="course-name-info">

                    <div class="course-table-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(course.course_name)}
                        </strong>

                        <span>
                            ${escapeHtml(course.department)}
                        </span>
                    </div>

                </div>
            </td>

            <td>
                <span class="course-code">
                    ${escapeHtml(course.course_code)}
                </span>
            </td>

            <td>
                ${escapeHtml(course.department)}
            </td>

            <td>
                ${escapeHtml(course.duration || "-")}
            </td>

            <td>
                <span class="student-count-badge">
                    ${course.student_count || 0}
                </span>
            </td>

            <td>

                <div class="course-actions">

                    <button
                        type="button"
                        class="student-action-btn"
                        title="View Course"
                        onclick="viewCourse(${course.id})">

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    <button
                        type="button"
                        class="student-action-btn"
                        title="Edit Course"
                        onclick="editCourse(${course.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="student-action-btn delete-action-btn"
                        title="Delete Course"
                        onclick="openDeleteCourse(${course.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>
        `;


        tableBody.appendChild(row);

    });


    if (courseCount) {

        courseCount.textContent =
            `Showing ${courses.length} course${courses.length === 1 ? "" : "s"}`;

    }

}


/* =========================================================
   POPULATE DEPARTMENT FILTER
========================================================= */

function populateDepartmentFilter(courses) {

    const departmentFilter =
        document.getElementById("departmentFilter");

    if (!departmentFilter) {
        return;
    }


    const currentValue =
        departmentFilter.value;


    const departments = [...new Set(
        courses
        .map(course => course.department)
        .filter(Boolean)
    )].sort();


    departmentFilter.innerHTML = `
        <option value="">
            All Departments
        </option>
    `;


    departments.forEach(function(department) {

        const option =
            document.createElement("option");

        option.value = department;
        option.textContent = department;

        departmentFilter.appendChild(option);

    });


    departmentFilter.value =
        currentValue;

}


/* =========================================================
   FILTER COURSES
========================================================= */

function filterCourses() {

    const searchInput =
        document.getElementById("courseSearch");

    const departmentFilter =
        document.getElementById("departmentFilter");


    const searchText =
        searchInput ?
        searchInput.value.toLowerCase().trim() :
        "";


    const selectedDepartment =
        departmentFilter ?
        departmentFilter.value :
        "";


    const filteredCourses =
        allCourses.filter(function(course) {

            const matchesSearch =
                course.course_name
                .toLowerCase()
                .includes(searchText)

            ||

            course.course_code
                .toLowerCase()
                .includes(searchText);


            const matchesDepartment = !selectedDepartment ||
                course.department === selectedDepartment;


            return (
                matchesSearch &&
                matchesDepartment
            );

        });


    renderCourses(
        filteredCourses
    );

}


/* =========================================================
   ADD COURSE
========================================================= */

async function addCourse(event) {

    event.preventDefault();


    const courseCode =
        document.getElementById("course_code").value.trim();

    const courseName =
        document.getElementById("course_name").value.trim();

    const department =
        document.getElementById("department").value.trim();

    const duration =
        document.getElementById("duration").value;


    try {

        const response =
            await fetch("/api/courses", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    course_code: courseCode,
                    course_name: courseName,
                    department: department,
                    duration: duration

                })

            });


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to add course."
            );

            return;

        }


        alert(
            "Course added successfully."
        );


        document
            .getElementById("addCourseForm")
            .reset();


        closeModal(
            "addCourseModal"
        );


        await loadCourses();


    } catch (error) {

        console.error(
            "Add course error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================================================
   VIEW COURSE
========================================================= */

async function viewCourse(courseId) {

    try {

        const response =
            await fetch(
                `/api/courses/${courseId}`
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to load course."
            );

            return;

        }


        const course =
            result.course;


        document.getElementById(
                "view_course_name"
            ).textContent =
            course.course_name;


        document.getElementById(
                "view_course_code"
            ).textContent =
            course.course_code;


        document.getElementById(
                "view_course_code_detail"
            ).textContent =
            course.course_code;


        document.getElementById(
                "view_course_name_detail"
            ).textContent =
            course.course_name;


        document.getElementById(
                "view_department"
            ).textContent =
            course.department;


        document.getElementById(
                "view_duration"
            ).textContent =
            course.duration || "-";


        document.getElementById(
                "view_student_count"
            ).textContent =
            course.student_count || 0;


        openModal(
            "viewCourseModal"
        );


    } catch (error) {

        console.error(
            "View course error:",
            error
        );


        alert(
            "Unable to load course details."
        );

    }

}


/* =========================================================
   EDIT COURSE
========================================================= */

async function editCourse(courseId) {

    try {

        const response =
            await fetch(
                `/api/courses/${courseId}`
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to load course."
            );

            return;

        }


        const course =
            result.course;


        currentEditCourseId =
            course.id;


        document.getElementById(
                "edit_course_id"
            ).value =
            course.id;


        document.getElementById(
                "edit_course_code"
            ).value =
            course.course_code;


        document.getElementById(
                "edit_course_name"
            ).value =
            course.course_name;


        document.getElementById(
                "edit_department"
            ).value =
            course.department;


        document.getElementById(
                "edit_duration"
            ).value =
            course.duration === "-" ?
            "" :
            course.duration;


        openModal(
            "editCourseModal"
        );


    } catch (error) {

        console.error(
            "Edit course error:",
            error
        );


        alert(
            "Unable to load course."
        );

    }

}


/* =========================================================
   UPDATE COURSE
========================================================= */

async function updateCourse(event) {

    event.preventDefault();


    if (!currentEditCourseId) {

        alert(
            "Course ID not found."
        );

        return;

    }


    const courseCode =
        document.getElementById(
            "edit_course_code"
        ).value.trim();


    const courseName =
        document.getElementById(
            "edit_course_name"
        ).value.trim();


    const department =
        document.getElementById(
            "edit_department"
        ).value.trim();


    const duration =
        document.getElementById(
            "edit_duration"
        ).value;


    try {

        const response =
            await fetch(
                `/api/courses/${currentEditCourseId}`, {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        course_code: courseCode,
                        course_name: courseName,
                        department: department,
                        duration: duration

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to update course."
            );

            return;

        }


        alert(
            "Course updated successfully."
        );


        closeModal(
            "editCourseModal"
        );


        currentEditCourseId =
            null;


        await loadCourses();


    } catch (error) {

        console.error(
            "Update course error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================================================
   OPEN DELETE COURSE
========================================================= */

function openDeleteCourse(courseId) {

    const course =
        allCourses.find(
            item => item.id === courseId
        );


    if (!course) {

        return;

    }


    currentDeleteCourseId =
        courseId;


    const deleteCourseName =
        document.getElementById(
            "deleteCourseName"
        );


    if (deleteCourseName) {

        deleteCourseName.textContent =
            course.course_name;

    }


    openModal(
        "deleteCourseModal"
    );

}


/* =========================================================
   DELETE COURSE
========================================================= */

async function deleteCourse() {

    if (!currentDeleteCourseId) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/courses/${currentDeleteCourseId}`, {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Failed to delete course."
            );

            return;

        }


        alert(
            "Course deleted successfully."
        );


        closeModal(
            "deleteCourseModal"
        );


        currentDeleteCourseId =
            null;


        await loadCourses();


    } catch (error) {

        console.error(
            "Delete course error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}