/* =========================================================
   SVOS CITIZEN - COMPLAINTS
   Submit Complaint + Display Complaint ID
   ========================================================= */

const COMPLAINT_API =
    "http://localhost:5000/api/complaints";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCitizenName();

        setupComplaintForm();

    }
);


// =========================================================
// LOAD CITIZEN NAME
// =========================================================

function loadCitizenName() {

    const userName =
        document.getElementById("userName");

    if (!userName) return;


    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("svosUser")
            );


        if (
            storedUser &&
            storedUser.name
        ) {

            userName.textContent =
                storedUser.name;

        }

    } catch (error) {

        console.error(
            "❌ User data error:",
            error
        );

    }

}


// =========================================================
// SETUP COMPLAINT FORM
// =========================================================

function setupComplaintForm() {

    const complaintForm =
        document.getElementById(
            "complaintForm"
        );


    if (!complaintForm) {

        console.warn(
            "⚠️ complaintForm not found."
        );

        return;

    }


    complaintForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await submitComplaint(
                complaintForm
            );

        }
    );

}


// =========================================================
// SUBMIT COMPLAINT
// =========================================================

async function submitComplaint(
    complaintForm
) {

    const messageBox =
        document.getElementById(
            "complaintMessage"
        );


    const submitButton =
        complaintForm.querySelector(
            'button[type="submit"]'
        );


    // =====================================================
    // GET FORM VALUES
    // =====================================================

    const category =
        document.getElementById(
            "complaintCategory"
        )?.value.trim() || "";


    const subject =
        document.getElementById(
            "complaintSubject"
        )?.value.trim() || "";


    const location =
        document.getElementById(
            "complaintLocation"
        )?.value.trim() || "";


    const description =
        document.getElementById(
            "complaintDescription"
        )?.value.trim() || "";


    // =====================================================
    // VALIDATION
    // =====================================================

    if (!category) {

        showComplaintMessage(
            messageBox,
            "Please select a complaint category.",
            "error"
        );

        return;

    }


    if (!subject) {

        showComplaintMessage(
            messageBox,
            "Please enter complaint subject.",
            "error"
        );

        return;

    }


    if (!location) {

        showComplaintMessage(
            messageBox,
            "Please enter complaint location.",
            "error"
        );

        return;

    }


    if (!description) {

        showComplaintMessage(
            messageBox,
            "Please enter complaint description.",
            "error"
        );

        return;

    }


    if (description.length < 10) {

        showComplaintMessage(
            messageBox,
            "Complaint description should contain at least 10 characters.",
            "error"
        );

        return;

    }


    // =====================================================
    // GET LOGGED-IN CITIZEN
    // =====================================================

    let citizen = {};


    try {

        citizen =
            JSON.parse(
                localStorage.getItem("svosUser")
            ) || {};

    } catch (error) {

        console.error(
            "❌ Citizen data error:",
            error
        );

    }


    // =====================================================
    // REQUEST DATA
    // =====================================================

    const complaintData = {

        citizenId:
            citizen.id ||
            citizen._id ||
            citizen.userId ||
            "",

        citizenName:
            citizen.name ||
            "Citizen",

        email:
            citizen.email ||
            "",

        mobile:
            citizen.mobile ||
            citizen.phone ||
            "",

        category,

        subject,

        location,

        description

    };


    console.log(
        "📤 Complaint Request:",
        complaintData
    );


    try {

        // =================================================
        // BUTTON LOADING
        // =================================================

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";

        }


        showComplaintMessage(
            messageBox,
            "Submitting complaint...",
            "info"
        );


        // =================================================
        // API REQUEST
        // =================================================

        const response =
            await fetch(
                COMPLAINT_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            complaintData
                        )
                }
            );


        // =================================================
        // SAFE RESPONSE
        // =================================================

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let result;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            result =
                await response.json();

        } else {

            const text =
                await response.text();


            console.error(
                "❌ Backend returned non-JSON response:",
                text
            );


            throw new Error(
                `Backend returned invalid response. HTTP ${response.status}`
            );

        }


        // =================================================
        // DEBUG RESPONSE
        // =================================================

        console.log(
            "📥 Complaint API Response:",
            result
        );


        // =================================================
        // API ERROR
        // =================================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to submit complaint."
            );

        }


        // =================================================
        // GET GENERATED COMPLAINT ID
        // =================================================

        const complaint =
            result.data ||
            result.complaint ||
            null;


        const complaintId =
            complaint?.complaintId ||
            result.complaintId ||
            null;


        console.log(
            "🎫 Generated Complaint ID:",
            complaintId
        );


        // =================================================
        // SUCCESS + COMPLAINT ID
        // =================================================

        if (complaintId) {

            showComplaintMessage(
                messageBox,
                `Complaint submitted successfully. Your Complaint ID is: ${complaintId}`,
                "success"
            );


            // Save latest complaint ID
            localStorage.setItem(
                "lastComplaintId",
                complaintId
            );


            // Also log complete complaint
            console.log(
                "✅ Complaint submitted:",
                complaint
            );


        } else {

            console.warn(
                "⚠️ Backend did not return complaintId.",
                result
            );


            showComplaintMessage(
                messageBox,
                "Complaint submitted successfully, but Complaint ID was not returned by the server.",
                "warning"
            );

        }


        // =================================================
        // RESET FORM
        // =================================================

        complaintForm.reset();


    } catch (error) {

        console.error(
            "❌ Complaint Submission Error:",
            error
        );


        showComplaintMessage(
            messageBox,
            error.message ||
                "Unable to submit complaint.",
            "error"
        );

    } finally {

        // =================================================
        // RESTORE BUTTON
        // =================================================

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Complaint";

        }

    }

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showComplaintMessage(
    messageBox,
    message,
    type
) {

    if (!messageBox) {

        console.warn(
            "⚠️ complaintMessage element not found."
        );

        // Still show in console
        console.log(
            `[${type}] ${message}`
        );

        return;

    }


    messageBox.textContent =
        message;


    messageBox.className =
        `form-message ${type}`;


    messageBox.style.display =
        "block";

}
