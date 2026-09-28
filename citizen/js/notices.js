// =========================================================
// SVOS CITIZEN - NOTICES
// MongoDB Notice API Integration
// =========================================================

const NOTICES_API =
    "http://localhost:5000/api/notices";

// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCitizenName();

        loadNotices();

    }
);


// =========================================================
// LOAD CITIZEN NAME
// =========================================================

function loadCitizenName() {

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
            "User data error:",
            error
        );

    }

}


// =========================================================
// AUTH TOKEN
// =========================================================

function getAuthToken() {

    return (
        localStorage.getItem("svosToken") ||
        localStorage.getItem("token") ||
        ""
    );

}


// =========================================================
// LOAD NOTICES
// =========================================================

async function loadNotices() {

    const container =
        document.getElementById(
            "noticesContainer"
        );

    if (!container) return;


    try {

        container.innerHTML = `
            <div class="loading-state">
                <div>
                    Loading notices...
                </div>
            </div>
        `;


        const token =
            getAuthToken();


        const headers = {};

        if (token) {

            headers.Authorization =
                `Bearer ${token}`;

        }


        const response =
            await fetch(NOTICES_API, {
                method: "GET",
                headers
            });


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load notices."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load notices."
            );

        }


        const notices =
            Array.isArray(result.data)
                ? result.data
                : [];


        /*
         * Backend already returns ACTIVE notices.
         *
         * Citizen should receive:
         * - All
         * - Citizen
         *
         * Officer-only notices are hidden.
         */

        const citizenNotices =
            notices.filter(
                function (notice) {

                    return (
                        notice.targetAudience === "All" ||
                        notice.targetAudience === "Citizen"
                    );

                }
            );


        displayNotices(
            citizenNotices
        );


    } catch (error) {

        console.error(
            "Notices loading error:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">

                <div>📋</div>

                <h3>
                    Unable to Load Notices
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Notice data could not be loaded."
                    )}
                </p>

            </div>
        `;

    }

}


// =========================================================
// DISPLAY NOTICES
// =========================================================

function displayNotices(notices) {

    const container =
        document.getElementById(
            "noticesContainer"
        );

    if (!container) return;


    if (
        !Array.isArray(notices) ||
        notices.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div>📋</div>

                <h3>
                    No Notices Available
                </h3>

                <p>
                    New Panchayat notices will
                    appear here.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        notices
            .map(
                function (notice) {

                    const title =
                        notice.title ||
                        "Panchayat Notice";


                    const description =
                        notice.description ||
                        "No additional information available.";


                    const date =
                        notice.publishedDate ||
                        notice.createdAt;


                    const category =
                        notice.category ||
                        "General";


                    const priority =
                        notice.priority ||
                        "";


                    return `
                        <article
                            class="notice-card"
                        >

                            <div
                                class="notice-card-header"
                            >

                                <div
                                    class="notice-icon"
                                >
                                    📋
                                </div>

                                <div
                                    class="notice-meta"
                                >

                                    <span
                                        class="notice-category"
                                    >
                                        ${escapeHtml(
                                            category
                                        )}
                                    </span>

                                    ${
                                        priority
                                            ? `
                                                <span
                                                    class="notice-priority ${getPriorityClass(priority)}"
                                                >
                                                    ${escapeHtml(
                                                        priority
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>


                            <div
                                class="notice-card-body"
                            >

                                <h3>
                                    ${escapeHtml(
                                        title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHtml(
                                        description
                                    )}
                                </p>

                            </div>


                            <div
                                class="notice-card-footer"
                            >

                                <span>
                                    📅
                                    ${formatNoticeDate(
                                        date
                                    )}
                                </span>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");

}


// =========================================================
// PRIORITY CLASS
// =========================================================

function getPriorityClass(priority) {

    const value =
        String(priority || "")
            .toLowerCase()
            .replace(/\s+/g, "-");


    if (
        value === "high" ||
        value === "urgent" ||
        value === "important"
    ) {

        return "high";

    }


    if (
        value === "medium" ||
        value === "normal"
    ) {

        return "medium";

    }


    if (
        value === "low"
    ) {

        return "low";

    }


    return "medium";

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatNoticeDate(date) {

    if (!date) {

        return "Date not available";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "Date not available";

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
// ESCAPE HTML
// =========================================================

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