// =========================================================
// SVOS CITIZEN - TRACK COMPLAINT
// =========================================================

const TRACK_COMPLAINT_API =
    "http://localhost:5000/api/complaints";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCitizenName();

        setupTrackComplaint();

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
            "User data error:",
            error
        );

    }

}


// =========================================================
// SETUP TRACK FORM
// =========================================================

function setupTrackComplaint() {

    const form =
        document.getElementById(
            "trackComplaintForm"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await trackComplaint();

        }
    );

}


// =========================================================
// TRACK COMPLAINT
// =========================================================

async function trackComplaint() {

    const complaintIdInput =
        document.getElementById(
            "complaintId"
        );

    const messageBox =
        document.getElementById(
            "trackMessage"
        );

    const resultSection =
        document.getElementById(
            "complaintResult"
        );

    const detailsContainer =
        document.getElementById(
            "complaintDetails"
        );

    const submitButton =
        document.querySelector(
            '#trackComplaintForm button[type="submit"]'
        );


    if (!complaintIdInput) return;


    // =====================================================
    // GET INPUT
    // =====================================================

    const complaintId =
        complaintIdInput.value.trim();


    if (!complaintId) {

        showMessage(
            messageBox,
            "Please enter your Complaint ID.",
            "error"
        );

        return;

    }


    try {

        // =================================================
        // BUTTON LOADING
        // =================================================

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Tracking...";

        }


        hideResult(
            resultSection
        );


        // =================================================
        // API REQUEST
        // GET /api/complaints/:id
        // =================================================

        const response =
            await fetch(
                `${TRACK_COMPLAINT_API}/${encodeURIComponent(complaintId)}`
            );


        // =================================================
        // SAFE RESPONSE HANDLING
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
                `Backend returned HTML/text instead of JSON. HTTP ${response.status}. Check the complaint API route.`
            );

        }


        console.log(
            "📢 Complaint Tracking Response:",
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
                "Complaint not found."
            );

        }


        // =================================================
        // GET COMPLAINT DATA
        // =================================================

        const complaint =
            result.data ||
            result.complaint;


        if (!complaint) {

            throw new Error(
                "Complaint details were not found."
            );

        }


        console.log(
            "🎫 Complaint:",
            complaint
        );


        // =================================================
        // DISPLAY COMPLAINT
        // =================================================

        displayComplaint(
            complaint
        );


        // =================================================
        // SUCCESS MESSAGE
        // =================================================

        showMessage(
            messageBox,
            "Complaint details loaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "❌ Complaint tracking error:",
            error
        );


        if (detailsContainer) {

            detailsContainer.innerHTML = "";

        }


        hideResult(
            resultSection
        );


        showMessage(
            messageBox,
            error.message ||
            "Unable to track complaint.",
            "error"
        );


    } finally {

        // =================================================
        // RESTORE BUTTON
        // =================================================

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Track Complaint";

        }

    }

}


// =========================================================
// DISPLAY COMPLAINT
// =========================================================

function displayComplaint(
    complaint
) {

    const resultSection =
        document.getElementById(
            "complaintResult"
        );

    const detailsContainer =
        document.getElementById(
            "complaintDetails"
        );


    if (
        !resultSection ||
        !detailsContainer
    ) {

        return;

    }


    // =====================================================
    // IMPORTANT:
    // Backend generates custom Complaint ID:
    // CMP-xxxxxxxxxxxxx
    // =====================================================

    const complaintId =
        complaint.complaintId ||
        complaint.id ||
        complaint._id ||
        "N/A";


    const category =
        complaint.category ||
        "General";


    const subject =
        complaint.subject ||
        complaint.title ||
        "Complaint";


    const description =
        complaint.description ||
        complaint.details ||
        "No description available.";


    const location =
        complaint.location ||
        "Not available";


    const status =
        complaint.status ||
        "Pending";


    const createdAt =
        complaint.createdAt ||
        complaint.date ||
        complaint.submittedAt;


    const updatedAt =
        complaint.updatedAt ||
        complaint.lastUpdated;


    // =====================================================
    // DISPLAY
    // =====================================================

    detailsContainer.innerHTML = `

        <div class="complaint-result-header">

            <div>

                <span class="complaint-result-label">
                    Complaint ID
                </span>

                <strong class="complaint-result-id">
                    ${escapeHtml(complaintId)}
                </strong>

            </div>

            <span
                class="complaint-status ${getStatusClass(status)}"
            >
                ${escapeHtml(status)}
            </span>

        </div>


        <div class="complaint-result-grid">

            <div class="complaint-result-item">

                <span>
                    Category
                </span>

                <strong>
                    ${escapeHtml(category)}
                </strong>

            </div>


            <div class="complaint-result-item">

                <span>
                    Subject
                </span>

                <strong>
                    ${escapeHtml(subject)}
                </strong>

            </div>


            <div class="complaint-result-item">

                <span>
                    Location
                </span>

                <strong>
                    ${escapeHtml(location)}
                </strong>

            </div>


            <div class="complaint-result-item">

                <span>
                    Submitted On
                </span>

                <strong>
                    ${formatDate(createdAt)}
                </strong>

            </div>


            <div class="complaint-result-item">

                <span>
                    Last Updated
                </span>

                <strong>
                    ${formatDate(updatedAt)}
                </strong>

            </div>

        </div>


        <div class="complaint-description">

            <span>
                Complaint Description
            </span>

            <p>
                ${escapeHtml(description)}
            </p>

        </div>

    `;


    // =====================================================
    // SHOW RESULT
    // =====================================================

    resultSection.style.display =
        "block";


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {

    const value =
        String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");


    if (
        value === "resolved" ||
        value === "closed" ||
        value === "completed"
    ) {

        return "resolved";

    }


    if (
        value === "in-progress" ||
        value === "processing" ||
        value === "under-review"
    ) {

        return "in-progress";

    }


    if (
        value === "rejected" ||
        value === "cancelled"
    ) {

        return "rejected";

    }


    return "pending";

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {

    if (!date) {

        return "Not available";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "Not available";

    }


    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
    messageBox,
    message,
    type
) {

    if (!messageBox) return;


    messageBox.textContent =
        message;


    messageBox.className =
        `form-message ${type}`;


    messageBox.style.display =
        "block";

}


// =========================================================
// HIDE RESULT
// =========================================================

function hideResult(
    resultSection
) {

    if (!resultSection) return;


    resultSection.style.display =
        "none";

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
