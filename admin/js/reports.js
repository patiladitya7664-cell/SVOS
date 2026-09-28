const REPORTS_API = "http://localhost:5000/api/admin/reports/summary";


// =========================================================
// LOAD REPORTS
// =========================================================

async function loadReports() {

    const loading = document.getElementById("reportLoading");
    const message = document.getElementById("reportMessage");

    try {

        if (loading) {
            loading.style.display = "flex";
        }

        if (message) {
            message.style.display = "none";
        }


        const response = await fetch(REPORTS_API);

        if (!response.ok) {
            throw new Error("Failed to load reports");
        }


        const result = await response.json();


        if (!result.success) {
            throw new Error(
                result.message || "Unable to load reports"
            );
        }


        const data = result.data || result;


        displayReports(data);


    } catch (error) {

        console.error(
            "Reports loading error:",
            error
        );


        if (loading) {
            loading.style.display = "none";
        }

        if (message) {
            message.style.display = "block";
            message.innerHTML = `
                <h3>Unable to Load Reports</h3>
                <p>
                    Report data could not be loaded from the server.
                </p>
            `;
        }

    } finally {

        if (loading) {
            loading.style.display = "none";
        }

    }

}


// =========================================================
// DISPLAY REPORTS
// =========================================================

function displayReports(data) {

    /*
        Expected backend structure:

        {
            totalCitizens,
            totalApplications,
            totalComplaints,
            totalServices,

            pendingApplications,
            approvedApplications,
            rejectedApplications,
            completedApplications,

            pendingComplaints,
            reviewComplaints,
            resolvedComplaints,
            rejectedComplaints,

            availableServices,
            activeServices,
            mostUsedService,

            registeredCitizens,
            activeCitizens,
            newCitizens
        }
    */


    setText(
        "totalCitizens",
        data.totalCitizens
    );

    setText(
        "totalApplications",
        data.totalApplications
    );

    setText(
        "totalComplaints",
        data.totalComplaints
    );

    setText(
        "totalServices",
        data.totalServices
    );


    // APPLICATION REPORT

    setText(
        "pendingApplications",
        data.pendingApplications
    );

    setText(
        "approvedApplications",
        data.approvedApplications
    );

    setText(
        "rejectedApplications",
        data.rejectedApplications
    );

    setText(
        "completedApplications",
        data.completedApplications
    );


    // COMPLAINT REPORT

    setText(
        "pendingComplaints",
        data.pendingComplaints
    );

    setText(
        "reviewComplaints",
        data.reviewComplaints
    );

    setText(
        "resolvedComplaints",
        data.resolvedComplaints
    );

    setText(
        "rejectedComplaints",
        data.rejectedComplaints
    );


    // SERVICE REPORT

    setText(
        "availableServices",
        data.availableServices
    );

    setText(
        "activeServices",
        data.activeServices
    );

    setText(
        "mostUsedService",
        data.mostUsedService || "—"
    );


    // CITIZEN REPORT

    setText(
        "registeredCitizens",
        data.registeredCitizens
    );

    setText(
        "activeCitizens",
        data.activeCitizens
    );

    setText(
        "newCitizens",
        data.newCitizens
    );

}


// =========================================================
// SAFE TEXT UPDATE
// =========================================================

function setText(elementId, value) {

    const element = document.getElementById(
        elementId
    );

    if (!element) {
        return;
    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        element.textContent = "0";
        return;
    }


    element.textContent = value;

}


// =========================================================
// PAGE INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReports();

    }
);