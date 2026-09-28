// =========================================================
// SVOS OFFICER - COMPLAINT MANAGEMENT
// =========================================================

const COMPLAINTS_API =
    "http://localhost:5000/api/officer/complaints";

const COMPLAINT_STATUS_API =
    "http://localhost:5000/api/officer/complaints";

let allComplaints = [];
let currentComplaint = null;


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOfficerName();

        loadComplaints();

        setupFilters();

        setupRefresh();

    }
);


// =========================================================
// OFFICER NAME
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
// LOAD COMPLAINTS
// =========================================================

async function loadComplaints() {

    showLoading(true);

    try {

        const response =
            await fetch(
                COMPLAINTS_API
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load complaints."
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load complaints."
            );

        }


        allComplaints =
            Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.complaints)
                    ? result.complaints
                    : [];


        updateComplaintStats(
            allComplaints
        );


        renderComplaints(
            allComplaints
        );


    } catch (error) {

        console.error(
            "Complaints loading error:",
            error
        );


        showLoading(false);

        showMessage(
            error.message ||
            "Unable to load complaints.",
            "error"
        );


        showEmpty(true);

    }

}


// =========================================================
// UPDATE STATS
// =========================================================

function updateComplaintStats(
    complaints
) {

    let pending = 0;
    let processing = 0;
    let resolved = 0;


    complaints.forEach(
        function (complaint) {

            const status =
                normalizeStatus(
                    complaint.status
                );


            if (
                status === "pending"
            ) {

                pending++;

            } else if (
                status === "processing" ||
                status === "under-review"
            ) {

                processing++;

            } else if (
                status === "resolved" ||
                status === "closed"
            ) {

                resolved++;

            }

        }
    );


    setText(
        "totalComplaints",
        complaints.length
    );


    setText(
        "pendingComplaints",
        pending
    );


    setText(
        "processingComplaints",
        processing
    );


    setText(
        "resolvedComplaints",
        resolved
    );

}


// =========================================================
// RENDER COMPLAINTS
// =========================================================

function renderComplaints(
    complaints
) {

    const container =
        document.getElementById(
            "complaintsContainer"
        );


    if (!container) return;


    if (
        !Array.isArray(complaints) ||
        complaints.length === 0
    ) {

        container.innerHTML = "";

        container.style.display =
            "none";

        showLoading(false);

        showEmpty(true);

        return;

    }


    container.innerHTML =
        complaints
            .map(
                createComplaintCard
            )
            .join("");


    container.style.display =
        "grid";


    showLoading(false);

    showEmpty(false);


    setupViewButtons();

}


// =========================================================
// COMPLAINT CARD
// =========================================================

function createComplaintCard(
    complaint
) {

    const complaintId =
        complaint.complaintId ||
        complaint.id ||
        complaint._id ||
        "N/A";


    const citizenName =
        complaint.citizenName ||
        complaint.name ||
        complaint.citizen?.name ||
        "Citizen";


    const category =
        complaint.category ||
        "Other";


    const subject =
        complaint.subject ||
        complaint.title ||
        "Citizen Complaint";


    const description =
        complaint.description ||
        "No description available.";


    const location =
        complaint.location ||
        complaint.address ||
        "Location not provided";


    const status =
        normalizeStatus(
            complaint.status
        );


    const displayStatus =
        getDisplayStatus(
            status
        );


    const submittedDate =
        formatDate(
            complaint.createdAt ||
            complaint.submittedAt ||
            complaint.date
        );


    const updatedDate =
        formatDate(
            complaint.updatedAt ||
            complaint.lastUpdated
        );


    return `

        <div
            class="officer-complaint-card"
            data-status="${escapeHTML(status)}"
            data-category="${escapeHTML(
                normalizeCategory(category)
            )}"
        >

            <div class="officer-complaint-header">

                <div class="complaint-header-info">

                    <div class="complaint-icon">
                        📢
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(subject)}
                        </h3>

                        <span class="complaint-id">
                            ID:
                            ${escapeHTML(
                                complaintId
                            )}
                        </span>

                    </div>

                </div>


                <span class="
                    officer-complaint-status
                    ${getStatusClass(status)}
                ">
                    ${escapeHTML(
                        displayStatus
                    )}
                </span>

            </div>


            <div class="officer-complaint-body">

                <div class="complaint-info-grid">

                    <div class="complaint-info-item">

                        <span>
                            Citizen
                        </span>

                        <strong>
                            ${escapeHTML(
                                citizenName
                            )}
                        </strong>

                    </div>


                    <div class="complaint-info-item">

                        <span>
                            Category
                        </span>

                        <strong>
                            ${escapeHTML(
                                category
                            )}
                        </strong>

                    </div>


                    <div class="complaint-info-item">

                        <span>
                            Location
                        </span>

                        <strong>
                            ${escapeHTML(
                                location
                            )}
                        </strong>

                    </div>


                    <div class="complaint-info-item">

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


                <div class="complaint-description">

                    <span>
                        Description
                    </span>

                    <p>
                        ${escapeHTML(
                            description
                        )}
                    </p>

                </div>


                ${
                    updatedDate !==
                    "Not available"
                        ? `
                            <div
                                class="complaint-updated"
                            >
                                Last Updated:
                                ${escapeHTML(
                                    updatedDate
                                )}
                            </div>
                        `
                        : ""
                }

            </div>


            <div class="officer-complaint-footer">

                <button
                    type="button"
                    class="officer-complaint-view-btn"
                    data-complaint-id="${escapeHTML(
                        complaintId
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
            ".officer-complaint-view-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const complaintId =
                        this.getAttribute(
                            "data-complaint-id"
                        );


                    const complaint =
                        allComplaints.find(
                            function (item) {

                                const itemId =
                                    item.complaintId ||
                                    item.id ||
                                    item._id ||
                                    "";

                                return String(
                                    itemId
                                ) ===
                                String(
                                    complaintId
                                );

                            }
                        );


                    if (!complaint) {

                        showMessage(
                            "Complaint not found.",
                            "error"
                        );

                        return;

                    }


                    showComplaintDetails(
                        complaint
                    );

                }
            );

        }
    );

}


// =========================================================
// COMPLAINT DETAILS
// =========================================================

function showComplaintDetails(
    complaint
) {

    currentComplaint =
        complaint;


    const complaintId =
        complaint.complaintId ||
        complaint.id ||
        complaint._id ||
        "N/A";


    const citizenName =
        complaint.citizenName ||
        complaint.name ||
        complaint.citizen?.name ||
        "Citizen";


    const email =
        complaint.email ||
        complaint.citizen?.email ||
        "Not available";


    const mobile =
        complaint.mobile ||
        complaint.phone ||
        complaint.citizen?.mobile ||
        "Not available";


    const category =
        complaint.category ||
        "Other";


    const subject =
        complaint.subject ||
        complaint.title ||
        "Citizen Complaint";


    const location =
        complaint.location ||
        complaint.address ||
        "Not provided";


    const description =
        complaint.description ||
        "No description available.";


    const status =
        normalizeComplaintStatusValue(
            complaint.status
        );


    const submitted =
        formatDate(
            complaint.createdAt ||
            complaint.submittedAt ||
            complaint.date
        );


    const updated =
        formatDate(
            complaint.updatedAt ||
            complaint.lastUpdated
        );


    const adminRemark =
        complaint.adminRemark ||
        "";


    createComplaintModal();


    const modal =
        document.getElementById(
            "svosComplaintModal"
        );


    if (!modal) return;


    const content =
        modal.querySelector(
            ".svos-complaint-modal-content"
        );


    if (!content) return;


    content.innerHTML = `

        <div class="svos-modal-header">

            <div>

                <span class="svos-modal-label">
                    Citizen Complaint
                </span>

                <h2>
                    ${escapeHTML(subject)}
                </h2>

                <small>
                    Complaint ID:
                    <strong>
                        ${escapeHTML(
                            complaintId
                        )}
                    </strong>
                </small>

            </div>


            <button
                type="button"
                class="svos-modal-close"
                id="svosComplaintModalClose"
            >
                ×
            </button>

        </div>


        <div class="svos-modal-body">

            <div class="svos-detail-grid">

                <div class="svos-detail-item">

                    <span>
                        Citizen
                    </span>

                    <strong>
                        ${escapeHTML(
                            citizenName
                        )}
                    </strong>

                </div>


                <div class="svos-detail-item">

                    <span>
                        Mobile
                    </span>

                    <strong>
                        ${escapeHTML(
                            mobile
                        )}
                    </strong>

                </div>


                <div class="svos-detail-item">

                    <span>
                        Email
                    </span>

                    <strong>
                        ${escapeHTML(
                            email
                        )}
                    </strong>

                </div>


                <div class="svos-detail-item">

                    <span>
                        Category
                    </span>

                    <strong>
                        ${escapeHTML(
                            category
                        )}
                    </strong>

                </div>


                <div class="svos-detail-item">

                    <span>
                        Location
                    </span>

                    <strong>
                        ${escapeHTML(
                            location
                        )}
                    </strong>

                </div>


                <div class="svos-detail-item">

                    <span>
                        Submitted
                    </span>

                    <strong>
                        ${escapeHTML(
                            submitted
                        )}
                    </strong>

                </div>

            </div>


            <div class="svos-detail-section">

                <span>
                    Complaint Description
                </span>

                <p>
                    ${escapeHTML(
                        description
                    )}
                </p>

            </div>


            ${
                updated !== "Not available"
                    ? `
                        <div class="svos-detail-section">

                            <span>
                                Last Updated
                            </span>

                            <p>
                                ${escapeHTML(
                                    updated
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }


            <div class="svos-status-section">

                <label
                    for="svosComplaintStatus"
                >
                    Complaint Status
                </label>


                <select
                    id="svosComplaintStatus"
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
                        value="In Progress"
                        ${
                            status === "In Progress"
                                ? "selected"
                                : ""
                        }
                    >
                        In Progress
                    </option>


                    <option
                        value="Resolved"
                        ${
                            status === "Resolved"
                                ? "selected"
                                : ""
                        }
                    >
                        Resolved
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
                        value="Cancelled"
                        ${
                            status === "Cancelled"
                                ? "selected"
                                : ""
                        }
                    >
                        Cancelled
                    </option>


                    <option
                        value="Closed"
                        ${
                            status === "Closed"
                                ? "selected"
                                : ""
                        }
                    >
                        Closed
                    </option>

                </select>

            </div>


            <div class="svos-remark-section">

                <label
                    for="svosComplaintRemark"
                >
                    Officer Remark
                </label>


                <textarea
                    id="svosComplaintRemark"
                    rows="4"
                    placeholder="Enter remark for the citizen..."
                >${escapeHTML(
                    adminRemark
                )}</textarea>

            </div>


            <div
                id="svosComplaintUpdateMessage"
                class="svos-update-message"
            ></div>

        </div>


        <div class="svos-modal-footer">

            <button
                type="button"
                class="svos-secondary-btn"
                id="svosComplaintCancelBtn"
            >
                Close
            </button>


            <button
                type="button"
                class="svos-primary-btn"
                id="svosComplaintUpdateBtn"
            >
                Update Complaint
            </button>

        </div>

    `;


    modal.classList.add(
        "active"
    );


    setupComplaintModalEvents();

}


// =========================================================
// CREATE MODAL
// =========================================================

function createComplaintModal() {

    let modal =
        document.getElementById(
            "svosComplaintModal"
        );


    if (modal) return;


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "svosComplaintModal";


    modal.className =
        "svos-complaint-modal";


    modal.innerHTML = `

        <div
            class="svos-complaint-modal-overlay"
        ></div>


        <div
            class="svos-complaint-modal-box"
        >

            <div
                class="svos-complaint-modal-content"
            ></div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const overlay =
        modal.querySelector(
            ".svos-complaint-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeComplaintModal
        );

    }

}


// =========================================================
// MODAL EVENTS
// =========================================================

function setupComplaintModalEvents() {

    const closeButton =
        document.getElementById(
            "svosComplaintModalClose"
        );


    const cancelButton =
        document.getElementById(
            "svosComplaintCancelBtn"
        );


    const updateButton =
        document.getElementById(
            "svosComplaintUpdateBtn"
        );


    if (closeButton) {

        closeButton.onclick =
            closeComplaintModal;

    }


    if (cancelButton) {

        cancelButton.onclick =
            closeComplaintModal;

    }


    if (updateButton) {

        updateButton.onclick =
            updateComplaintStatus;

    }

}


// =========================================================
// UPDATE COMPLAINT STATUS
// =========================================================

async function updateComplaintStatus() {

    if (!currentComplaint) {

        return;

    }


    const complaintId =
        currentComplaint.complaintId ||
        currentComplaint.id ||
        currentComplaint._id ||
        "";


    if (!complaintId) {

        showComplaintModalMessage(
            "Complaint ID is missing.",
            "error"
        );

        return;

    }


    const statusElement =
        document.getElementById(
            "svosComplaintStatus"
        );


    const remarkElement =
        document.getElementById(
            "svosComplaintRemark"
        );


    const updateButton =
        document.getElementById(
            "svosComplaintUpdateBtn"
        );


    if (!statusElement) return;


    const status =
        statusElement.value;


    const adminRemark =
        remarkElement
            ? remarkElement.value.trim()
            : "";


    if (!status) {

        showComplaintModalMessage(
            "Please select complaint status.",
            "error"
        );

        return;

    }


    if (
        status === "Rejected" &&
        !adminRemark
    ) {

        showComplaintModalMessage(
            "Please enter a remark when rejecting a complaint.",
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


        showComplaintModalMessage(
            "Updating complaint...",
            "info"
        );


        const response =
            await fetch(
                `${COMPLAINT_STATUS_API}/${encodeURIComponent(
                    complaintId
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
                "Failed to update complaint."
            );

        }


        showComplaintModalMessage(
            result.message ||
            "Complaint updated successfully.",
            "success"
        );


        await loadComplaints();


        const updatedComplaint =
            allComplaints.find(
                function (item) {

                    const itemId =
                        item.complaintId ||
                        item.id ||
                        item._id ||
                        "";

                    return String(
                        itemId
                    ) ===
                    String(
                        complaintId
                    );

                }
            );


        if (updatedComplaint) {

            currentComplaint =
                updatedComplaint;

        }


        setTimeout(
            function () {

                closeComplaintModal();

            },
            700
        );


    } catch (error) {

        console.error(
            "Complaint update error:",
            error
        );


        showComplaintModalMessage(
            error.message ||
            "Unable to update complaint.",
            "error"
        );


    } finally {

        if (updateButton) {

            updateButton.disabled =
                false;

            updateButton.textContent =
                "Update Complaint";

        }

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeComplaintModal() {

    const modal =
        document.getElementById(
            "svosComplaintModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    currentComplaint =
        null;

}


// =========================================================
// MODAL MESSAGE
// =========================================================

function showComplaintModalMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "svosComplaintUpdateMessage"
        );


    if (!element) return;


    element.textContent =
        message;


    element.className =
        "svos-update-message " +
        (type || "info");

}


// =========================================================
// FILTERS
// =========================================================

function setupFilters() {

    const status =
        document.getElementById(
            "complaintStatus"
        );


    const category =
        document.getElementById(
            "complaintCategory"
        );


    const search =
        document.getElementById(
            "complaintSearch"
        );


    if (status) {

        status.addEventListener(
            "change",
            applyFilters
        );

    }


    if (category) {

        category.addEventListener(
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
            "complaintStatus"
        )?.value ||
        "all";


    const selectedCategory =
        document.getElementById(
            "complaintCategory"
        )?.value ||
        "all";


    const search =
        document.getElementById(
            "complaintSearch"
        )?.value
            .trim()
            .toLowerCase() ||
        "";


    const filteredComplaints =
        allComplaints.filter(
            function (complaint) {

                const status =
                    normalizeStatus(
                        complaint.status
                    );


                const category =
                    normalizeCategory(
                        complaint.category
                    );


                const subject =
                    String(
                        complaint.subject ||
                        complaint.title ||
                        ""
                    )
                        .toLowerCase();


                const complaintId =
                    String(
                        complaint.complaintId ||
                        complaint.id ||
                        complaint._id ||
                        ""
                    )
                        .toLowerCase();


                const citizenName =
                    String(
                        complaint.citizenName ||
                        complaint.name ||
                        ""
                    )
                        .toLowerCase();


                const description =
                    String(
                        complaint.description ||
                        ""
                    )
                        .toLowerCase();


                const location =
                    String(
                        complaint.location ||
                        complaint.address ||
                        ""
                    )
                        .toLowerCase();


                const statusMatch =
                    selectedStatus === "all" ||
                    status ===
                        selectedStatus;


                const categoryMatch =
                    selectedCategory === "all" ||
                    category ===
                        normalizeCategory(
                            selectedCategory
                        );


                const searchMatch =
                    !search ||
                    subject.includes(search) ||
                    complaintId.includes(search) ||
                    citizenName.includes(search) ||
                    description.includes(search) ||
                    location.includes(search);


                return (
                    statusMatch &&
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    renderComplaints(
        filteredComplaints
    );

}


// =========================================================
// REFRESH
// =========================================================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshComplaintsBtn"
        );


    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadComplaints();

        }
    );

}


// =========================================================
// NORMALIZE STATUS FOR FILTER/CARD
// =========================================================

function normalizeStatus(
    status
) {

    const value =
        String(
            status || "pending"
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
        value === "processing" ||
        value === "in progress" ||
        value === "in-progress"
    ) {

        return "processing";

    }


    if (
        value === "resolved"
    ) {

        return "resolved";

    }


    if (
        value === "closed"
    ) {

        return "closed";

    }


    if (
        value === "rejected" ||
        value === "declined"
    ) {

        return "rejected";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "cancelled";

    }


    return "pending";

}


// =========================================================
// NORMALIZE EXACT BACKEND STATUS
// =========================================================

function normalizeComplaintStatusValue(
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
        value === "processing" ||
        value === "in progress" ||
        value === "in-progress"
    ) {

        return "In Progress";

    }


    if (
        value === "resolved"
    ) {

        return "Resolved";

    }


    if (
        value === "closed"
    ) {

        return "Closed";

    }


    if (
        value === "rejected" ||
        value === "declined"
    ) {

        return "Rejected";

    }


    if (
        value === "cancelled" ||
        value === "canceled"
    ) {

        return "Cancelled";

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

        case "processing":
            return "In Progress";

        case "resolved":
            return "Resolved";

        case "closed":
            return "Closed";

        case "rejected":
            return "Rejected";

        case "cancelled":
            return "Cancelled";

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
            return "processing";

        case "processing":
            return "processing";

        case "resolved":
            return "resolved";

        case "closed":
            return "resolved";

        case "rejected":
            return "rejected";

        case "cancelled":
            return "rejected";

        default:
            return "pending";

    }

}


// =========================================================
// NORMALIZE CATEGORY
// =========================================================

function normalizeCategory(
    category
) {

    return String(
        category || "other"
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
    date
) {

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
// LOADING
// =========================================================

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "complaintsLoading"
        );


    const container =
        document.getElementById(
            "complaintsContainer"
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
            "complaintsEmpty"
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

    const messageBox =
        document.getElementById(
            "complaintsMessage"
        );


    if (!messageBox) {

        console.log(
            type || "info",
            message
        );

        return;

    }


    messageBox.textContent =
        message;


    messageBox.className =
        "form-message " +
        (type || "info");


    messageBox.style.display =
        "block";


    setTimeout(
        function () {

            messageBox.style.display =
                "none";

        },
        5000
    );

}


// =========================================================
// SET TEXT
// =========================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) return;


    element.textContent =
        Number(value) || 0;

}


// =========================================================
// HTML ESCAPE
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