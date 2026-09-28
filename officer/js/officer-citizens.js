const CITIZENS_API =
    "http://localhost:5000/api/officer/citizens";

let allCitizens = [];

document.addEventListener("DOMContentLoaded", function () {
    loadOfficerName();
    loadCitizens();
    setupSearch();
    setupRefresh();
});


// ================= OFFICER NAME =================

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


// ================= LOAD CITIZENS =================

async function loadCitizens() {

    const container =
        document.getElementById(
            "citizensContainer"
        );

    if (!container) return;

    try {

        container.innerHTML = `
            <div class="loading-state">
                <div>Loading citizens...</div>
            </div>
        `;

        const response =
            await fetch(CITIZENS_API);

        if (!response.ok) {

            throw new Error(
                "Failed to load citizens."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load citizens."
            );

        }

        allCitizens =
            Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.citizens)
                    ? result.citizens
                    : [];

        updateCitizenStats(
            allCitizens
        );

        displayCitizens(
            allCitizens
        );

    } catch (error) {

        console.error(
            "Citizens loading error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">

                <div>👥</div>

                <h3>
                    Unable to Load Citizens
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Citizen data could not be loaded."
                    )}
                </p>

            </div>
        `;

    }

}


// ================= STATS =================

function updateCitizenStats(citizens) {

    const totalElement =
        document.getElementById(
            "totalCitizens"
        );

    const activeElement =
        document.getElementById(
            "activeCitizens"
        );

    const applicationElement =
        document.getElementById(
            "applicationCitizens"
        );

    const complaintElement =
        document.getElementById(
            "complaintCitizens"
        );


    let activeCount = 0;
    let applicationCount = 0;
    let complaintCount = 0;


    citizens.forEach(function (citizen) {

        const status =
            String(
                citizen.status ||
                citizen.accountStatus ||
                "active"
            ).toLowerCase();


        if (
            status === "active" ||
            status === "approved"
        ) {

            activeCount++;

        }


        const applications =
            citizen.applicationCount ??
            citizen.applicationsCount ??
            citizen.totalApplications;

        if (
            Number(applications) > 0 ||
            Array.isArray(citizen.applications) &&
            citizen.applications.length > 0
        ) {

            applicationCount++;

        }


        const complaints =
            citizen.complaintCount ??
            citizen.complaintsCount ??
            citizen.totalComplaints;

        if (
            Number(complaints) > 0 ||
            Array.isArray(citizen.complaints) &&
            citizen.complaints.length > 0
        ) {

            complaintCount++;

        }

    });


    if (totalElement) {

        totalElement.textContent =
            citizens.length;

    }

    if (activeElement) {

        activeElement.textContent =
            activeCount;

    }

    if (applicationElement) {

        applicationElement.textContent =
            applicationCount;

    }

    if (complaintElement) {

        complaintElement.textContent =
            complaintCount;

    }

}


// ================= DISPLAY CITIZENS =================

function displayCitizens(citizens) {

    const container =
        document.getElementById(
            "citizensContainer"
        );

    if (!container) return;


    if (
        !Array.isArray(citizens) ||
        citizens.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div>👥</div>

                <h3>
                    No Citizens Found
                </h3>

                <p>
                    Registered citizens will
                    appear here.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        citizens.map(function (citizen) {

            const citizenId =
                citizen.id ||
                citizen._id ||
                citizen.citizenId ||
                "N/A";


            const name =
                citizen.name ||
                citizen.fullName ||
                citizen.citizenName ||
                "Citizen";


            const email =
                citizen.email ||
                "Not available";


            const mobile =
                citizen.mobile ||
                citizen.phone ||
                citizen.contact ||
                "Not available";


            const village =
                citizen.village ||
                citizen.address?.village ||
                citizen.location ||
                "Not available";


            const status =
                citizen.status ||
                citizen.accountStatus ||
                "Active";


            const registeredDate =
                citizen.createdAt ||
                citizen.registeredAt ||
                citizen.registrationDate ||
                citizen.date;


            return `

                <article class="citizen-card">

                    <div class="citizen-card-header">

                        <div class="citizen-avatar">
                            ${escapeHtml(
                                getInitial(name)
                            )}
                        </div>

                        <div class="citizen-header-info">

                            <h3>
                                ${escapeHtml(name)}
                            </h3>

                            <span>
                                Citizen ID:
                                ${escapeHtml(citizenId)}
                            </span>

                        </div>

                        <span class="citizen-status ${getStatusClass(status)}">
                            ${escapeHtml(status)}
                        </span>

                    </div>


                    <div class="citizen-card-body">

                        <div class="citizen-info-item">

                            <span>
                                📧 Email
                            </span>

                            <strong>
                                ${escapeHtml(email)}
                            </strong>

                        </div>


                        <div class="citizen-info-item">

                            <span>
                                📱 Mobile
                            </span>

                            <strong>
                                ${escapeHtml(mobile)}
                            </strong>

                        </div>


                        <div class="citizen-info-item">

                            <span>
                                📍 Village
                            </span>

                            <strong>
                                ${escapeHtml(village)}
                            </strong>

                        </div>


                        <div class="citizen-info-item">

                            <span>
                                📅 Registered
                            </span>

                            <strong>
                                ${formatDate(
                                    registeredDate
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="citizen-card-footer">

                        <button
                            type="button"
                            class="citizen-view-btn"
                            data-citizen-id="${escapeHtml(citizenId)}"
                        >
                            👁 View Details
                        </button>

                    </div>

                </article>

            `;

        }).join("");


    setupViewButtons();

}


// ================= SEARCH =================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "citizenSearch"
        );

    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        applySearch
    );

}


function applySearch() {

    const searchInput =
        document.getElementById(
            "citizenSearch"
        );

    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (!searchValue) {

        displayCitizens(
            allCitizens
        );

        return;

    }


    const filteredCitizens =
        allCitizens.filter(
            function (citizen) {

                const citizenId =
                    String(
                        citizen.id ||
                        citizen._id ||
                        citizen.citizenId ||
                        ""
                    ).toLowerCase();


                const name =
                    String(
                        citizen.name ||
                        citizen.fullName ||
                        citizen.citizenName ||
                        ""
                    ).toLowerCase();


                const email =
                    String(
                        citizen.email ||
                        ""
                    ).toLowerCase();


                const mobile =
                    String(
                        citizen.mobile ||
                        citizen.phone ||
                        ""
                    ).toLowerCase();


                const village =
                    String(
                        citizen.village ||
                        citizen.location ||
                        ""
                    ).toLowerCase();


                return (
                    citizenId.includes(searchValue) ||
                    name.includes(searchValue) ||
                    email.includes(searchValue) ||
                    mobile.includes(searchValue) ||
                    village.includes(searchValue)
                );

            }
        );


    displayCitizens(
        filteredCitizens
    );

}


// ================= REFRESH =================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshCitizensBtn"
        );

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadCitizens();

        }
    );

}


// ================= VIEW DETAILS =================

function setupViewButtons() {

    const buttons =
        document.querySelectorAll(
            ".citizen-view-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const citizenId =
                    this.dataset.citizenId;


                const citizen =
                    allCitizens.find(
                        function (item) {

                            return String(
                                item.id ||
                                item._id ||
                                item.citizenId ||
                                ""
                            ) === String(
                                citizenId
                            );

                        }
                    );


                if (!citizen) return;


                showCitizenDetails(
                    citizen
                );

            }
        );

    });

}


// ================= CITIZEN DETAILS =================

function showCitizenDetails(citizen) {

    const citizenId =
        citizen.id ||
        citizen._id ||
        citizen.citizenId ||
        "N/A";


    const name =
        citizen.name ||
        citizen.fullName ||
        citizen.citizenName ||
        "Citizen";


    const email =
        citizen.email ||
        "Not available";


    const mobile =
        citizen.mobile ||
        citizen.phone ||
        "Not available";


    const village =
        citizen.village ||
        citizen.location ||
        "Not available";


    const address =
        citizen.address?.fullAddress ||
        citizen.address ||
        citizen.fullAddress ||
        "Not available";


    const status =
        citizen.status ||
        citizen.accountStatus ||
        "Active";


    const registeredDate =
        citizen.createdAt ||
        citizen.registeredAt ||
        citizen.registrationDate;


    alert(

        "Citizen Details\n\n" +

        "Citizen ID: " +
        citizenId +

        "\n\nName: " +
        name +

        "\n\nEmail: " +
        email +

        "\n\nMobile: " +
        mobile +

        "\n\nVillage: " +
        village +

        "\n\nAddress: " +
        address +

        "\n\nStatus: " +
        status +

        "\n\nRegistered: " +
        formatDate(
            registeredDate
        )

    );

}


// ================= HELPERS =================

function getInitial(name) {

    const value =
        String(name || "C").trim();

    return value
        ? value.charAt(0).toUpperCase()
        : "C";

}


function getStatusClass(status) {

    const value =
        String(
            status || ""
        )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");


    if (
        value === "active" ||
        value === "approved"
    ) {

        return "active";

    }


    if (
        value === "blocked" ||
        value === "inactive" ||
        value === "rejected"
    ) {

        return "inactive";

    }


    return "pending";

}


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