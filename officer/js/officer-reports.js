const REPORTS_API =
    "http://localhost:5000/api/officer/reports";

let reportData = null;

document.addEventListener("DOMContentLoaded", function () {

    loadOfficerName();
    loadReports();
    setupFilters();
    setupRefresh();

});


// =====================================================
// OFFICER NAME
// =====================================================

function loadOfficerName() {

    const userName =
        document.getElementById("userName");

    if (!userName) return;

    try {

        const storedUser =
            JSON.parse(
                localStorage.getItem("svosUser")
            );

        if (storedUser && storedUser.name) {

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


// =====================================================
// LOAD REPORTS
// =====================================================

async function loadReports() {

    showLoading(true);

    try {

        const response =
            await fetch(REPORTS_API);

        if (!response.ok) {

            throw new Error(
                "Failed to load reports."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load reports."
            );

        }

        reportData =
            result.data ||
            result.reports ||
            result;

        updateReportStats(reportData);

        renderReportDetails(reportData);

        showLoading(false);

    } catch (error) {

        console.error(
            "Reports loading error:",
            error
        );

        showLoading(false);

        showMessage(
            error.message ||
            "Unable to load reports.",
            "error"
        );

        showEmpty(true);

    }

}


// =====================================================
// UPDATE SUMMARY STATS
// =====================================================

function updateReportStats(data) {

    const applications =
        data.applications ||
        data.applicationStats ||
        {};

    const complaints =
        data.complaints ||
        data.complaintStats ||
        {};

    const citizens =
        data.citizens ||
        data.citizenStats ||
        {};

    const certificates =
        data.certificates ||
        data.certificateStats ||
        {};


    setText(
        "totalApplicationsReport",
        getNumber(
            applications.total,
            data.totalApplications
        )
    );


    setText(
        "totalComplaintsReport",
        getNumber(
            complaints.total,
            data.totalComplaints
        )
    );


    setText(
        "totalCitizensReport",
        getNumber(
            citizens.total,
            data.totalCitizens
        )
    );


    setText(
        "totalCertificatesReport",
        getNumber(
            certificates.total,
            data.totalCertificates
        )
    );


    // Application status

    setText(
        "pendingApplicationsReport",
        getNumber(
            applications.pending
        )
    );

    setText(
        "processingApplicationsReport",
        getNumber(
            applications.processing,
            applications.inProgress
        )
    );

    setText(
        "approvedApplicationsReport",
        getNumber(
            applications.approved
        )
    );

    setText(
        "rejectedApplicationsReport",
        getNumber(
            applications.rejected
        )
    );


    // Complaint status

    setText(
        "pendingComplaintsReport",
        getNumber(
            complaints.pending
        )
    );

    setText(
        "processingComplaintsReport",
        getNumber(
            complaints.processing,
            complaints.inProgress
        )
    );

    setText(
        "resolvedComplaintsReport",
        getNumber(
            complaints.resolved,
            complaints.completed
        )
    );

    setText(
        "rejectedComplaintsReport",
        getNumber(
            complaints.rejected
        )
    );

}


// =====================================================
// REPORT DETAILS
// =====================================================

function renderReportDetails(data) {

    const container =
        document.getElementById(
            "reportsContainer"
        );

    if (!container) return;


    const applications =
        data.applications ||
        data.applicationStats ||
        {};

    const complaints =
        data.complaints ||
        data.complaintStats ||
        {};

    const citizens =
        data.citizens ||
        data.citizenStats ||
        {};

    const certificates =
        data.certificates ||
        data.certificateStats ||
        {};


    container.innerHTML = `

        <div class="report-detail-grid">

            <div class="report-detail-card">

                <div class="report-detail-icon">
                    📝
                </div>

                <div>

                    <span>
                        Service Applications
                    </span>

                    <strong>
                        ${getNumber(
                            applications.total,
                            data.totalApplications
                        )}
                    </strong>

                </div>

            </div>


            <div class="report-detail-card">

                <div class="report-detail-icon">
                    📢
                </div>

                <div>

                    <span>
                        Complaints
                    </span>

                    <strong>
                        ${getNumber(
                            complaints.total,
                            data.totalComplaints
                        )}
                    </strong>

                </div>

            </div>


            <div class="report-detail-card">

                <div class="report-detail-icon">
                    👥
                </div>

                <div>

                    <span>
                        Citizens
                    </span>

                    <strong>
                        ${getNumber(
                            citizens.total,
                            data.totalCitizens
                        )}
                    </strong>

                </div>

            </div>


            <div class="report-detail-card">

                <div class="report-detail-icon">
                    📄
                </div>

                <div>

                    <span>
                        Certificates
                    </span>

                    <strong>
                        ${getNumber(
                            certificates.total,
                            data.totalCertificates
                        )}
                    </strong>

                </div>

            </div>

        </div>

    `;


    container.style.display =
        "block";

    showEmpty(false);

}


// =====================================================
// FILTERS
// =====================================================

function setupFilters() {

    const period =
        document.getElementById(
            "reportPeriod"
        );

    const type =
        document.getElementById(
            "reportType"
        );


    if (period) {

        period.addEventListener(
            "change",
            function () {

                applyReportFilter();

            }
        );

    }


    if (type) {

        type.addEventListener(
            "change",
            function () {

                applyReportFilter();

            }
        );

    }

}


// =====================================================
// APPLY REPORT FILTER
// =====================================================

function applyReportFilter() {

    if (!reportData) return;


    const reportType =
        document.getElementById(
            "reportType"
        )?.value || "overview";


    if (reportType === "overview") {

        renderReportDetails(
            reportData
        );

        updateReportStats(
            reportData
        );

        return;

    }


    const selectedData =
        getSelectedReportData(
            reportType
        );


    if (!selectedData) {

        showMessage(
            "No data available for this report type.",
            "error"
        );

        return;

    }


    renderSelectedReport(
        reportType,
        selectedData
    );

}


// =====================================================
// SELECT REPORT DATA
// =====================================================

function getSelectedReportData(
    reportType
) {

    if (!reportData) return null;


    switch (reportType) {

        case "applications":

            return (
                reportData.applications ||
                reportData.applicationStats ||
                null
            );


        case "complaints":

            return (
                reportData.complaints ||
                reportData.complaintStats ||
                null
            );


        case "citizens":

            return (
                reportData.citizens ||
                reportData.citizenStats ||
                null
            );


        case "certificates":

            return (
                reportData.certificates ||
                reportData.certificateStats ||
                null
            );


        default:

            return null;

    }

}


// =====================================================
// SELECTED REPORT
// =====================================================

function renderSelectedReport(
    reportType,
    data
) {

    const container =
        document.getElementById(
            "reportsContainer"
        );

    if (!container) return;


    let title =
        "Report";

    let icon =
        "📊";


    if (reportType === "applications") {

        title =
            "Service Applications";

        icon =
            "📝";

    }


    if (reportType === "complaints") {

        title =
            "Complaints";

        icon =
            "📢";

    }


    if (reportType === "citizens") {

        title =
            "Citizens";

        icon =
            "👥";

    }


    if (reportType === "certificates") {

        title =
            "Certificates";

        icon =
            "📄";

    }


    container.innerHTML = `

        <div class="report-selected-card">

            <div class="report-selected-header">

                <div class="report-detail-icon">
                    ${icon}
                </div>

                <div>

                    <h3>
                        ${title}
                    </h3>

                    <p>
                        Detailed report summary
                    </p>

                </div>

            </div>


            <div class="report-stat-grid">

                ${createReportValue(
                    "Total",
                    data.total
                )}

                ${createReportValue(
                    "Pending",
                    data.pending
                )}

                ${createReportValue(
                    "Processing",
                    data.processing ??
                    data.inProgress
                )}

                ${createReportValue(
                    "Approved / Resolved",
                    data.approved ??
                    data.resolved ??
                    data.completed
                )}

                ${createReportValue(
                    "Rejected",
                    data.rejected
                )}

            </div>

        </div>

    `;


    container.style.display =
        "block";

    showEmpty(false);

}


// =====================================================
// REPORT VALUE CARD
// =====================================================

function createReportValue(
    label,
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        value = 0;

    }


    return `

        <div class="report-stat-card">

            <span>
                ${label}
            </span>

            <strong>
                ${Number(value) || 0}
            </strong>

        </div>

    `;

}


// =====================================================
// REFRESH
// =====================================================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshReportsBtn"
        );

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadReports();

        }
    );

}


// =====================================================
// LOADING
// =====================================================

function showLoading(show) {

    const loading =
        document.getElementById(
            "reportsLoading"
        );

    const container =
        document.getElementById(
            "reportsContainer"
        );


    if (loading) {

        loading.style.display =
            show
                ? "block"
                : "none";

    }


    if (show && container) {

        container.style.display =
            "none";

    }

}


// =====================================================
// EMPTY STATE
// =====================================================

function showEmpty(show) {

    const empty =
        document.getElementById(
            "reportsEmpty"
        );

    if (!empty) return;


    empty.style.display =
        show
            ? "block"
            : "none";

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "reportsMessage"
        );

    if (!messageBox) return;


    messageBox.textContent =
        message;

    messageBox.className =
        "form-message " + type;

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


// =====================================================
// HELPERS
// =====================================================

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


function getNumber(
    primary,
    fallback = 0
) {

    if (
        primary !== undefined &&
        primary !== null
    ) {

        return Number(primary) || 0;

    }


    return Number(fallback) || 0;

}