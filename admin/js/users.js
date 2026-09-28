/* =========================================================
   SVOS ADMIN - USERS MANAGEMENT
   ========================================================= */

const USERS_API = "http://localhost:5000/api/admin/citizens";
let allUsers = [];


/* =========================================================
   LOAD USERS
   ========================================================= */

async function loadUsers() {

    const container = document.getElementById("usersContainer");

    try {

        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div>Loading users...</div>
                </div>
            `;
        }

        const response = await fetch(USERS_API);

        if (!response.ok) {
            throw new Error("Failed to load users");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.message || "Unable to load users"
            );
        }

        /*
         * Backend may return:
         * result.data
         * or result.users
         */

        allUsers = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.users)
                ? result.users
                : [];

        displayUsers(allUsers);

    } catch (error) {

        console.error("Users loading error:", error);

        if (container) {

            container.innerHTML = `
                <div class="empty-state">
                    <div>⚠️</div>
                    <h3>Unable to Load Users</h3>
                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Something went wrong while loading users."
                        )}
                    </p>
                </div>
            `;
        }
    }
}


/* =========================================================
   DISPLAY USERS
   ========================================================= */

function displayUsers(users) {

    const container = document.getElementById("usersContainer");

    if (!container) return;


    if (!Array.isArray(users) || users.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div>👥</div>
                <h3>No Users Found</h3>
                <p>
                    No users match the selected search or filters.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = users.map(user => {

        const userName =
            user.name ||
            user.fullName ||
            "Unknown User";

        const email =
            user.email ||
            "No email available";

        const mobile =
            user.mobile ||
            user.phone ||
            "Not provided";

        const role =
            user.role ||
            "Citizen";

        const status =
            user.status ||
            user.accountStatus ||
            "Active";

        const createdAt =
            user.createdAt ||
            user.registeredAt ||
            user.created_at;


        return `
            <div class="user-card">

                <div class="user-card-top">

                    <div class="user-avatar-large">
                        ${getUserInitials(userName)}
                    </div>

                    <div class="user-main-info">

                        <h3 class="user-name">
                            ${escapeHtml(userName)}
                        </h3>

                        <span class="user-role ${getRoleClass(role)}">
                            ${escapeHtml(role)}
                        </span>

                    </div>

                    <span class="user-status ${getUserStatusClass(status)}">
                        ${escapeHtml(status)}
                    </span>

                </div>


                <div class="user-info-list">

                    <div class="user-info-item">

                        <span class="user-info-label">
                            📧 Email
                        </span>

                        <span class="user-info-value">
                            ${escapeHtml(email)}
                        </span>

                    </div>


                    <div class="user-info-item">

                        <span class="user-info-label">
                            📱 Mobile
                        </span>

                        <span class="user-info-value">
                            ${escapeHtml(mobile)}
                        </span>

                    </div>


                    <div class="user-info-item">

                        <span class="user-info-label">
                            📅 Registered
                        </span>

                        <span class="user-info-value">
                            ${formatUserDate(createdAt)}
                        </span>

                    </div>

                </div>


                <div class="user-card-actions">

                    ${
                        status.toLowerCase() === "blocked"
                            ? `
                                <button
                                    type="button"
                                    class="status-btn activate-btn"
                                    data-user-id="${escapeHtml(user.id || user._id || "")}"
                                    data-user-status="${escapeHtml(status)}"
                                >
                                    ✅ Activate
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="status-btn block-btn"
                                    data-user-id="${escapeHtml(user.id || user._id || "")}"
                                    data-user-status="${escapeHtml(status)}"
                                >
                                    🚫 Block
                                </button>
                            `
                    }

                </div>

            </div>
        `;

    }).join("");


    attachUserActions();
}


/* =========================================================
   USER INITIALS
   ========================================================= */

function getUserInitials(name) {

    if (!name) return "U";

    const words = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getUserStatusClass(status) {

    const value = String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    if (
        value === "active" ||
        value === "approved"
    ) {
        return "active";
    }

    if (
        value === "inactive" ||
        value === "pending"
    ) {
        return "inactive";
    }

    if (value === "blocked") {
        return "blocked";
    }

    return "inactive";
}


/* =========================================================
   ROLE CLASS
   ========================================================= */

function getRoleClass(role) {

    const value = String(role || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    if (value === "admin") {
        return "admin";
    }

    return "citizen";
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatUserDate(date) {

    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* =========================================================
   CHANGE USER STATUS
   ========================================================= */

async function changeUserStatus(userId, currentStatus) {

    if (!userId) {
        alert("User ID is missing.");
        return;
    }


    const isBlocked =
        String(currentStatus).toLowerCase() === "blocked";

    const newStatus =
        isBlocked ? "Active" : "Blocked";


    const actionText =
        newStatus === "Blocked"
            ? "block"
            : "activate";


    const confirmed = confirm(
        `Are you sure you want to ${actionText} this user?`
    );

    if (!confirmed) return;


    try {

        const response = await fetch(
            `${USERS_API}/${encodeURIComponent(userId)}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to update user status"
            );
        }


        /*
         * Update local data immediately.
         */

        allUsers = allUsers.map(user => {

            const id = user.id || user._id;

            if (String(id) === String(userId)) {

                return {
                    ...user,
                    status: newStatus,
                    accountStatus: newStatus
                };

            }

            return user;

        });


        applyUserFilters();


        alert(
            `User ${newStatus.toLowerCase()} successfully.`
        );


    } catch (error) {

        console.error(
            "User status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update user status."
        );
    }
}


/* =========================================================
   FILTER USERS
   ========================================================= */

function applyUserFilters() {

    const searchInput =
        document.getElementById("userSearch");

    const statusFilter =
        document.getElementById("userStatusFilter");

    const roleFilter =
        document.getElementById("userRoleFilter");


    const searchValue =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    const selectedRole =
        roleFilter
            ? roleFilter.value
            : "all";


    const filteredUsers = allUsers.filter(user => {

        const name =
            user.name ||
            user.fullName ||
            "";

        const email =
            user.email ||
            "";

        const mobile =
            user.mobile ||
            user.phone ||
            "";

        const role =
            user.role ||
            "Citizen";

        const status =
            user.status ||
            user.accountStatus ||
            "Active";


        const searchableText = `
            ${name}
            ${email}
            ${mobile}
        `.toLowerCase();


        const matchesSearch =
            !searchValue ||
            searchableText.includes(searchValue);


        const matchesStatus =
            selectedStatus === "all" ||
            String(status).toLowerCase() ===
                selectedStatus.toLowerCase();


        const matchesRole =
            selectedRole === "all" ||
            String(role).toLowerCase() ===
                selectedRole.toLowerCase();


        return (
            matchesSearch &&
            matchesStatus &&
            matchesRole
        );
    });


    displayUsers(filteredUsers);
}


/* =========================================================
   ATTACH USER ACTIONS
   ========================================================= */

function attachUserActions() {

    const statusButtons =
        document.querySelectorAll(
            ".status-btn"
        );


    statusButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const userId =
                    button.dataset.userId;

                const userStatus =
                    button.dataset.userStatus;


                changeUserStatus(
                    userId,
                    userStatus
                );

            }
        );

    });
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIALIZE USERS PAGE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById("userSearch");

        const statusFilter =
            document.getElementById(
                "userStatusFilter"
            );

        const roleFilter =
            document.getElementById(
                "userRoleFilter"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyUserFilters
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyUserFilters
            );

        }


        if (roleFilter) {

            roleFilter.addEventListener(
                "change",
                applyUserFilters
            );

        }


        loadUsers();

    }
);