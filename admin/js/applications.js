// =========================================================
// SVOS ADMIN - APPLICATION MANAGEMENT
// =========================================================

const APPLICATIONS_API =
    "http://localhost:5000/api/applications";

let allApplications = [];
let currentApplication = null;


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadApplications();

        setupFilters();

        setupRefresh();

    }
);


// =========================================================
// LOAD APPLICATIONS
// =========================================================

async function loadApplications() {

    showLoading(true);

    try {

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
                : [];


        updateStats(
            allApplications
        );


        populateServiceFilter(
            allApplications
        );


        renderApplications(
            allApplications
        );


    } catch (error) {

        console.error(
            "Applications loading error:",
            error
        );


        showLoading(false);

        showMessage(
            error.message ||
            "Unable to load applications.",
            "error"
        );


        showEmpty(true);

    }

}


// =========================================================
// UPDATE STATS
// =========================================================

function updateStats(
    applications
) {

    let pending = 0;
    let review = 0;
    let approved = 0;


    applications.forEach(
        function (application) {

            const status =
                normalizeStatus(
                    application.status
                );


            if (
                status === "pending"
            ) {

                pending++;

            }


            if (
                status === "under-review"
            ) {

                review++;

            }


            if (
                status === "approved"
            ) {

                approved++;

            }

        }
    );


    setText(
        "totalApplications",
        applications.length
    );


    setText(
        "pendingApplications",
        pending
    );


    setText(
        "reviewApplications",
        review
    );


    setText(
        "approvedApplications",
        approved
    );

}


// =========================================================
// SERVICE FILTER
// =========================================================

function populateServiceFilter(
    applications
) {

    const select =
        document.getElementById(
            "applicationService"
        );


    if (!select) return;


    const currentValue =
        select.value;


    const services =
        [
            ...new Set(
                applications
                    .map(
                        function (application) {

                            return String(
                                application.serviceName ||
                                ""
                            ).trim();

                        }
                    )
                    .filter(Boolean)
            )
        ]
            .sort(
                function (a, b) {

                    return a.localeCompare(
                        b
                    );

                }
            );


    select.innerHTML = `
        <option value="all">
            All Services
        </option>
    `;


    services.forEach(
        function (service) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                service;

            option.textContent =
                service;

            select.appendChild(
                option
            );

        }
    );


    if (
        services.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


// =========================================================
// RENDER APPLICATIONS
// =========================================================

function renderApplications(
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

        container.innerHTML = "";

        container.style.display =
            "none";

        showLoading(false);

        showEmpty(true);

        return;

    }


    container.innerHTML =
        applications
            .map(
                createApplicationCard
            )
            .join("");


    container.style.display =
        "grid";


    showLoading(false);

    showEmpty(false);


    setupViewButtons();

}


// =========================================================
// APPLICATION CARD
// =========================================================

function createApplicationCard(
    application
) {

    const applicationId =
        application.applicationId ||
        application._id ||
        "N/A";


    const serviceName =
        application.serviceName ||
        "Government Service";


    const citizenName =
        application.name ||
        "Citizen";


    const email =
        application.email ||
        "Not available";


    const mobile =
        application.mobile ||
        "Not available";


    const status =
        normalizeStatus(
            application.status
        );


    const displayStatus =
        getDisplayStatus(
            status
        );


    const submittedDate =
        formatDate(
            application.createdAt
        );


    return `

        <div class="application-card">

            <div class="application-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            serviceName
                        )}
                    </h3>

                    <span class="application-id">
                        ID:
                        ${escapeHTML(
                            applicationId
                        )}
                    </span>

                </div>


                <span
                    class="
                        application-status
                        ${getStatusClass(status)}
                    "
                >
                    ${escapeHTML(
                        displayStatus
                    )}
                </span>

            </div>


            <div class="application-card-body">

                <div class="application-service">
                    Applicant Details
                </div>


                <div class="application-info-grid">

                    <div class="application-info-item">

                        <span>
                            Citizen
                        </span>

                        <strong>
                            ${escapeHTML(
                                citizenName
                            )}
                        </strong>

                    </div>


                    <div class="application-info-item">

                        <span>
                            Mobile
                        </span>

                        <strong>
                            ${escapeHTML(
                                mobile
                            )}
                        </strong>

                    </div>


                    <div class="application-info-item">

                        <span>
                            Email
                        </span>

                        <strong>
                            ${escapeHTML(
                                email
                            )}
                        </strong>

                    </div>


                    <div class="application-info-item">

                        <span>
                            Submitted
                        </span>

                        <strong>
                            ${escapeHTML(
                                submittedDate
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="application-card-footer">

                <button
                    type="button"
                    class="view-application-btn"
                    data-application-id="${escapeHTML(
                        applicationId
                    )}"
                >
                    View Details
                </button>

            </div>

        </div>

    `;

}


// =========================================================
// VIEW BUTTONS
// =========================================================

function setupViewButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-application-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const applicationId =
                        this.getAttribute(
                            "data-application-id"
                        );


                    const application =
                        allApplications.find(
                            function (item) {

                                const id =
                                    item.applicationId ||
                                    item._id ||
                                    "";

                                return String(
                                    id
                                ) ===
                                String(
                                    applicationId
                                );

                            }
                        );


                    if (application) {

                        showApplicationDetails(
                            application
                        );

                    }

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
        application._id ||
        "N/A";


    const status =
        normalizeExactStatus(
            application.status
        );


    createApplicationModal();


    const modal =
        document.getElementById(
            "applicationModal"
        );


    const content =
        modal?.querySelector(
            ".application-modal-content"
        );


    if (!content) return;


    content.innerHTML = `

        <div class="application-modal-header">

            <div>

                <h2>
                    Application Details
                </h2>

                <small>
                    Application ID:
                    <strong>
                        ${escapeHTML(
                            applicationId
                        )}
                    </strong>
                </small>

            </div>


            <button
                type="button"
                class="modal-close"
                id="applicationModalClose"
            >
                ×
            </button>

        </div>


        <div class="application-modal-body">

            <div class="modal-detail-grid">

                <div class="modal-detail-item">

                    <span>
                        Service
                    </span>

                    <strong>
                        ${escapeHTML(
                            application.serviceName ||
                            "Government Service"
                        )}
                    </strong>

                </div>


                <div class="modal-detail-item">

                    <span>
                        Applicant
                    </span>

                    <strong>
                        ${escapeHTML(
                            application.name ||
                            "Citizen"
                        )}
                    </strong>

                </div>


                <div class="modal-detail-item">

                    <span>
                        Email
                    </span>

                    <strong>
                        ${escapeHTML(
                            application.email ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="modal-detail-item">

                    <span>
                        Mobile
                    </span>

                    <strong>
                        ${escapeHTML(
                            application.mobile ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="modal-detail-item">

                    <span>
                        Submitted
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                application.createdAt
                            )
                        )}
                    </strong>

                </div>


                <div class="modal-detail-item">

                    <span>
                        Processed
                    </span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                application.processedAt
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div class="modal-section">

                <span>
                    Address
                </span>

                <p>
                    ${escapeHTML(
                        application.address ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="modal-section">

                <span>
                    Purpose
                </span>

                <p>
                    ${escapeHTML(
                        application.purpose ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="modal-section">

                <span>
                    Additional Details
                </span>

                <p>
                    ${escapeHTML(
                        application.additionalDetails ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="modal-section">

                <span>
                    Document Details
                </span>

                <p>
                    ${escapeHTML(
                        application.documentDetails ||
                        "Not provided"
                    )}
                </p>

            </div>


            <div class="modal-control">

                <label for="applicationStatusControl">
                    Application Status
                </label>

                <select
                    id="applicationStatusControl"
                >

                    <option
                        value="Pending"
                        ${status === "Pending"
                            ? "selected"
                            : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Under Review"
                        ${status === "Under Review"
                            ? "selected"
                            : ""}
                    >
                        Under Review
                    </option>

                    <option
                        value="Approved"
                        ${status === "Approved"
                            ? "selected"
                            : ""}
                    >
                        Approved
                    </option>

                    <option
                        value="Rejected"
                        ${status === "Rejected"
                            ? "selected"
                            : ""}
                    >
                        Rejected
                    </option>

                    <option
                        value="Completed"
                        ${status === "Completed"
                            ? "selected"
                            : ""}
                    >
                        Completed
                    </option>

                </select>

            </div>


            <div class="modal-control">

                <label for="applicationRemark">
                    Admin Remark
                </label>

                <textarea
                    id="applicationRemark"
                    rows="4"
                    placeholder="Enter remark..."
                >${escapeHTML(
                    application.adminRemark ||
                    ""
                )}</textarea>

            </div>


            <div
                id="applicationModalMessage"
                class="modal-message"
            ></div>

        </div>


        <div class="modal-footer">

            <button
                type="button"
                id="applicationCancelBtn"
            >
                Close
            </button>


            <button
                type="button"
                id="applicationUpdateBtn"
            >
                Update Application
            </button>

        </div>

    `;


    modal.classList.add(
        "active"
    );


    setupModalEvents();

}


// =========================================================
// CREATE MODAL
// =========================================================

function createApplicationModal() {

    let modal =
        document.getElementById(
            "applicationModal"
        );


    if (modal) return;


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "applicationModal";


    modal.className =
        "application-modal";


    modal.innerHTML = `

        <div
            class="application-modal-overlay"
        ></div>


        <div class="application-modal-box">

            <div
                class="application-modal-content"
            ></div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const overlay =
        modal.querySelector(
            ".application-modal-overlay"
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

function setupModalEvents() {

    const closeButton =
        document.getElementById(
            "applicationModalClose"
        );


    const cancelButton =
        document.getElementById(
            "applicationCancelBtn"
        );


    const updateButton =
        document.getElementById(
            "applicationUpdateBtn"
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
// UPDATE STATUS
// =========================================================

async function updateApplicationStatus() {

    if (!currentApplication) {
        return;
    }


    const applicationId =
        currentApplication.applicationId ||
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
            "applicationStatusControl"
        );


    const remarkElement =
        document.getElementById(
            "applicationRemark"
        );


    const updateButton =
        document.getElementById(
            "applicationUpdateBtn"
        );


    const status =
        statusElement?.value;


    const adminRemark =
        remarkElement?.value.trim() ||
        "";


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


        const response =
            await fetch(
                `${APPLICATIONS_API}/${encodeURIComponent(
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


        if (
            !response.ok ||
            !result.success
        ) {

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
            "applicationModal"
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
            "applicationModalMessage"
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "modal-message " +
        (type || "info");

}


// =========================================================
// FILTERS
// =========================================================

function setupFilters() {

    const status =
        document.getElementById(
            "applicationStatus"
        );


    const service =
        document.getElementById(
            "applicationService"
        );


    const search =
        document.getElementById(
            "applicationSearch"
        );


    if (status) {

        status.addEventListener(
            "change",
            applyFilters
        );

    }


    if (service) {

        service.addEventListener(
            "change",
            applyFilters
        );

    }


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );

    }

}


// =========================================================
// APPLY FILTERS
// =========================================================

function applyFilters() {

    const selectedStatus =
        document.getElementById(
            "applicationStatus"
        )?.value ||
        "all";


    const selectedService =
        document.getElementById(
            "applicationService"
        )?.value ||
        "all";


    const search =
        document.getElementById(
            "applicationSearch"
        )?.value
            .trim()
            .toLowerCase() ||
        "";


    const filtered =
        allApplications.filter(
            function (application) {

                const status =
                    normalizeStatus(
                        application.status
                    );


                const service =
                    String(
                        application.serviceName ||
                        ""
                    );


                const searchableText =
                    [
                        application.applicationId,
                        application.name,
                        application.email,
                        application.mobile,
                        application.address,
                        application.purpose,
                        application.serviceName
                    ]
                        .map(
                            function (value) {

                                return String(
                                    value || ""
                                ).toLowerCase();

                            }
                        );


                const statusMatch =
                    selectedStatus === "all" ||
                    status ===
                        selectedStatus;


                const serviceMatch =
                    selectedService === "all" ||
                    service ===
                        selectedService;


                const searchMatch =
                    !search ||
                    searchableText.some(
                        function (value) {

                            return value.includes(
                                search
                            );

                        }
                    );


                return (
                    statusMatch &&
                    serviceMatch &&
                    searchMatch
                );

            }
        );


    renderApplications(
        filtered
    );

}


// =========================================================
// REFRESH
// =========================================================

function setupRefresh() {

    const button =
        document.getElementById(
            "refreshApplicationsBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            loadApplications();

        }
    );

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(
    status
) {

    const value =
        String(
            status || "Pending"
        )
            .trim()
            .toLowerCase();


    if (
        value === "under review" ||
        value === "under-review" ||
        value === "under_review"
    ) {

        return "under-review";

    }


    if (
        value === "approved" ||
        value === "accepted"
    ) {

        return "approved";

    }


    if (
        value === "rejected" ||
        value === "declined"
    ) {

        return "rejected";

    }


    if (
        value === "completed"
    ) {

        return "completed";

    }


    return "pending";

}


// =========================================================
// EXACT STATUS
// =========================================================

function normalizeExactStatus(
    status
) {

    const value =
        String(
            status || "Pending"
        )
            .trim()
            .toLowerCase();


    if (
        value === "under review" ||
        value === "under-review" ||
        value === "under_review"
    ) {

        return "Under Review";

    }


    if (
        value === "approved" ||
        value === "accepted"
    ) {

        return "Approved";

    }


    if (
        value === "rejected" ||
        value === "declined"
    ) {

        return "Rejected";

    }


    if (
        value === "completed"
    ) {

        return "Completed";

    }


    return "Pending";

}


// =========================================================
// DISPLAY STATUS
// =========================================================

function getDisplayStatus(
    status
) {

    switch (status) {

        case "under-review":
            return "Under Review";

        case "approved":
            return "Approved";

        case "rejected":
            return "Rejected";

        case "completed":
            return "Completed";

        default:
            return "Pending";

    }

}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(
    status
) {

    switch (status) {

        case "under-review":
            return "status-review";

        case "approved":
            return "status-approved";

        case "rejected":
            return "status-rejected";

        case "completed":
            return "status-completed";

        default:
            return "status-pending";

    }

}


// =========================================================
// DATE
// =========================================================

function formatDate(
    date
) {

    if (!date) {

        return "Not available";

    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return "Not available";

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// LOADING
// =========================================================

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "applicationsLoading"
        );


    const container =
        document.getElementById(
            "applicationsContainer"
        );


    if (loading) {

        loading.style.display =
            show
                ? "block"
                : "none";

    }


    if (
        show &&
        container
    ) {

        container.style.display =
            "none";

    }

}


// =========================================================
// EMPTY
// =========================================================

function showEmpty(
    show
) {

    const empty =
        document.getElementById(
            "applicationsEmpty"
        );


    if (!empty) return;


    empty.style.display =
        show
            ? "block"
            : "none";

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "applicationMessage"
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "application-message " +
        (type || "info");


    element.style.display =
        "block";


    setTimeout(
        function () {

            element.style.display =
                "none";

        },
        5000
    );

}


// =========================================================
// SET TEXT
// =========================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) return;


    element.textContent =
        Number(value) || 0;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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