const NOTICES_API =
    "http://localhost:5000/api/officer/notices";

let allNotices = [];

document.addEventListener("DOMContentLoaded", function () {

    loadOfficerName();
    loadNotices();
    setupFilters();
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


// ================= LOAD NOTICES =================

async function loadNotices() {

    const container =
        document.getElementById(
            "noticesContainer"
        );

    if (!container) return;

    try {

        container.innerHTML = `
            <div class="loading-state">
                <div>Loading notices...</div>
            </div>
        `;

        const response =
            await fetch(NOTICES_API);

        if (!response.ok) {

            throw new Error(
                "Failed to load notices."
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load notices."
            );

        }

        allNotices =
            Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.notices)
                    ? result.notices
                    : [];

        updateNoticeStats(
            allNotices
        );

        displayNotices(
            allNotices
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


// ================= STATS =================

function updateNoticeStats(notices) {

    const totalElement =
        document.getElementById(
            "totalNotices"
        );

    const highElement =
        document.getElementById(
            "highPriorityNotices"
        );

    const mediumElement =
        document.getElementById(
            "mediumPriorityNotices"
        );

    const lowElement =
        document.getElementById(
            "lowPriorityNotices"
        );


    let high = 0;
    let medium = 0;
    let low = 0;


    notices.forEach(function (notice) {

        const priority =
            normalizePriority(
                notice.priority
            );


        if (priority === "high") {

            high++;

        } else if (priority === "medium") {

            medium++;

        } else {

            low++;

        }

    });


    if (totalElement) {

        totalElement.textContent =
            notices.length;

    }

    if (highElement) {

        highElement.textContent =
            high;

    }

    if (mediumElement) {

        mediumElement.textContent =
            medium;

    }

    if (lowElement) {

        lowElement.textContent =
            low;

    }

}


// ================= DISPLAY NOTICES =================

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
                    No Notices Found
                </h3>

                <p>
                    Panchayat notices will
                    appear here.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        notices.map(function (notice) {

            const noticeId =
                notice.id ||
                notice._id ||
                notice.noticeId ||
                "N/A";


            const title =
                notice.title ||
                notice.name ||
                notice.noticeTitle ||
                "Panchayat Notice";


            const description =
                notice.description ||
                notice.details ||
                notice.content ||
                "No description available.";


            const category =
                notice.category ||
                notice.type ||
                "General";


            const priority =
                notice.priority ||
                "Low";


            const noticeDate =
                notice.date ||
                notice.noticeDate ||
                notice.createdAt ||
                notice.publishedAt;


            const expiryDate =
                notice.expiryDate ||
                notice.expiresAt;


            return `

                <article class="notice-card">

                    <div class="notice-card-header">

                        <div class="notice-icon">
                            📋
                        </div>

                        <div class="notice-header-info">

                            <span class="notice-category">
                                ${escapeHtml(
                                    category
                                )}
                            </span>

                            <span class="notice-priority ${getPriorityClass(priority)}">
                                ${escapeHtml(
                                    priority
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="notice-card-body">

                        <h3>
                            ${escapeHtml(title)}
                        </h3>

                        <p>
                            ${escapeHtml(
                                description
                            )}
                        </p>


                        <div class="notice-detail">

                            <span>
                                📅 Published
                            </span>

                            <strong>
                                ${formatDate(
                                    noticeDate
                                )}
                            </strong>

                        </div>


                        ${
                            expiryDate
                                ? `
                                    <div class="notice-detail">

                                        <span>
                                            ⏳ Valid Until
                                        </span>

                                        <strong>
                                            ${formatDate(
                                                expiryDate
                                            )}
                                        </strong>

                                    </div>
                                `
                                : ""
                        }

                    </div>


                    <div class="notice-card-footer">

                        <span class="notice-id">
                            Notice ID:
                            ${escapeHtml(
                                noticeId
                            )}
                        </span>

                    </div>

                </article>

            `;

        }).join("");

}


// ================= FILTERS =================

function setupFilters() {

    const categoryFilter =
        document.getElementById(
            "noticeCategory"
        );

    const priorityFilter =
        document.getElementById(
            "noticePriority"
        );

    const searchInput =
        document.getElementById(
            "noticeSearch"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }

}


// ================= APPLY FILTERS =================

function applyFilters() {

    const categoryFilter =
        document.getElementById(
            "noticeCategory"
        );

    const priorityFilter =
        document.getElementById(
            "noticePriority"
        );

    const searchInput =
        document.getElementById(
            "noticeSearch"
        );


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value.toLowerCase()
            : "all";


    const selectedPriority =
        priorityFilter
            ? priorityFilter.value.toLowerCase()
            : "all";


    const searchValue =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filteredNotices =
        allNotices.filter(
            function (notice) {

                const category =
                    String(
                        notice.category ||
                        notice.type ||
                        "general"
                    )
                    .toLowerCase()
                    .trim();


                const priority =
                    normalizePriority(
                        notice.priority
                    );


                const title =
                    String(
                        notice.title ||
                        notice.name ||
                        notice.noticeTitle ||
                        ""
                    ).toLowerCase();


                const description =
                    String(
                        notice.description ||
                        notice.details ||
                        notice.content ||
                        ""
                    ).toLowerCase();


                const noticeId =
                    String(
                        notice.id ||
                        notice._id ||
                        notice.noticeId ||
                        ""
                    ).toLowerCase();


                const categoryMatch =
                    selectedCategory === "all" ||
                    category === selectedCategory;


                const priorityMatch =
                    selectedPriority === "all" ||
                    priority === selectedPriority;


                const searchMatch =
                    !searchValue ||
                    title.includes(searchValue) ||
                    description.includes(searchValue) ||
                    noticeId.includes(searchValue);


                return (
                    categoryMatch &&
                    priorityMatch &&
                    searchMatch
                );

            }
        );


    displayNotices(
        filteredNotices
    );

}


// ================= REFRESH =================

function setupRefresh() {

    const refreshButton =
        document.getElementById(
            "refreshNoticesBtn"
        );

    if (!refreshButton) return;


    refreshButton.addEventListener(
        "click",
        function () {

            loadNotices();

        }
    );

}


// ================= PRIORITY =================

function normalizePriority(priority) {

    const value =
        String(
            priority || "low"
        )
        .toLowerCase()
        .trim();


    if (
        value === "high" ||
        value === "urgent" ||
        value === "critical"
    ) {

        return "high";

    }


    if (
        value === "medium" ||
        value === "normal"
    ) {

        return "medium";

    }


    return "low";

}


function getPriorityClass(priority) {

    return normalizePriority(
        priority
    );

}


// ================= DATE =================

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


// ================= ESCAPE HTML =================

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