/* =========================================================
   SVOS ADMIN - COMPLAINTS
   File: admin/js/complaints.js
   ========================================================= */

const COMPLAINTS_API =
    "http://localhost:5000/api/admin/complaints";

let allComplaints = [];


/* =========================================================
   LOAD COMPLAINTS
   ========================================================= */

async function loadComplaints() {

    const container =
        document.getElementById("adminComplaintsContainer");

    try {

        const response = await fetch(
            COMPLAINTS_API
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load complaints"
            );
        }

        allComplaints =
            result.data || [];

        applyComplaintFilters();

    } catch (error) {

        console.error(
            "Complaints Load Error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="empty-state">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <h3>
                        Unable to load complaints
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;
        }
    }
}


/* =========================================================
   DISPLAY COMPLAINTS
   ========================================================= */

function displayComplaints(complaints) {

    const container =
        document.getElementById(
            "adminComplaintsContainer"
        );

    if (!container) {
        return;
    }


    if (
        !complaints ||
        complaints.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-comments"></i>

                <h3>
                    No complaints found
                </h3>

                <p>
                    There are currently no complaints available.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        complaints
            .map((complaint) => {

                return `
                    <div class="complaint-card">

                        <div class="complaint-card-top">

                            <div>

                                <span class="complaint-id">
                                    ${escapeHtml(complaint.id)}
                                </span>

                                <h3>
                                    ${escapeHtml(complaint.subject)}
                                </h3>

                            </div>

                            <span
                                class="complaint-status ${getComplaintStatusClass(
                                    complaint.status
                                )}"
                            >
                                ${escapeHtml(complaint.status)}
                            </span>

                        </div>


                        <div class="complaint-info">

                            <div class="info-item">

                                <i class="fa-solid fa-user"></i>

                                <div>

                                    <span>
                                        Citizen
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            complaint.citizenName ||
                                            "-"
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <i class="fa-solid fa-envelope"></i>

                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            complaint.email ||
                                            "-"
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <i class="fa-solid fa-phone"></i>

                                <div>

                                    <span>
                                        Mobile
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            complaint.mobile ||
                                            "-"
                                        )}
                                    </strong>

                                </div>

                            </div>


                            <div class="info-item">

                                <i class="fa-solid fa-layer-group"></i>

                                <div>

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        ${escapeHtml(
                                            complaint.category ||
                                            "General"
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div class="complaint-description">

                            <span>
                                Description
                            </span>

                            <p>
                                ${escapeHtml(
                                    complaint.description ||
                                    "-"
                                )}
                            </p>

                        </div>


                        <div class="complaint-meta">

                            <span>

                                <i class="fa-regular fa-calendar"></i>

                                Submitted:
                                ${formatComplaintDate(
                                    complaint.createdAt
                                )}

                            </span>


                            <span>

                                <i class="fa-regular fa-clock"></i>

                                Updated:
                                ${formatComplaintDate(
                                    complaint.updatedAt
                                )}

                            </span>

                        </div>


                        <div class="complaint-actions">

                            <select
                                data-complaint-status="${escapeHtml(
                                    complaint.id
                                )}"
                                aria-label="Update complaint status"
                            >

                                <option
                                    value="Pending"
                                    ${
                                        complaint.status ===
                                        "Pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pending
                                </option>

                                <option
                                    value="Under Review"
                                    ${
                                        complaint.status ===
                                        "Under Review"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Under Review
                                </option>

                                <option
                                    value="Resolved"
                                    ${
                                        complaint.status ===
                                        "Resolved"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Resolved
                                </option>

                                <option
                                    value="Rejected"
                                    ${
                                        complaint.status ===
                                        "Rejected"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Rejected
                                </option>

                            </select>


                            <button
                                type="button"
                                class="delete-btn"
                                data-delete-complaint="${escapeHtml(
                                    complaint.id
                                )}"
                            >

                                <i class="fa-solid fa-trash"></i>

                                Delete

                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");


    attachComplaintActions();
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getComplaintStatusClass(status) {

    switch (status) {

        case "Under Review":
            return "review";

        case "Resolved":
            return "resolved";

        case "Rejected":
            return "rejected";

        case "Pending":
        default:
            return "pending";
    }
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatComplaintDate(date) {

    if (!date) {
        return "-";
    }

    const parsedDate =
        new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


/* =========================================================
   UPDATE COMPLAINT STATUS
   ========================================================= */

async function changeComplaintStatus(
    complaintId,
    status
) {

    try {

        const response = await fetch(
            `${COMPLAINTS_API}/${complaintId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to update complaint status"
            );
        }


        const complaint =
            allComplaints.find(
                (item) =>
                    item.id === complaintId
            );


        if (complaint) {
            complaint.status = status;
            complaint.updatedAt =
                result.data?.updatedAt ||
                new Date().toISOString();
        }


        applyComplaintFilters();

    } catch (error) {

        console.error(
            "Complaint Status Error:",
            error
        );

        alert(
            error.message ||
            "Unable to update complaint status"
        );

        loadComplaints();
    }
}


/* =========================================================
   DELETE COMPLAINT
   ========================================================= */

async function removeComplaint(
    complaintId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this complaint?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${COMPLAINTS_API}/${complaintId}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete complaint"
            );
        }


        allComplaints =
            allComplaints.filter(
                (complaint) =>
                    complaint.id !== complaintId
            );


        applyComplaintFilters();

    } catch (error) {

        console.error(
            "Delete Complaint Error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete complaint"
        );
    }
}


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function applyComplaintFilters() {

    const searchInput =
        document.getElementById(
            "complaintSearch"
        );

    const statusFilter =
        document.getElementById(
            "complaintStatusFilter"
        );


    const search =
        searchInput?.value
            ?.toLowerCase()
            .trim() || "";


    const selectedStatus =
        statusFilter?.value ||
        "all";


    const filteredComplaints =
        allComplaints.filter(
            (complaint) => {

                const searchableText = [
                    complaint.id,
                    complaint.subject,
                    complaint.citizenName,
                    complaint.email,
                    complaint.mobile,
                    complaint.category,
                    complaint.description
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(search);


                const matchesStatus =
                    selectedStatus === "all" ||
                    complaint.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    displayComplaints(
        filteredComplaints
    );
}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function attachComplaintActions() {

    const statusSelects =
        document.querySelectorAll(
            "[data-complaint-status]"
        );


    statusSelects.forEach(
        (select) => {

            select.addEventListener(
                "change",
                () => {

                    const complaintId =
                        select.dataset
                            .complaintStatus;

                    changeComplaintStatus(
                        complaintId,
                        select.value
                    );
                }
            );
        }
    );


    const deleteButtons =
        document.querySelectorAll(
            "[data-delete-complaint]"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const complaintId =
                        button.dataset
                            .deleteComplaint;

                    removeComplaint(
                        complaintId
                    );
                }
            );
        }
    );
}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadComplaints();


        const searchInput =
            document.getElementById(
                "complaintSearch"
            );


        const statusFilter =
            document.getElementById(
                "complaintStatusFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyComplaintFilters
            );
        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyComplaintFilters
            );
        }
    }
);