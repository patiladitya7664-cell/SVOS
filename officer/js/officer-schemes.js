const SCHEMES_API =
    "http://localhost:5000/api/officer/schemes";

let allSchemes = [];

document.addEventListener("DOMContentLoaded", function () {

    loadOfficerName();
    loadSchemes();
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
// LOAD SCHEMES
// =====================================================

async function loadSchemes() {

    showLoading(true);

    try {

        const response =
            await fetch(SCHEMES_API);

        if (!response.ok) {

            throw new Error(
                "Failed to load schemes."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load schemes."
            );

        }

        allSchemes =
            result.data ||
            result.schemes ||
            [];

        updateSchemeStats(
            allSchemes
        );

        renderSchemes(
            allSchemes
        );

    } catch (error) {

        console.error(
            "Schemes loading error:",
            error
        );

        showLoading(false);

        showMessage(
            error.message ||
            "Unable to load schemes.",
            "error"
        );

        showEmpty(true);

    }

}


// =====================================================
// UPDATE STATS
// =====================================================

function updateSchemeStats(
    schemes
) {

    setText(
        "totalSchemes",
        schemes.length
    );


    let agriculture = 0;
    let social = 0;
    let education = 0;


    schemes.forEach(function (scheme) {

        const category =
            normalizeCategory(
                scheme.category
            );


        if (category === "agriculture") {

            agriculture++;

        }


        if (
            category === "social" ||
            category === "social welfare"
        ) {

            social++;

        }


        if (category === "education") {

            education++;

        }

    });


    setText(
        "agricultureSchemes",
        agriculture
    );

    setText(
        "socialSchemes",
        social
    );

    setText(
        "educationSchemes",
        education
    );

}


// =====================================================
// RENDER SCHEMES
// =====================================================

function renderSchemes(
    schemes
) {

    const container =
        document.getElementById(
            "schemesContainer"
        );

    if (!container) return;


    if (
        !Array.isArray(schemes) ||
        schemes.length === 0
    ) {

        container.innerHTML = "";

        container.style.display =
            "none";

        showLoading(false);
        showEmpty(true);

        return;

    }


    container.innerHTML =
        schemes.map(
            createSchemeCard
        ).join("");


    container.style.display =
        "grid";

    showLoading(false);
    showEmpty(false);

}


// =====================================================
// SCHEME CARD
// =====================================================

function createSchemeCard(
    scheme
) {

    const id =
        scheme.id ||
        scheme._id ||
        scheme.schemeId ||
        "N/A";


    const title =
        scheme.title ||
        scheme.name ||
        scheme.schemeName ||
        "Government Scheme";


    const description =
        scheme.description ||
        scheme.details ||
        "No description available.";


    const category =
        scheme.category ||
        "Other";


    const eligibility =
        scheme.eligibility ||
        scheme.eligibleFor ||
        scheme.eligibilityCriteria ||
        "Eligibility information not available.";


    const benefits =
        scheme.benefits ||
        scheme.benefit ||
        "Benefits information not available.";


    const applicationUrl =
        scheme.applicationUrl ||
        scheme.applicationLink ||
        scheme.applyUrl ||
        "";


    const status =
        scheme.status ||
        "Active";


    return `

        <div class="scheme-card">

            <div class="scheme-card-header">

                <div class="scheme-icon">
                    ${getSchemeIcon(category)}
                </div>

                <div class="scheme-header-info">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>

                    <span class="scheme-category">
                        ${escapeHTML(category)}
                    </span>

                </div>

            </div>


            <div class="scheme-card-body">

                <div class="scheme-detail">

                    <strong>
                        Description
                    </strong>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                </div>


                <div class="scheme-detail">

                    <strong>
                        Eligibility
                    </strong>

                    <p>
                        ${escapeHTML(eligibility)}
                    </p>

                </div>


                <div class="scheme-detail">

                    <strong>
                        Benefits
                    </strong>

                    <p>
                        ${escapeHTML(benefits)}
                    </p>

                </div>


                <div class="scheme-status-row">

                    <span class="
                        scheme-status
                        ${getStatusClass(status)}
                    ">
                        ${escapeHTML(status)}
                    </span>

                    <span class="scheme-id">
                        ID: ${escapeHTML(id)}
                    </span>

                </div>

            </div>


            <div class="scheme-card-footer">

                ${
                    applicationUrl
                        ? `
                            <a
                                href="${escapeAttribute(applicationUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="scheme-apply-btn"
                            >
                                Apply / Details ↗
                            </a>
                          `
                        : `
                            <button
                                type="button"
                                class="scheme-apply-btn"
                                onclick="showSchemeInfo()"
                            >
                                View Details
                            </button>
                          `
                }

            </div>

        </div>

    `;

}


// =====================================================
// FILTERS
// =====================================================

function setupFilters() {

    const category =
        document.getElementById(
            "schemeCategory"
        );

    const search =
        document.getElementById(
            "schemeSearch"
        );


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


// =====================================================
// APPLY FILTERS
// =====================================================

function applyFilters() {

    const category =
        document.getElementById(
            "schemeCategory"
        )?.value || "all";


    const search =
        document.getElementById(
            "schemeSearch"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filteredSchemes =
        allSchemes.filter(
            function (scheme) {

                const schemeCategory =
                    normalizeCategory(
                        scheme.category
                    );


                const title =
                    (
                        scheme.title ||
                        scheme.name ||
                        scheme.schemeName ||
                        ""
                    )
                    .toLowerCase();


                const description =
                    (
                        scheme.description ||
                        ""
                    )
                    .toLowerCase();


                const eligibility =
                    (
                        scheme.eligibility ||
                        scheme.eligibleFor ||
                        ""
                    )
                    .toLowerCase();


                const categoryMatch =
                    category === "all" ||
                    schemeCategory ===
                        normalizeCategory(category) ||
                    (
                        category === "social" &&
                        schemeCategory ===
                            "social welfare"
                    );


                const searchMatch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search) ||
                    eligibility.includes(search);


                return (
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    renderSchemes(
        filteredSchemes
    );

}


// =====================================================
// REFRESH
// =====================================================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshSchemesBtn"
        );

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadSchemes();

        }
    );

}


// =====================================================
// SCHEME ICON
// =====================================================

function getSchemeIcon(
    category
) {

    const value =
        normalizeCategory(
            category
        );


    if (value === "agriculture") {

        return "🌾";

    }


    if (
        value === "social" ||
        value === "social welfare"
    ) {

        return "👨‍👩‍👧";

    }


    if (value === "education") {

        return "🎓";

    }


    if (value === "health") {

        return "🏥";

    }


    if (value === "employment") {

        return "💼";

    }


    if (value === "housing") {

        return "🏠";

    }


    return "🎯";

}


// =====================================================
// NORMALIZE CATEGORY
// =====================================================

function normalizeCategory(
    category
) {

    return String(
        category || "other"
    )
        .trim()
        .toLowerCase();

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(
    status
) {

    const value =
        String(
            status || "active"
        )
            .trim()
            .toLowerCase();


    if (
        value === "inactive" ||
        value === "closed" ||
        value === "expired"
    ) {

        return "inactive";

    }


    return "active";

}


// =====================================================
// VIEW DETAILS FALLBACK
// =====================================================

function showSchemeInfo() {

    showMessage(
        "Application details are not available for this scheme yet.",
        "info"
    );

}


// =====================================================
// LOADING
// =====================================================

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "schemesLoading"
        );

    if (!loading) return;


    loading.style.display =
        show
            ? "block"
            : "none";

}


// =====================================================
// EMPTY
// =====================================================

function showEmpty(
    show
) {

    const empty =
        document.getElementById(
            "schemesEmpty"
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
            "schemesMessage"
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
// SET TEXT
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


// =====================================================
// HTML ESCAPE
// =====================================================

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


// =====================================================
// ATTRIBUTE ESCAPE
// =====================================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}