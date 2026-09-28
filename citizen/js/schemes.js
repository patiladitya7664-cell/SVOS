// =========================================================
// SVOS - CITIZEN SCHEMES
// MongoDB API Integration
// =========================================================

const SCHEMES_API =
  "http://localhost:5000/api/schemes";

document.addEventListener("DOMContentLoaded", () => {
  loadSchemes();
});

// =========================================================
// LOAD SCHEMES
// =========================================================

async function loadSchemes() {
  const container =
    document.getElementById("schemesContainer");

  if (!container) {
    console.error("schemesContainer not found");
    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading schemes...</p>
    </div>
  `;

  try {
    const response = await fetch(SCHEMES_API);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to load schemes"
      );
    }

    const schemes = Array.isArray(result.data)
      ? result.data
      : [];

    renderSchemes(schemes);

  } catch (error) {
    console.error("Load schemes error:", error);

    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>

        <h3>Unable to Load Schemes</h3>

        <p>
          Please try again later.
        </p>

        <button
          type="button"
          onclick="loadSchemes()"
        >
          <i class="fas fa-refresh"></i>
          Retry
        </button>
      </div>
    `;
  }
}

// =========================================================
// RENDER SCHEMES
// =========================================================

function renderSchemes(schemes) {
  const container =
    document.getElementById("schemesContainer");

  if (!container) return;

  if (!schemes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>

        <h3>No Schemes Available</h3>

        <p>
          Government schemes will appear here
          when available.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML = schemes
    .map(
      (scheme) => `
        <div
          class="scheme-card"
          data-scheme-id="${escapeHtml(
            scheme.schemeId || ""
          )}"
        >

          <div class="scheme-icon">
            <i class="fas fa-hand-holding-heart"></i>
          </div>

          <div class="scheme-content">

            <span class="scheme-category">
              ${escapeHtml(
                scheme.category ||
                "Government Scheme"
              )}
            </span>

            <h3>
              ${escapeHtml(
                scheme.title ||
                "Government Scheme"
              )}
            </h3>

            <p>
              ${escapeHtml(
                scheme.description ||
                "No description available."
              )}
            </p>

            ${
              scheme.benefits
                ? `
                  <div class="scheme-info">
                    <i class="fas fa-gift"></i>

                    <span>
                      ${escapeHtml(
                        scheme.benefits
                      )}
                    </span>
                  </div>
                `
                : ""
            }

          </div>

          <div class="scheme-actions">

            <button
              type="button"
              class="btn-view-scheme"
              onclick="viewScheme('${escapeHtml(
                scheme.schemeId || ""
              )}')"
            >
              <i class="fas fa-eye"></i>
              View Details
            </button>

          </div>

        </div>
      `
    )
    .join("");
}

// =========================================================
// VIEW SCHEME
// =========================================================

async function viewScheme(schemeId) {
  if (!schemeId) return;

  try {
    const response = await fetch(
      `${SCHEMES_API}/${encodeURIComponent(
        schemeId
      )}`
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Unable to load scheme"
      );
    }

    showSchemeDetails(result.data);

  } catch (error) {
    console.error(
      "View scheme error:",
      error
    );

    alert(
      error.message ||
      "Unable to load scheme details."
    );
  }
}

// =========================================================
// SCHEME DETAILS MODAL
// =========================================================

function showSchemeDetails(scheme) {
  let modal =
    document.getElementById(
      "schemeDetailsModal"
    );

  if (!modal) {
    modal = document.createElement("div");

    modal.id =
      "schemeDetailsModal";

    modal.className =
      "scheme-modal";

    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div
      class="scheme-modal-overlay"
      onclick="closeSchemeDetails(event)"
    >

      <div
        class="scheme-modal-content"
        onclick="event.stopPropagation()"
      >

        <button
          type="button"
          class="scheme-modal-close"
          onclick="closeSchemeDetails()"
        >
          &times;
        </button>

        <div class="scheme-modal-icon">
          <i class="fas fa-hand-holding-heart"></i>
        </div>

        <span class="scheme-category">
          ${escapeHtml(
            scheme.category ||
            "Government Scheme"
          )}
        </span>

        <h2>
          ${escapeHtml(
            scheme.title ||
            "Government Scheme"
          )}
        </h2>

        <p>
          ${escapeHtml(
            scheme.description ||
            "No description available."
          )}
        </p>

        ${
          scheme.eligibility
            ? `
              <div class="detail-section">
                <h4>
                  <i class="fas fa-user-check"></i>
                  Eligibility
                </h4>

                <p>
                  ${escapeHtml(
                    scheme.eligibility
                  )}
                </p>
              </div>
            `
            : ""
        }

        ${
          scheme.benefits
            ? `
              <div class="detail-section">
                <h4>
                  <i class="fas fa-gift"></i>
                  Benefits
                </h4>

                <p>
                  ${escapeHtml(
                    scheme.benefits
                  )}
                </p>
              </div>
            `
            : ""
        }

        ${
          scheme.applicationUrl
            ? `
              <div class="scheme-modal-actions">
                <a
                  href="${escapeHtml(
                    scheme.applicationUrl
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-apply-scheme"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Apply / Official Website
                </a>
              </div>
            `
            : ""
        }

      </div>

    </div>
  `;

  modal.style.display = "block";
}

// =========================================================
// CLOSE MODAL
// =========================================================

function closeSchemeDetails(event) {
  if (
    event &&
    event.target &&
    !event.target.classList.contains(
      "scheme-modal-overlay"
    )
  ) {
    return;
  }

  const modal =
    document.getElementById(
      "schemeDetailsModal"
    );

  if (modal) {
    modal.style.display = "none";
  }
}

// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================================================
// GLOBAL FUNCTIONS
// =========================================================

window.loadSchemes = loadSchemes;
window.viewScheme = viewScheme;
window.closeSchemeDetails =
  closeSchemeDetails;