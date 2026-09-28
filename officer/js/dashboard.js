/* =========================================================
   SVOS - OFFICER DASHBOARD
   Backend Integrated
   API: /api/officer/dashboard
========================================================= */

const DASHBOARD_API =
    "http://localhost:5000/api/officer/dashboard";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOfficerName();

        loadDashboard();

        setupLogout();

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
            "❌ Officer data error:",
            error
        );

    }

}


// =========================================================
// LOAD DASHBOARD DATA
// =========================================================

async function loadDashboard() {

    setLoading();


    try {

        console.log(
            "📡 Loading officer dashboard..."
        );


        const response =
            await fetch(
                DASHBOARD_API
            );


        if (!response.ok) {

            throw new Error(
                `Dashboard API failed: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "📊 Dashboard response:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load dashboard."
            );

        }


        const data =
            result.data || {};


        // =================================================
        // TOTAL CITIZENS
        // =================================================

        const totalCitizens =
            Number(
                data.totalCitizens || 0
            );


        // =================================================
        // PENDING COMPLAINTS
        // =================================================

        const pendingComplaints =
            Number(
                data.complaints?.pending || 0
            );


        // =================================================
        // TOTAL APPLICATIONS
        // =================================================

        const totalApplications =
            Number(
                data.applications?.total || 0
            );


        // =================================================
        // RESOLVED COMPLAINTS
        // =================================================

        const resolvedComplaints =
            Number(
                data.complaints?.resolved || 0
            );


        // =================================================
        // UPDATE UI
        // =================================================

        setStat(
            0,
            totalCitizens
        );


        setStat(
            1,
            pendingComplaints
        );


        setStat(
            2,
            totalApplications
        );


        setStat(
            3,
            resolvedComplaints
        );


        console.log(
            "✅ Dashboard updated:",
            {
                totalCitizens,
                pendingComplaints,
                totalApplications,
                resolvedComplaints
            }
        );


    } catch (error) {

        console.error(
            "❌ Dashboard loading error:",
            error
        );


        setErrorState();

    }

}


// =========================================================
// SET STAT CARD
// =========================================================

function setStat(
    cardIndex,
    value
) {

    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (
        !statCards[cardIndex]
    ) {

        return;

    }


    const numberElement =
        statCards[cardIndex]
            .querySelector("h3");


    if (!numberElement) {

        return;

    }


    numberElement.textContent =
        Number(value) || 0;

}


// =========================================================
// LOADING STATE
// =========================================================

function setLoading() {

    const statNumbers =
        document.querySelectorAll(
            ".stat-card h3"
        );


    statNumbers.forEach(
        function (element) {

            element.textContent =
                "...";

        }
    );

}


// =========================================================
// ERROR STATE
// =========================================================

function setErrorState() {

    const statNumbers =
        document.querySelectorAll(
            ".stat-card h3"
        );


    statNumbers.forEach(
        function (element) {

            element.textContent =
                "0";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) return;


    logoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            console.log(
                "🚪 Officer logout"
            );


            localStorage.removeItem(
                "svosUser"
            );

            localStorage.removeItem(
                "svosToken"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );


            sessionStorage.clear();


            window.location.href =
                "../login.html";

        }
    );

}
