document.addEventListener("DOMContentLoaded", () => {
    loadProfile();
    setupSettingsEvents();
});


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile() {

    try {

        const response = await fetch("/api/settings/profile");
        const result = await response.json();

        if (!result.success) {

            showSettingsMessage(
                result.message,
                "error"
            );

            return;
        }


        const profileName =
            document.getElementById("profile_name");

        const profileEmail =
            document.getElementById("profile_email");


        if (profileName) {
            profileName.value = result.user.name;
        }

        if (profileEmail) {
            profileEmail.value = result.user.email;
        }


        const accountName =
            document.getElementById("accountName");

        const accountEmail =
            document.getElementById("accountEmail");


        if (accountName) {
            accountName.textContent = result.user.name;
        }

        if (accountEmail) {
            accountEmail.textContent = result.user.email;
        }


        const profilePreviewName =
            document.getElementById("profilePreviewName");

        if (profilePreviewName) {
            profilePreviewName.textContent = result.user.name;
        }


        const settingsAvatar =
            document.getElementById("settingsAvatar");

        if (settingsAvatar && result.user.name) {

            settingsAvatar.textContent =
                result.user.name.charAt(0).toUpperCase();

        }


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showSettingsMessage(
            "Unable to load profile.",
            "error"
        );
    }
}


/* =========================
   SETTINGS EVENTS
========================= */

function setupSettingsEvents() {


    /* PROFILE FORM */

    const profileForm =
        document.getElementById("profileForm");


    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            updateProfile
        );

    }


    /* PASSWORD FORM */

    const passwordForm =
        document.getElementById("passwordForm");


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            changePassword
        );

    }

}


/* =========================
   UPDATE PROFILE
========================= */

async function updateProfile(event) {

    event.preventDefault();


    const nameInput =
        document.getElementById("profile_name");

    const emailInput =
        document.getElementById("profile_email");


    if (!nameInput || !emailInput) {

        console.error(
            "Profile input fields not found."
        );

        showSettingsMessage(
            "Profile fields not found.",
            "error"
        );

        return;
    }


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();


    if (!name || !email) {

        showSettingsMessage(
            "Name and email are required.",
            "error"
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/settings/profile", {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email
                })
            }
        );


        const result =
            await response.json();


        if (!result.success) {

            showSettingsMessage(
                result.message,
                "error"
            );

            return;
        }


        /* SUCCESS MESSAGE */

        showSettingsMessage(
            "Profile updated successfully.",
            "success"
        );


        /* UPDATE ACCOUNT INFORMATION */

        const accountName =
            document.getElementById("accountName");

        const accountEmail =
            document.getElementById("accountEmail");


        if (accountName) {
            accountName.textContent =
                result.user.name;
        }


        if (accountEmail) {
            accountEmail.textContent =
                result.user.email;
        }


        /* UPDATE PROFILE PREVIEW */

        const profilePreviewName =
            document.getElementById(
                "profilePreviewName"
            );


        if (profilePreviewName) {

            profilePreviewName.textContent =
                result.user.name;

        }


        /* UPDATE AVATAR */

        const settingsAvatar =
            document.getElementById(
                "settingsAvatar"
            );


        if (settingsAvatar) {

            settingsAvatar.textContent =
                result.user.name
                .charAt(0)
                .toUpperCase();

        }


    } catch (error) {

        console.error(
            "Profile update error:",
            error
        );

        showSettingsMessage(
            "Unable to update profile.",
            "error"
        );
    }
}


/* =========================
   CHANGE PASSWORD
========================= */

async function changePassword(event) {

    event.preventDefault();


    const currentPasswordInput =
        document.getElementById(
            "current_password"
        );

    const newPasswordInput =
        document.getElementById(
            "new_password"
        );

    const confirmPasswordInput =
        document.getElementById(
            "confirm_password"
        );


    if (!currentPasswordInput ||
        !newPasswordInput ||
        !confirmPasswordInput
    ) {

        showSettingsMessage(
            "Password fields not found.",
            "error"
        );

        return;
    }


    const currentPassword =
        currentPasswordInput.value;

    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (!currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showSettingsMessage(
            "All password fields are required.",
            "error"
        );

        return;
    }


    if (newPassword !== confirmPassword) {

        showSettingsMessage(
            "New passwords do not match.",
            "error"
        );

        return;
    }


    if (newPassword.length < 6) {

        showSettingsMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/settings/password", {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    current_password: currentPassword,

                    new_password: newPassword,

                    confirm_password: confirmPassword

                })
            }
        );


        const result =
            await response.json();


        if (!result.success) {

            showSettingsMessage(
                result.message,
                "error"
            );

            return;
        }


        showSettingsMessage(
            "Password changed successfully.",
            "success"
        );


        document
            .getElementById("passwordForm")
            .reset();


    } catch (error) {

        console.error(
            "Password change error:",
            error
        );

        showSettingsMessage(
            "Unable to change password.",
            "error"
        );
    }
}


/* =========================
   SETTINGS MESSAGE
========================= */

function showSettingsMessage(
    message,
    type = "success"
) {

    const messageBox =
        document.getElementById(
            "settingsMessage"
        );


    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.className =
        "settings-message " + type;


    messageBox.style.display =
        "block";


    setTimeout(() => {

        messageBox.style.display =
            "none";

    }, 4000);
}