let resultRecords = [];
let allResultStudents = [];
let selectedResultId = null;

document.addEventListener("DOMContentLoaded", function() {
    loadResultStudents();
    loadResults();
    setupResultEvents();
});


// =========================================================
// LOAD STUDENTS
// =========================================================

async function loadResultStudents() {

    try {

        const response = await fetch("/api/students");
        const result = await response.json();

        if (!result.success) {
            return;
        }

        allResultStudents = result.students || [];

        populateResultStudentDropdown();

    } catch (error) {

        console.error("Students loading error:", error);

    }
}


// =========================================================
// STUDENT DROPDOWN
// =========================================================

function populateResultStudentDropdown() {

    const select =
        document.getElementById("result_student_id");

    if (!select) return;

    select.innerHTML =
        `<option value="">Select Student</option>`;

    allResultStudents.forEach(function(student) {

        const option =
            document.createElement("option");

        option.value = student.id;

        option.textContent =
            `${student.full_name} (${student.student_id})`;

        select.appendChild(option);

    });
}


// =========================================================
// LOAD RESULTS
// =========================================================

async function loadResults() {

    const tableBody =
        document.getElementById("resultsTableBody");

    if (!tableBody) return;

    try {

        const response =
            await fetch("/api/results");

        const result =
            await response.json();

        if (!result.success) {

            showResultMessage(
                "Unable to load results.",
                "Please try again."
            );

            return;
        }

        resultRecords =
            result.results || [];

        populateSubjectFilter();

        displayResults(resultRecords);

    } catch (error) {

        console.error(
            "Results loading error:",
            error
        );

        showResultMessage(
            "Unable to load results.",
            "Please try again."
        );
    }
}


// =========================================================
// DISPLAY RESULTS
// =========================================================

function displayResults(records) {

    const tableBody =
        document.getElementById("resultsTableBody");

    const count =
        document.getElementById("resultsCount");

    if (!tableBody) return;

    if (!records || records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">

                    <div>

                        <i class="fa-solid fa-chart-column"></i>

                        <p>
                            No results found.
                        </p>

                        <small>
                            Add a student result to see records here.
                        </small>

                    </div>

                </td>
            </tr>
        `;

        if (count) {
            count.textContent =
                "Showing 0 results";
        }

        return;
    }

    tableBody.innerHTML = "";

    records.forEach(function(result) {

        const row =
            document.createElement("tr");

        const gradeClass =
            getGradeClass(result.grade);

        row.innerHTML = `

            <td>

                <div class="result-student-info">

                    <div class="result-student-avatar">

                        ${result.student_name
                            .charAt(0)
                            .toUpperCase()}

                    </div>

                    <div>

                        <strong>
                            ${result.student_name}
                        </strong>

                    </div>

                </div>

            </td>


            <td>
                ${result.student_code || "-"}
            </td>


            <td>
                ${result.subject || "-"}
            </td>


            <td>

                <strong class="result-marks">

                    ${result.marks}

                    <span>
                        / ${result.total_marks}
                    </span>

                </strong>

            </td>


            <td>

                <span class="result-grade ${gradeClass}">

                    ${result.grade}

                </span>

            </td>


            <td>

                <div class="result-actions">

                    <button
                        type="button"
                        class="result-action-btn"
                        title="Edit Result"
                        onclick="editResult(${result.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="result-action-btn delete-action-btn"
                        title="Delete Result"
                        onclick="openDeleteResult(${result.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;

        tableBody.appendChild(row);

    });

    if (count) {

        count.textContent =
            `Showing ${records.length} result${
                records.length === 1 ? "" : "s"
            }`;

    }
}


// =========================================================
// GRADE CLASS
// =========================================================

function getGradeClass(grade) {

    if (grade === "A+" || grade === "A") {
        return "result-grade-excellent";
    }

    if (grade === "B+" || grade === "B") {
        return "result-grade-good";
    }

    if (grade === "C" || grade === "D") {
        return "result-grade-average";
    }

    return "result-grade-fail";
}


// =========================================================
// SUBJECT FILTER
// =========================================================

function populateSubjectFilter() {

    const select =
        document.getElementById("resultSubjectFilter");

    if (!select) return;

    const subjects = [...new Set(
        resultRecords
        .map(function(result) {
            return result.subject;
        })
        .filter(Boolean)
    )].sort();

    select.innerHTML =
        `<option value="">All Subjects</option>`;

    subjects.forEach(function(subject) {

        const option =
            document.createElement("option");

        option.value = subject;
        option.textContent = subject;

        select.appendChild(option);

    });
}


// =========================================================
// FILTER RESULTS
// =========================================================

function filterResults() {

    const searchInput =
        document.getElementById("resultSearch");

    const subjectInput =
        document.getElementById("resultSubjectFilter");

    const gradeInput =
        document.getElementById("resultGradeFilter");

    const search =
        searchInput ?
        searchInput.value.toLowerCase().trim() :
        "";

    const selectedSubject =
        subjectInput ?
        subjectInput.value :
        "";

    const selectedGrade =
        gradeInput ?
        gradeInput.value :
        "";


    const filtered =
        resultRecords.filter(function(result) {

            const studentName =
                (result.student_name || "")
                .toLowerCase();

            const studentCode =
                (result.student_code || "")
                .toLowerCase();

            const matchesSearch = !search ||
                studentName.includes(search) ||
                studentCode.includes(search);

            const matchesSubject = !selectedSubject ||
                result.subject === selectedSubject;

            const matchesGrade = !selectedGrade ||
                result.grade === selectedGrade;

            return (
                matchesSearch &&
                matchesSubject &&
                matchesGrade
            );

        });


    displayResults(filtered);
}


// =========================================================
// RESET FILTERS
// =========================================================

function resetResultFilters() {

    const search =
        document.getElementById("resultSearch");

    const subject =
        document.getElementById("resultSubjectFilter");

    const grade =
        document.getElementById("resultGradeFilter");

    if (search) search.value = "";

    if (subject) subject.value = "";

    if (grade) grade.value = "";

    displayResults(resultRecords);
}


// =========================================================
// MODAL EVENTS
// =========================================================

function setupResultEvents() {

    const openBtn =
        document.getElementById("openResultModal");

    const closeBtn =
        document.getElementById("closeResultModal");

    const cancelBtn =
        document.getElementById("cancelResultModal");

    const modal =
        document.getElementById("resultModal");

    const form =
        document.getElementById("resultForm");

    const search =
        document.getElementById("resultSearch");

    const subject =
        document.getElementById("resultSubjectFilter");

    const grade =
        document.getElementById("resultGradeFilter");

    const resetBtn =
        document.getElementById("resetResultFilters");

    const deleteModal =
        document.getElementById("deleteResultModal");

    const cancelDelete =
        document.getElementById("cancelDeleteResult");

    const confirmDelete =
        document.getElementById("confirmDeleteResult");


    if (openBtn) {

        openBtn.addEventListener(
            "click",
            function() {

                openAddResultModal();

            }
        );

    }


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeResultModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeResultModal
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            submitResult
        );

    }


    if (search) {

        search.addEventListener(
            "input",
            filterResults
        );

    }


    if (subject) {

        subject.addEventListener(
            "change",
            filterResults
        );

    }


    if (grade) {

        grade.addEventListener(
            "change",
            filterResults
        );

    }


    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            resetResultFilters
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function(event) {

                if (event.target === modal) {
                    closeResultModal();
                }

            }
        );

    }


    if (deleteModal) {

        deleteModal.addEventListener(
            "click",
            function(event) {

                if (event.target === deleteModal) {
                    closeDeleteResultModal();
                }

            }
        );

    }


    if (cancelDelete) {

        cancelDelete.addEventListener(
            "click",
            closeDeleteResultModal
        );

    }


    if (confirmDelete) {

        confirmDelete.addEventListener(
            "click",
            confirmDeleteResult
        );

    }

}


// =========================================================
// OPEN ADD RESULT
// =========================================================

function openAddResultModal() {

    selectedResultId = null;

    const form =
        document.getElementById("resultForm");

    if (form) {
        form.reset();
    }

    const title =
        document.getElementById("resultModalTitle");

    const description =
        document.getElementById("resultModalDescription");

    const submitText =
        document.getElementById("resultSubmitText");

    if (title) {
        title.textContent = "Add Result";
    }

    if (description) {

        description.textContent =
            "Enter student academic result details.";

    }

    if (submitText) {
        submitText.textContent = "Add Result";
    }

    const totalMarks =
        document.getElementById("result_total_marks");

    if (totalMarks) {
        totalMarks.value = "100";
    }

    const modal =
        document.getElementById("resultModal");

    if (modal) {
        modal.classList.add("show");
    }

}


// =========================================================
// CLOSE RESULT MODAL
// =========================================================

function closeResultModal() {

    const modal =
        document.getElementById("resultModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


// =========================================================
// EDIT RESULT
// =========================================================

function editResult(resultId) {

    const result =
        resultRecords.find(function(item) {

            return item.id === resultId;

        });


    if (!result) return;

    selectedResultId = resultId;


    document.getElementById(
        "result_student_id"
    ).value = result.student_id;


    document.getElementById(
        "result_subject"
    ).value = result.subject;


    document.getElementById(
        "result_marks"
    ).value = result.marks;


    document.getElementById(
        "result_total_marks"
    ).value = result.total_marks;


    document.getElementById(
        "resultModalTitle"
    ).textContent = "Edit Result";


    document.getElementById(
            "resultModalDescription"
        ).textContent =
        "Update student academic result details.";


    document.getElementById(
        "resultSubmitText"
    ).textContent = "Update Result";


    const modal =
        document.getElementById("resultModal");

    if (modal) {
        modal.classList.add("show");
    }

}


// =========================================================
// SUBMIT RESULT
// =========================================================

async function submitResult(event) {

    event.preventDefault();


    const studentId =
        document.getElementById(
            "result_student_id"
        ).value;


    const subject =
        document.getElementById(
            "result_subject"
        ).value.trim();


    const marks =
        document.getElementById(
            "result_marks"
        ).value;


    const totalMarks =
        document.getElementById(
            "result_total_marks"
        ).value;


    if (!studentId ||
        !subject ||
        marks === "" ||
        totalMarks === ""
    ) {

        alert(
            "Please fill all result details."
        );

        return;

    }


    const url =
        selectedResultId ?
        `/api/results/${selectedResultId}` :
        "/api/results";


    const method =
        selectedResultId ?
        "PUT" :
        "POST";


    try {

        const response =
            await fetch(url, {

                method: method,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    student_id: Number(studentId),

                    subject: subject,

                    marks: Number(marks),

                    total_marks: Number(totalMarks)

                })

            });


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to save result."
            );

            return;

        }


        alert(
            selectedResultId ?
            "Result updated successfully." :
            "Result added successfully."
        );


        closeResultModal();

        loadResults();


    } catch (error) {

        console.error(
            "Result submit error:",
            error
        );

        alert(
            "Something went wrong while saving result."
        );

    }

}


// =========================================================
// DELETE RESULT
// =========================================================

function openDeleteResult(resultId) {

    selectedResultId = resultId;

    const modal =
        document.getElementById(
            "deleteResultModal"
        );

    if (modal) {
        modal.classList.add("show");
    }

}


// =========================================================
// CLOSE DELETE MODAL
// =========================================================

function closeDeleteResultModal() {

    const modal =
        document.getElementById(
            "deleteResultModal"
        );

    if (modal) {
        modal.classList.remove("show");
    }

}


// =========================================================
// CONFIRM DELETE
// =========================================================

async function confirmDeleteResult() {

    if (!selectedResultId) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/results/${selectedResultId}`, {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            alert(
                result.message ||
                "Unable to delete result."
            );

            return;

        }


        alert(
            "Result deleted successfully."
        );


        closeDeleteResultModal();

        selectedResultId = null;

        loadResults();


    } catch (error) {

        console.error(
            "Result delete error:",
            error
        );

        alert(
            "Something went wrong while deleting result."
        );

    }

}


// =========================================================
// EMPTY / ERROR MESSAGE
// =========================================================

function showResultMessage(message, smallText) {

    const tableBody =
        document.getElementById(
            "resultsTableBody"
        );

    if (!tableBody) return;

    tableBody.innerHTML = `

        <tr>

            <td colspan="6"
                class="empty-state">

                <div>

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        ${message}
                    </p>

                    <small>
                        ${smallText}
                    </small>

                </div>

            </td>

        </tr>

    `;

}