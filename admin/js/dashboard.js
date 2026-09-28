/* =========================================================
   SVOS - ADMIN DASHBOARD
   Backend Integrated Version
   Backend: http://localhost:5000
   ========================================================= */

const ADMIN_API = "http://localhost:5000/api/admin";

// ---------------------------------------------------------
// DOM Ready
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
});


// ---------------------------------------------------------
// Get Authentication Token
// ---------------------------------------------------------
function getAdminToken() {
    return (
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}


// ---------------------------------------------------------
// Load Dashboard Statistics
// ---------------------------------------------------------
async function loadDashboardStats() {
    try {
        showLoadingState();

        const token = getAdminToken();

        const headers = {
            "Content-Type": "application/json"
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${ADMIN_API}/dashboard`, {
            method: "GET",
            headers
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    "Unauthorized. Please login again as administrator."
                );
            }

            throw new Error(
                `Dashboard API failed with status ${response.status}`
            );
        }

        const result = await response.json();

        console.log("Dashboard API Response:", result);

        /*
         * Backend may return:
         *
         * {
         *   totalCitizens,
         *   totalApplications,
         *   pendingApplications,
         *   approvedApplications,
         *   rejectedApplications,
         *   totalServices
         * }
         *
         * Some backends may wrap the response inside "data".
         */

        const data = result.data || result;

        updateDashboardStats(data);

    } catch (error) {
        console.error("Dashboard loading error:", error);

        showDashboardError(error.message);
    }
}


// ---------------------------------------------------------
// Update Dashboard Cards
// ---------------------------------------------------------
function updateDashboardStats(data) {

    updateElement(
        ["totalCitizens", "totalUsers", "citizenCount"],
        data.totalCitizens ?? 0
    );

    updateElement(
        ["totalApplications", "applicationCount"],
        data.totalApplications ?? 0
    );

    updateElement(
        ["pendingApplications", "pendingCount"],
        data.pendingApplications ?? 0
    );

    updateElement(
        ["approvedApplications", "approvedCount"],
        data.approvedApplications ?? 0
    );

    updateElement(
        ["rejectedApplications", "rejectedCount"],
        data.rejectedApplications ?? 0
    );

    updateElement(
        ["totalServices", "serviceCount"],
        data.totalServices ?? 0
    );
}


// ---------------------------------------------------------
// Update Element Helper
// ---------------------------------------------------------
function updateElement(ids, value) {

    if (!Array.isArray(ids)) {
        ids = [ids];
    }

    for (const id of ids) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = Number(value).toLocaleString();
            return;
        }
    }
}


// ---------------------------------------------------------
// Loading State
// ---------------------------------------------------------
function showLoadingState() {

    const possibleIds = [
        "totalCitizens",
        "totalUsers",
        "citizenCount",

        "totalApplications",
        "applicationCount",

        "pendingApplications",
        "pendingCount",

        "approvedApplications",
        "approvedCount",

        "rejectedApplications",
        "rejectedCount",

        "totalServices",
        "serviceCount"
    ];

    possibleIds.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = "...";
        }
    });
}


// ---------------------------------------------------------
// Error State
// ---------------------------------------------------------
function showDashboardError(message) {

    console.error("Dashboard Error:", message);

    const possibleContainers = [
        "dashboardError",
        "errorMessage",
        "dashboardMessage"
    ];

    let errorElement = null;

    for (const id of possibleContainers) {

        const element = document.getElementById(id);

        if (element) {
            errorElement = element;
            break;
        }
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
}


// ---------------------------------------------------------
// Manual Refresh
// ---------------------------------------------------------
async function refreshDashboard() {
    await loadDashboardStats();
}


// ---------------------------------------------------------
// Auto Refresh
// ---------------------------------------------------------
// Dashboard statistics automatically refresh every 60 seconds.
setInterval(() => {

    if (document.visibilityState === "visible") {
        loadDashboardStats();
    }

}, 60000);


// ---------------------------------------------------------
// Make Refresh Available Globally
// ---------------------------------------------------------
window.refreshDashboard = refreshDashboard;
