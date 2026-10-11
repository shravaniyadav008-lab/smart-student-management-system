/*=========================================================
   DASHBOARD HEADER FUNCTIONALITY
========================================================= */
document.addEventListener("DOMContentLoaded", function() {  
    /* =====================================================
       ELEMENTS
    ===================================================== */
      
    const notificationBtn = document.getElementById("notificationBtn");  
    const notificationDropdown = document.getElementById("notificationDropdown");  
    const notificationDot = document.getElementById("notificationDot");  
    const markNotificationsRead = document.getElementById("markNotificationsRead");  
    const profileBtn = document.getElementById("profileBtn");  
    const profileDropdown = document.getElementById("profileDropdown");  
    /* =====================================================
       NOTIFICATION TOGGLE
    ===================================================== */
      
    if (notificationBtn && notificationDropdown) {     notificationBtn.addEventListener("click", function(event) {       event.stopPropagation();       const isOpen =         notificationDropdown.classList.contains("show");       /* Close profile dropdown */        if (profileDropdown) {         profileDropdown.classList.remove("show");       }       if (profileBtn) {         profileBtn.classList.remove("active");       }       /* Toggle notification dropdown */        if (isOpen) {         notificationDropdown.classList.remove("show");       } else {         notificationDropdown.classList.add("show");       }     });   }  
    /* =====================================================
       MARK NOTIFICATIONS AS READ
    ===================================================== */
      
    if (markNotificationsRead) {     markNotificationsRead.addEventListener("click", function() {       if (notificationDot) {         notificationDot.style.display = "none";       }     });   }  
    /* =====================================================
       PROFILE TOGGLE
    ===================================================== */
      
    if (profileBtn && profileDropdown) {     profileBtn.addEventListener("click", function(event) {       event.stopPropagation();       const isOpen =         profileDropdown.classList.contains("show");       /* Close notification dropdown */        if (notificationDropdown) {         notificationDropdown.classList.remove("show");       }       /* Toggle profile dropdown */        if (isOpen) {         profileDropdown.classList.remove("show");        
                profileBtn.classList.remove("active");       } else {         profileDropdown.classList.add("show");        
                profileBtn.classList.add("active");       }     });   }  
    /* =====================================================
       CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    ===================================================== */
      
    document.addEventListener("click", function() {     if (notificationDropdown) {       notificationDropdown.classList.remove("show");     }     if (profileDropdown) {       profileDropdown.classList.remove("show");     }     if (profileBtn) {       profileBtn.classList.remove("active");     }   });  
    /* =====================================================
       PREVENT DROPDOWN FROM CLOSING
       WHEN CLICKING INSIDE
    ===================================================== */
      
    if (notificationDropdown) {     notificationDropdown.addEventListener("click", function(event) {       event.stopPropagation();     });   }  
    if (profileDropdown) {     profileDropdown.addEventListener("click", function(event) {       event.stopPropagation();     });   }  
    /* =====================================================
       ESC KEY
    ===================================================== */
      
    document.addEventListener("keydown", function(event) {     if (event.key === "Escape") {       if (notificationDropdown) {         notificationDropdown.classList.remove("show");       }       if (profileDropdown) {         profileDropdown.classList.remove("show");       }       if (profileBtn) {         profileBtn.classList.remove("active");       }     }   });
});
/* =========================================================
   LOAD DASHBOARD STATISTICS
========================================================= */
async function loadDashboardStats() {  
    try {     const response = await fetch("/api/dashboard/stats");     const result = await response.json();     if (!result.success) {       console.error("Failed to load dashboard statistics.");       return;     }     const data = result.data;    
        /* =================================================
           UPDATE STATISTICS CARDS
        ================================================= */
             const totalStudents =       document.getElementById("totalStudents");     const totalCourses =       document.getElementById("totalCourses");     const maleStudents =       document.getElementById("maleStudents");     const femaleStudents =       document.getElementById("femaleStudents");     if (totalStudents) {       totalStudents.textContent = data.total_students;     }     if (totalCourses) {       totalCourses.textContent = data.total_courses;     }     if (maleStudents) {       maleStudents.textContent = data.male_students;     }     if (femaleStudents) {       femaleStudents.textContent = data.female_students;     }   } catch (error) {     console.error(      "Dashboard statistics error:",       error    );   }
}
/* =========================================================
   LOAD DASHBOARD DATA
========================================================= */
loadDashboardStats();
/* =========================================================
   LOAD RECENT STUDENTS
========================================================= */
async function loadRecentStudents() {  
    const tableBody =     document.getElementById("recentStudentsTableBody");  
    if (!tableBody) {     return;   }  
    try {     const response =       await fetch("/api/dashboard/stats");     const result =       await response.json();     if (!result.success) {       tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p>
                                Unable to load students
                            </p>
                            <small>
                                Please try again later.
                            </small>
                        </div>
                    </td>
                </tr>
            `;       return;     }     const students =       result.data.recent_students;    
        /* =================================================
           NO STUDENTS
        ================================================= */
             if (!students || students.length === 0) {       tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <div>
                            <i class="fa-solid fa-user-graduate"></i>
                            <p>
                                No students registered yet
                            </p>
                            <small>
                                Student records will appear here.
                            </small>
                        </div>
                    </td>
                </tr>
            `;       return;     }    
        /* =================================================
           DISPLAY STUDENTS
        ================================================= */
            
        tableBody.innerHTML = "";    
        students.forEach(function(student) {       const statusClass =         student.status === "Active" ?         "active-status" :         "inactive-status";       const row = document.createElement("tr");      
            row.innerHTML = `
                <td>
                    <div class="recent-student-info">
                        <div class="recent-student-avatar">
                            ${student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>
                                ${student.full_name}
                            </strong>
                            <span>
                                ${student.email}
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    ${student.student_id}
                </td>
                <td>
                    ${student.course_name}
                </td>
                <td>
                    ${student.year || "-"}
                </td>
                <td>
                    <span class="student-status ${statusClass}">
                        ${student.status || "Active"}
                    </span>
                </td>
            `;      
            tableBody.appendChild(row);     });   } catch (error) {     console.error(      "Recent students error:",       error    );   }
}
/* =========================================================
   LOAD RECENT STUDENTS DATA
========================================================= */
loadRecentStudents();