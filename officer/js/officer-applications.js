// =========================================================
// SVOS OFFICER - SERVICE APPLICATIONS
// =========================================================

const APPLICATIONS_API =
    "http://localhost:5000/api/applications";

const APPLICATION_STATUS_API =
    "http://localhost:5000/api/applications";

let allApplications = [];
let currentApplication = null;


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOfficerName();

        loadApplications();

        setupFilters();

        setupRefresh();

    }
);


// =========================================================
// LOAD OFFICER NAME
// =========================================================

function loadOfficerName() {

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
            "Officer data error:",
            error
        );

    }

}


// =========================================================
// LOAD APPLICATIONS
// =========================================================

async function loadApplications() {

    const container =
        document.getElementById(
            "applicationsContainer"
        );

    if (!container) return;


    try {

        container.innerHTML = `
            <div class="loading-state">
                <div>
                    Loading applications...
                </div>
            </div>
        `;


        const response =
            await fetch(
                APPLICATIONS_API
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load applications."
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load applications."
            );

        }


        allApplications =
            Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.applications)
                    ? result.applications
                    : [];


        updateApplicationStats(
            allApplications
        );


        displayApplications(
            allApplications
        );


    } catch (error) {

        console.error(
            "Applications loading error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <div>📋</div>

                <h3>
                    Unable to Load Applications
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Application data could not be loaded."
                    )}
                </p>

            </div>
        `;

    }

}


// =========================================================
// UPDATE STATS
// =========================================================

function updateApplicationStats(
    applications
) {

    const totalElement =
        document.getElementById(
            "totalApplications"
        );

    const pendingElement =
        document.getElementById(
            "pendingApplications"
        );

    const processingElement =
        document.getElementById(
            "processingApplications"
        );

    const approvedElement =
        document.getElementById(
            "approvedApplications"
        );


    let pending = 0;
    let processing = 0;
    let approved = 0;


    applications.forEach(
        function (application) {

            const status =
                normalizeStatus(
                    application.status
                );


            if (status === "pending") {

                pending++;

            } else if (
                status === "processing"
            ) {

                processing++;

            } else if (
                status === "approved"
            ) {

                approved++;

            }

        }
    );


    if (totalElement) {

        totalElement.textContent =
            applications.length;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (processingElement) {

        processingElement.textContent =
            processing;

    }


    if (approvedElement) {

        approvedElement.textContent =
            approved;

    }

}


// =========================================================
// DISPLAY APPLICATIONS
// =========================================================

function displayApplications(
    applications
) {

    const container =
        document.getElementById(
            "applicationsContainer"
        );

    if (!container) return;


    if (
        !Array.isArray(applications) ||
        applications.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div>📋</div>

                <h3>
                    No Applications Found
                </h3>

                <p>
                    Citizen service applications
                    will appear here.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        applications
            .map(
                function (application) {

                    const applicationId =
                        application.applicationId ||
                        application.id ||
                        application._id ||
                        "N/A";


                    const citizenName =
                        application.name ||
                        application.citizenName ||
                        application.userName ||
                        "Citizen";


                    const serviceName =
                        application.serviceName ||
                        application.serviceTitle ||
                        application.service ||
                        "Service";


                    const category =
                        application.category ||
                        application.serviceCategory ||
                        "General";


                    const status =
                        application.status ||
                        "Pending";


                    const submittedDate =
                        application.createdAt ||
                        application.submittedAt ||
                        application.date;


                    const mobile =
                        application.mobile ||
                        application.phone ||
                        "";


                    return `
                        <article
                            class="application-card"
                        >

                            <div
                                class="application-card-header"
                            >

                                <div>

                                    <span
                                        class="application-label"
                                    >
                                        Application ID
                                    </span>

                                    <strong
                                        class="application-id"
                                    >
                                        ${escapeHtml(
                                            applicationId
                                        )}
                                    </strong>

                                </div>

                                <span
                                    class="application-status ${getStatusClass(status)}"
                                >
                                    ${escapeHtml(status)}
                                </span>

                            </div>


                            <div
                                class="application-card-body"
                            >

                                <div
                                    class="application-info-grid"
                                >

                                    <div
                                        class="application-info-item"
                                    >

                                        <span>
                                            Citizen
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                citizenName
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="application-info-item"
                                    >

                                        <span>
                                            Service
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                serviceName
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="application-info-item"
                                    >

                                        <span>
                                            Category
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                category
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="application-info-item"
                                    >

                                        <span>
                                            Submitted On
                                        </span>

                                        <strong>
                                            ${formatDate(
                                                submittedDate
                                            )}
                                        </strong>

                                    </div>


                                    ${
                                        mobile
                                            ? `
                                                <div
                                                    class="application-info-item"
                                                >

                                                    <span>
                                                        Mobile
                                                    </span>

                                                    <strong>
                                                        ${escapeHtml(
                                                            mobile
                                                        )}
                                                    </strong>

                                                </div>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>


                            <div
                                class="application-card-footer"
                            >

                                <button
                                    type="button"
                                    class="application-view-btn"
                                    data-application-id="${escapeHtml(
                                        applicationId
                                    )}"
                                >
                                    👁 View Details
                                </button>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    setupViewButtons();

}


// =========================================================
// FILTERS
// =========================================================

function setupFilters() {

    const statusFilter =
        document.getElementById(
            "applicationStatus"
        );

    const searchInput =
        document.getElementById(
            "applicationSearch"
        );


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }

}


// =========================================================
// APPLY FILTERS
// =========================================================

function applyFilters() {

    const statusFilter =
        document.getElementById(
            "applicationStatus"
        );

    const searchInput =
        document.getElementById(
            "applicationSearch"
        );


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filteredApplications =
        allApplications.filter(
            function (application) {

                const applicationStatus =
                    normalizeStatus(
                        application.status
                    );


                const statusMatch =
                    selectedStatus === "all" ||
                    applicationStatus ===
                        selectedStatus;


                const applicationId =
                    String(
                        application.applicationId ||
                        application.id ||
                        application._id ||
                        ""
                    ).toLowerCase();


                const citizenName =
                    String(
                        application.name ||
                        application.citizenName ||
                        application.userName ||
                        ""
                    ).toLowerCase();


                const serviceName =
                    String(
                        application.serviceName ||
                        application.serviceTitle ||
                        application.service ||
                        ""
                    ).toLowerCase();


                const searchMatch =
                    !searchValue ||
                    applicationId.includes(
                        searchValue
                    ) ||
                    citizenName.includes(
                        searchValue
                    ) ||
                    serviceName.includes(
                        searchValue
                    );


                return (
                    statusMatch &&
                    searchMatch
                );

            }
        );


    displayApplications(
        filteredApplications
    );

}


// =========================================================
// REFRESH
// =========================================================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshApplicationsBtn"
        );

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadApplications();

        }
    );

}


// =========================================================
// VIEW BUTTONS
// =========================================================

function setupViewButtons() {

    const buttons =
        document.querySelectorAll(
            ".application-view-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const applicationId =
                        this.dataset.applicationId;


                    const application =
                        allApplications.find(
                            function (item) {

                                const itemId =
                                    item.applicationId ||
                                    item.id ||
                                    item._id ||
                                    "";

                                return String(
                                    itemId
                                ) ===
                                String(
                                    applicationId
                                );

                            }
                        );


                    if (!application) {

                        showMessage(
                            "Application not found.",
                            "error"
                        );

                        return;

                    }


                    showApplicationDetails(
                        application
                    );

                }
            );

        }
    );

}


// =========================================================
// APPLICATION DETAILS
// =========================================================

function showApplicationDetails(
    application
) {

    currentApplication =
        application;


    const applicationId =
        application.applicationId ||
        application.id ||
        application._id ||
        "N/A";


    const citizenName =
        application.name ||
        application.citizenName ||
        application.userName ||
        "Citizen";


    const serviceName =
        application.serviceName ||
        application.serviceTitle ||
        application.service ||
        "Service";


    const status =
        application.status ||
        "Pending";


    const email =
        application.email ||
        "Not available";


    const mobile =
        application.mobile ||
        application.phone ||
        "Not available";


    const address =
        application.address ||
        "Not available";


    const purpose =
        application.purpose ||
        "Not available";


    const additionalDetails =
        application.additionalDetails ||
        application.details ||
        "";


    const documentDetails =
        application.documentDetails ||
        "";


    const adminRemark =
        application.adminRemark ||
        "";


    const submittedDate =
        application.createdAt ||
        application.submittedAt ||
        application.date;


    createApplicationModal();


    const modal =
        document.getElementById(
            "svosApplicationModal"
        );

    if (!modal) return;


    const modalContent =
        modal.querySelector(
            ".svos-application-modal-content"
        );


    if (!modalContent) return;


    modalContent.innerHTML = `

        <div class="svos-modal-header">

            <div>

                <span class="svos-modal-label">
                    Service Application
                </span>

                <h2>
                    ${escapeHtml(
                        serviceName
                    )}
                </h2>

                <small>
                    Application ID:
                    <strong>
                        ${escapeHtml(
                            applicationId
                        )}
                    </strong>
                </small>

            </div>

            <button
                type="button"
                class="svos-modal-close"
                id="svosApplicationModalClose"
            >
                ×
            </button>

        </div>


        <div class="svos-modal-body">

            <div class="svos-detail-grid">

                <div class="svos-detail-item">
                    <span>Citizen Name</span>
                    <strong>
                        ${escapeHtml(
                            citizenName
                        )}
                    </strong>
                </div>


                <div class="svos-detail-item">
                    <span>Mobile</span>
                    <strong>
                        ${escapeHtml(
                            mobile
                        )}
                    </strong>
                </div>


                <div class="svos-detail-item">
                    <span>Email</span>
                    <strong>
                        ${escapeHtml(
                            email
                        )}
                    </strong>
                </div>


                <div class="svos-detail-item">
                    <span>Submitted On</span>
                    <strong>
                        ${formatDate(
                            submittedDate
                        )}
                    </strong>
                </div>

            </div>


            <div class="svos-detail-section">

                <span>
                    Address
                </span>

                <p>
                    ${escapeHtml(
                        address
                    )}
                </p>

            </div>


            <div class="svos-detail-section">

                <span>
                    Purpose
                </span>

                <p>
                    ${escapeHtml(
                        purpose
                    )}
                </p>

            </div>


            ${
                additionalDetails
                    ? `
                        <div class="svos-detail-section">

                            <span>
                                Additional Details
                            </span>

                            <p>
                                ${escapeHtml(
                                    additionalDetails
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                documentDetails
                    ? `
                        <div class="svos-detail-section">

                            <span>
                                Document Details
                            </span>

                            <p>
                                ${escapeHtml(
                                    documentDetails
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="svos-status-section">

                <label
                    for="svosApplicationStatus"
                >
                    Application Status
                </label>

                <select
                    id="svosApplicationStatus"
                >

                    <option
                        value="Pending"
                        ${
                            status === "Pending"
                                ? "selected"
                                : ""
                        }
                    >
                        Pending
                    </option>

                    <option
                        value="Under Review"
                        ${
                            status === "Under Review"
                                ? "selected"
                                : ""
                        }
                    >
                        Under Review
                    </option>

                    <option
                        value="Approved"
                        ${
                            status === "Approved"
                                ? "selected"
                                : ""
                        }
                    >
                        Approved
                    </option>

                    <option
                        value="Rejected"
                        ${
                            status === "Rejected"
                                ? "selected"
                                : ""
                        }
                    >
                        Rejected
                    </option>

                    <option
                        value="Completed"
                        ${
                            status === "Completed"
                                ? "selected"
                                : ""
                        }
                    >
                        Completed
                    </option>

                </select>

            </div>


            <div class="svos-remark-section">

                <label
                    for="svosApplicationRemark"
                >
                    Officer Remark
                </label>

                <textarea
                    id="svosApplicationRemark"
                    rows="4"
                    placeholder="Enter remark for the citizen..."
                >${escapeHtml(
                    adminRemark
                )}</textarea>

            </div>


            <div
                id="svosApplicationUpdateMessage"
                class="svos-update-message"
            ></div>

        </div>


        <div class="svos-modal-footer">

            <button
                type="button"
                class="svos-secondary-btn"
                id="svosApplicationCancelBtn"
            >
                Close
            </button>

            <button
                type="button"
                class="svos-primary-btn"
                id="svosApplicationUpdateBtn"
            >
                Update Application
            </button>

        </div>

    `;


    modal.classList.add(
        "active"
    );


    setupApplicationModalEvents();

}


// =========================================================
// CREATE MODAL
// =========================================================

function createApplicationModal() {

    let modal =
        document.getElementById(
            "svosApplicationModal"
        );


    if (modal) return;


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "svosApplicationModal";


    modal.className =
        "svos-application-modal";


    modal.innerHTML = `

        <div
            class="svos-application-modal-overlay"
        ></div>

        <div
            class="svos-application-modal-box"
        >

            <div
                class="svos-application-modal-content"
            ></div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const overlay =
        modal.querySelector(
            ".svos-application-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeApplicationModal
        );

    }

}


// =========================================================
// MODAL EVENTS
// =========================================================

function setupApplicationModalEvents() {

    const closeButton =
        document.getElementById(
            "svosApplicationModalClose"
        );


    const cancelButton =
        document.getElementById(
            "svosApplicationCancelBtn"
        );


    const updateButton =
        document.getElementById(
            "svosApplicationUpdateBtn"
        );


    if (closeButton) {

        closeButton.onclick =
            closeApplicationModal;

    }


    if (cancelButton) {

        cancelButton.onclick =
            closeApplicationModal;

    }


    if (updateButton) {

        updateButton.onclick =
            updateApplicationStatus;

    }

}


// =========================================================
// UPDATE APPLICATION STATUS
// =========================================================

async function updateApplicationStatus() {

    if (!currentApplication) {

        return;

    }


    const applicationId =
        currentApplication.applicationId ||
        currentApplication.id ||
        currentApplication._id ||
        "";


    if (!applicationId) {

        showModalMessage(
            "Application ID is missing.",
            "error"
        );

        return;

    }


    const statusElement =
        document.getElementById(
            "svosApplicationStatus"
        );


    const remarkElement =
        document.getElementById(
            "svosApplicationRemark"
        );


    const updateButton =
        document.getElementById(
            "svosApplicationUpdateBtn"
        );


    if (!statusElement) return;


    const status =
        statusElement.value;


    const adminRemark =
        remarkElement
            ? remarkElement.value.trim()
            : "";


    if (!status) {

        showModalMessage(
            "Please select application status.",
            "error"
        );

        return;

    }


    if (
        status === "Rejected" &&
        !adminRemark
    ) {

        showModalMessage(
            "Please enter a remark when rejecting an application.",
            "error"
        );

        return;

    }


    try {

        if (updateButton) {

            updateButton.disabled =
                true;

            updateButton.textContent =
                "Updating...";

        }


        showModalMessage(
            "Updating application...",
            "info"
        );


        const response =
            await fetch(
                `${APPLICATION_STATUS_API}/${encodeURIComponent(
                    applicationId
                )}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status,
                        adminRemark
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to update application."
            );

        }


        showModalMessage(
            result.message ||
            "Application updated successfully.",
            "success"
        );


        await loadApplications();


        const updatedApplication =
            allApplications.find(
                function (item) {

                    const itemId =
                        item.applicationId ||
                        item.id ||
                        item._id ||
                        "";

                    return String(
                        itemId
                    ) ===
                    String(
                        applicationId
                    );

                }
            );


        if (updatedApplication) {

            currentApplication =
                updatedApplication;

        }


        setTimeout(
            function () {

                closeApplicationModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "Application update error:",
            error
        );


        showModalMessage(
            error.message ||
            "Unable to update application.",
            "error"
        );


    } finally {

        if (updateButton) {

            updateButton.disabled =
                false;

            updateButton.textContent =
                "Update Application";

        }

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeApplicationModal() {

    const modal =
        document.getElementById(
            "svosApplicationModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    currentApplication =
        null;

}


// =========================================================
// MODAL MESSAGE
// =========================================================

function showModalMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "svosApplicationUpdateMessage"
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "svos-update-message " +
        (type || "info");

}


// =========================================================
// GENERAL MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    console.log(
        type || "info",
        message
    );


    alert(
        message
    );

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    const value =
        String(status || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");


    if (
        value === "in-progress" ||
        value === "inprogress" ||
        value === "processing" ||
        value === "under-review"
    ) {

        return "processing";

    }


    if (
        value === "approved" ||
        value === "accepted" ||
        value === "completed"
    ) {

        return "approved";

    }


    if (
        value === "rejected" ||
        value === "declined"
    ) {

        return "rejected";

    }


    return "pending";

}


// =========================================================
// STATUS CSS CLASS
// =========================================================

function getStatusClass(status) {

    const normalized =
        normalizeStatus(status);


    if (
        normalized === "approved"
    ) {

        return "approved";

    }


    if (
        normalized === "processing"
    ) {

        return "processing";

    }


    if (
        normalized === "rejected"
    ) {

        return "rejected";

    }


    return "pending";

}


// =========================================================
// DATE FORMAT
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