// =========================================================
// SVOS - CITIZEN SERVICES
// MongoDB API Integration
// =========================================================

const SERVICES_API =
  "http://localhost:5000/api/services";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadServices();
  }
);


// =========================================================
// LOAD SERVICES
// =========================================================

async function loadServices() {
  const container =
    document.getElementById("servicesContainer");

  if (!container) {
    console.error(
      "servicesContainer not found"
    );

    return;
  }

  container.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading services...</p>
    </div>
  `;

  try {
    const response =
      await fetch(SERVICES_API);

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Failed to load services"
      );
    }

    const services =
      Array.isArray(result.data)
        ? result.data
        : [];

    renderServices(
      services
    );

  } catch (error) {
    console.error(
      "Load services error:",
      error
    );

    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Unable to load services</h3>
        <p>
          Please check your internet
          connection or try again later.
        </p>

        <button
          type="button"
          onclick="loadServices()"
        >
          <i class="fas fa-refresh"></i>
          Retry
        </button>
      </div>
    `;
  }
}


// =========================================================
// RENDER SERVICES
// =========================================================

function renderServices(
  services
) {
  const container =
    document.getElementById(
      "servicesContainer"
    );

  if (!container) {
    return;
  }

  if (!services.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>

        <h3>No Services Available</h3>

        <p>
          Government services will appear
          here when available.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    services
      .map(
        (service) => `
          <div
            class="service-card"
            data-service-id="${escapeHtml(
              service.serviceId || ""
            )}"
          >

            <div class="service-icon">
              <i class="fas fa-landmark"></i>
            </div>

            <div class="service-content">

              <span class="service-category">
                ${escapeHtml(
                  service.category ||
                  "Government Service"
                )}
              </span>

              <h3>
                ${escapeHtml(
                  service.name ||
                  "Service"
                )}
              </h3>

              <p>
                ${escapeHtml(
                  service.description ||
                  "No description available."
                )}
              </p>

              ${
                service.processingTime
                  ? `
                    <div class="service-info">
                      <i class="fas fa-clock"></i>
                      <span>
                        ${escapeHtml(
                          service.processingTime
                        )}
                      </span>
                    </div>
                  `
                  : ""
              }

              ${
                Number(
                  service.applicationFee
                ) > 0
                  ? `
                    <div class="service-info">
                      <i class="fas fa-indian-rupee-sign"></i>
                      <span>
                        Application Fee:
                        ₹${Number(
                          service.applicationFee
                        ).toFixed(2)}
                      </span>
                    </div>
                  `
                  : `
                    <div class="service-info">
                      <i class="fas fa-check-circle"></i>
                      <span>
                        No Application Fee
                      </span>
                    </div>
                  `
              }

            </div>

            <div class="service-actions">

              <button
                type="button"
                class="btn-view-service"
                onclick="viewService('${escapeHtml(
                  service.serviceId || ""
                )}')"
              >
                <i class="fas fa-eye"></i>
                View Details
              </button>

              <button
                type="button"
                class="btn-apply-service"
                onclick="applyForService('${escapeHtml(
                  service.serviceId || ""
                )}')"
              >
                <i class="fas fa-file-signature"></i>
                Apply Now
              </button>

            </div>

          </div>
        `
      )
      .join("");
}


// =========================================================
// VIEW SERVICE
// =========================================================

async function viewService(
  serviceId
) {
  if (!serviceId) {
    return;
  }

  try {
    const response =
      await fetch(
        `${SERVICES_API}/${encodeURIComponent(
          serviceId
        )}`
      );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Unable to load service"
      );
    }

    showServiceDetails(
      result.data
    );

  } catch (error) {
    console.error(
      "View service error:",
      error
    );

    alert(
      error.message ||
      "Unable to load service details."
    );
  }
}


// =========================================================
// SERVICE DETAILS MODAL
// =========================================================

function showServiceDetails(
  service
) {
  let modal =
    document.getElementById(
      "serviceDetailsModal"
    );

  if (!modal) {
    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "serviceDetailsModal";

    modal.className =
      "service-modal";

    document.body.appendChild(
      modal
    );
  }

  const documents =
    Array.isArray(
      service.requiredDocuments
    )
      ? service.requiredDocuments
      : [];

  modal.innerHTML = `
    <div
      class="service-modal-overlay"
      onclick="closeServiceDetails(event)"
    >

      <div
        class="service-modal-content"
        onclick="event.stopPropagation()"
      >

        <button
          type="button"
          class="service-modal-close"
          onclick="closeServiceDetails()"
        >
          &times;
        </button>

        <div class="service-modal-icon">
          <i class="fas fa-landmark"></i>
        </div>

        <span class="service-category">
          ${escapeHtml(
            service.category ||
            "Government Service"
          )}
        </span>

        <h2>
          ${escapeHtml(
            service.name ||
            "Service"
          )}
        </h2>

        <p>
          ${escapeHtml(
            service.description ||
            "No description available."
          )}
        </p>

        ${
          service.eligibility
            ? `
              <div class="detail-section">
                <h4>
                  <i class="fas fa-user-check"></i>
                  Eligibility
                </h4>

                <p>
                  ${escapeHtml(
                    service.eligibility
                  )}
                </p>
              </div>
            `
            : ""
        }

        ${
          documents.length
            ? `
              <div class="detail-section">
                <h4>
                  <i class="fas fa-file"></i>
                  Required Documents
                </h4>

                <ul>
                  ${documents
                    .map(
                      (document) =>
                        `<li>${escapeHtml(
                          document
                        )}</li>`
                    )
                    .join("")}
                </ul>
              </div>
            `
            : ""
        }

        <div class="detail-grid">

          <div>
            <strong>
              Processing Time
            </strong>

            <span>
              ${escapeHtml(
                service.processingTime ||
                "Not specified"
              )}
            </span>
          </div>

          <div>
            <strong>
              Application Fee
            </strong>

            <span>
              ${
                Number(
                  service.applicationFee
                ) > 0
                  ? `₹${Number(
                      service.applicationFee
                    ).toFixed(2)}`
                  : "Free"
              }
            </span>
          </div>

        </div>

        <button
          type="button"
          class="btn-apply-service"
          onclick="applyForService('${escapeHtml(
            service.serviceId || ""
          )}')"
        >
          <i class="fas fa-file-signature"></i>
          Apply Now
        </button>

      </div>

    </div>
  `;

  modal.style.display =
    "block";
}


// =========================================================
// CLOSE SERVICE DETAILS
// =========================================================

function closeServiceDetails(
  event
) {
  if (
    event &&
    event.target &&
    !event.target.classList.contains(
      "service-modal-overlay"
    )
  ) {
    return;
  }

  const modal =
    document.getElementById(
      "serviceDetailsModal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }
}


// =========================================================
// APPLY FOR SERVICE
// =========================================================

function applyForService(
  serviceId
) {
  if (!serviceId) {
    return;
  }

  window.location.href =
    `apply-service.html?serviceId=${encodeURIComponent(
      serviceId
    )}`;
}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHtml(
  value
) {
  return String(value ?? "")
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


// =========================================================
// GLOBAL FUNCTIONS
// =========================================================

window.loadServices =
  loadServices;

window.viewService =
  viewService;

window.closeServiceDetails =
  closeServiceDetails;

window.applyForService =
  applyForService;