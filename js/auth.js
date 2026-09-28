/* =========================================================
   SVOS - AUTHENTICATION
   MongoDB + Node.js + Express + JWT
========================================================= */

const API_BASE_URL = "http://localhost:5000/api/auth";


// =========================================================
// REGISTER
// =========================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const role =
            document.getElementById("role").value;

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const messageBox =
            document.getElementById("registerMessage");


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!name || !email || !role || !password || !confirmPassword) {

            showMessage(
                messageBox,
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        if (password.length < 6) {

            showMessage(
                messageBox,
                "Password must be at least 6 characters.",
                "error"
            );

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                messageBox,
                "Passwords do not match.",
                "error"
            );

            return;
        }


        // -----------------------------------------
        // BUTTON LOADING
        // -----------------------------------------

        const submitButton =
            registerForm.querySelector("button[type='submit']");

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Creating Account...";


        try {

            // -----------------------------------------
            // API REQUEST
            // -----------------------------------------

            const response = await fetch(
                `${API_BASE_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role
                    })
                }
            );


            const data = await response.json();


            // -----------------------------------------
            // ERROR
            // -----------------------------------------

            if (!response.ok) {

                showMessage(
                    messageBox,
                    data.message || "Registration failed.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // SUCCESS
            // -----------------------------------------

            showMessage(
                messageBox,
                "Account created successfully! Redirecting to login...",
                "success"
            );


            registerForm.reset();


            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            showMessage(
                messageBox,
                "Unable to connect to SVOS server. Please try again.",
                "error"
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;

        }

    });

}


// =========================================================
// LOGIN
// =========================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // IMPORTANT:
        // Login HTML uses:
        // loginEmail
        // loginPassword
        // loginRole

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const role =
            document.getElementById("loginRole").value;

        const messageBox =
            document.getElementById("loginMessage");


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!email || !password || !role) {

            showMessage(
                messageBox,
                "Please fill all required fields.",
                "error"
            );

            return;
        }


        // -----------------------------------------
        // BUTTON LOADING
        // -----------------------------------------

        const submitButton =
            loginForm.querySelector("button[type='submit']");

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Logging in...";


        try {

            // -----------------------------------------
            // LOGIN API
            // -----------------------------------------

            const response = await fetch(
                `${API_BASE_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password,
                        role
                    })
                }
            );


            const data = await response.json();


            // -----------------------------------------
            // LOGIN ERROR
            // -----------------------------------------

            if (!response.ok) {

                showMessage(
                    messageBox,
                    data.message || "Login failed.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // SAVE JWT TOKEN
            // -----------------------------------------

            localStorage.setItem(
                "svosToken",
                data.token
            );


            // -----------------------------------------
            // SAVE USER DATA
            // -----------------------------------------

            localStorage.setItem(
                "svosUser",
                JSON.stringify(data.user)
            );


            // -----------------------------------------
            // SUCCESS MESSAGE
            // -----------------------------------------

            showMessage(
                messageBox,
                "Login successful! Redirecting...",
                "success"
            );


            // -----------------------------------------
            // ROLE REDIRECT
            // -----------------------------------------

            setTimeout(() => {

                redirectUser(data.user.role);

            }, 800);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            showMessage(
                messageBox,
                "Unable to connect to SVOS server. Please try again.",
                "error"
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;

        }

    });

}


// =========================================================
// ROLE BASED REDIRECT
// =========================================================

function redirectUser(role) {

    switch (role) {

        case "citizen":

            window.location.href =
                "citizen/dashboard.html";

            break;


        case "officer":

            window.location.href =
                "officer/dashboard.html";

            break;


        case "admin":

            window.location.href =
                "admin/dashboard.html";

            break;


        default:

            console.error(
                "Unknown user role:",
                role
            );

            window.location.href =
                "login.html";
    }

}


// =========================================================
// MESSAGE HELPER
// =========================================================

function showMessage(element, message, type) {

    if (!element) return;

    element.textContent = message;

    element.className =
        `auth-message ${type}`;

}


// =========================================================
// LOGOUT
// =========================================================

function logoutUser() {

    localStorage.removeItem("svosToken");
    localStorage.removeItem("svosUser");

    window.location.href = "../login.html";
}


// =========================================================
// GET CURRENT USER
// =========================================================

function getLoggedInUser() {

    const user =
        localStorage.getItem("svosUser");

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Invalid SVOS user data:",
            error
        );

        return null;
    }

}