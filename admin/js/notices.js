/* =========================================================
   SVOS ADMIN - NOTICES
   File: admin/js/notices.js
   ========================================================= */

const NOTICES_API =
    "http://localhost:5000/api/admin/notifications";
let allNotices = [];


/* =========================================================
   LOAD NOTICES
   ========================================================= */

async function loadNotices() {

    const container =
        document.getElementById("noticesContainer");

    try {

        const response = await fetch(
            NOTICES_API
        );

        const result =
            await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                "Unable to load notices"
            );
        }

        allNotices =
            result.data || [];

        displayNotices(allNotices);

    } catch (error) {

        console.error(
            "Notices Load Error:",
            error
        );

        if (container) {

            container.innerHTML = `
                <div class="empty-state">

                    <div>
                        Unable to load notices.
                    </div>

                </div>
            `;
        }
    }
}


/* =========================================================
   DISPLAY NOTICES
   ========================================================= */

function displayNotices(notices) {

    const container =
        document.getElementById(
            "noticesContainer"
        );

    if (!container) {
        return;
    }


    if (
        !notices ||
        notices.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">

                <div>
                    No notices available.
                </div>

            </div>
        `;

        return;
    }


    container.innerHTML =
        notices
            .map((notice) => {

                return `
                    <div class="notice-card">

                        <div class="notice-card-header">

                            <div>

                                <span class="notice-id">
                                    ${escapeHtml(
                                        notice.id
                                    )}
                                </span>

                                <h3>
                                    ${escapeHtml(
                                        notice.title
                                    )}
                                </h3>

                            </div>

                            <span
                                class="notice-status ${
                                    getNoticeStatusClass(
                                        notice.status
                                    )
                                }"
                            >
                                ${escapeHtml(
                                    notice.status
                                )}
                            </span>

                        </div>


                        <div class="notice-content">

                            <p>
                                ${escapeHtml(
                                    notice.message ||
                                    notice.description ||
                                    "-"
                                )}
                            </p>

                        </div>


                        <div class="notice-meta">

                            <span>
                                📅
                                ${formatNoticeDate(
                                    notice.createdAt
                                )}
                            </span>

                        </div>


                        <div class="notice-actions">

                            <select
                                data-notice-status="${escapeHtml(
                                    notice.id
                                )}"
                            >

                                <option
                                    value="Active"
                                    ${
                                        notice.status ===
                                        "Active"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Active
                                </option>

                                <option
                                    value="Inactive"
                                    ${
                                        notice.status ===
                                        "Inactive"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Inactive
                                </option>

                            </select>


                            <button
                                type="button"
                                class="delete-btn"
                                data-delete-notice="${escapeHtml(
                                    notice.id
                                )}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");


    attachNoticeActions();
}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getNoticeStatusClass(status) {

    if (status === "Active") {
        return "active";
    }

    return "inactive";
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatNoticeDate(date) {

    if (!date) {
        return "-";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
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
   UPDATE NOTICE STATUS
   ========================================================= */

async function changeNoticeStatus(
    noticeId,
    status
) {

    try {

        const response = await fetch(
            `${NOTICES_API}/${noticeId}/status`,
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
                "Unable to update notice"
            );
        }


        const notice =
            allNotices.find(
                (item) =>
                    item.id === noticeId
            );


        if (notice) {
            notice.status = status;
        }


        displayNotices(
            allNotices
        );

    } catch (error) {

        console.error(
            "Notice Status Error:",
            error
        );

        alert(
            error.message ||
            "Unable to update notice"
        );

        loadNotices();
    }
}


/* =========================================================
   DELETE NOTICE
   ========================================================= */

async function removeNotice(
    noticeId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this notice?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${NOTICES_API}/${noticeId}`,
            {
                method: "DELETE"
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to delete notice"
            );
        }


        allNotices =
            allNotices.filter(
                (notice) =>
                    notice.id !== noticeId
            );


        displayNotices(
            allNotices
        );

    } catch (error) {

        console.error(
            "Delete Notice Error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete notice"
        );
    }
}


/* =========================================================
   SEARCH NOTICES
   ========================================================= */

function searchNotices() {

    const searchInput =
        document.getElementById(
            "noticeSearch"
        );

    const search =
        searchInput?.value
            ?.toLowerCase()
            .trim() || "";


    const filteredNotices =
        allNotices.filter(
            (notice) => {

                const searchableText = [
                    notice.id,
                    notice.title,
                    notice.message,
                    notice.description,
                    notice.category
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    search
                );
            }
        );


    displayNotices(
        filteredNotices
    );
}


/* =========================================================
   ATTACH ACTIONS
   ========================================================= */

function attachNoticeActions() {

    const statusSelects =
        document.querySelectorAll(
            "[data-notice-status]"
        );


    statusSelects.forEach(
        (select) => {

            select.addEventListener(
                "change",
                () => {

                    const noticeId =
                        select.dataset
                            .noticeStatus;

                    changeNoticeStatus(
                        noticeId,
                        select.value
                    );
                }
            );
        }
    );


    const deleteButtons =
        document.querySelectorAll(
            "[data-delete-notice]"
        );


    deleteButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const noticeId =
                        button.dataset
                            .deleteNotice;

                    removeNotice(
                        noticeId
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
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadNotices();


        const searchInput =
            document.getElementById(
                "noticeSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchNotices
            );
        }

    }
);