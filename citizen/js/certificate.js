/* =========================================================
   SVOS CITIZEN - CERTIFICATES
   ========================================================= */

const CERTIFICATES_API = "http://localhost:5000/api/citizen/certificates";

let allCertificates = [];

/* =========================================================
   LOAD CERTIFICATES
   ========================================================= */

async function loadCertificates() {
  const container = document.getElementById("certificatesContainer");

  try {
    if (container) {
      container.innerHTML = `
                <div class="loading-state">
                    <div>Loading certificates...</div>
                </div>
            `;
    }

    const response = await fetch(CERTIFICATES_API);

    if (!response.ok) {
      throw new Error("Failed to load certificates");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Unable to load certificates");
    }

    /*
     * Backend response can be:
     * result.data
     * result.certificates
     */

    allCertificates = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.certificates)
        ? result.certificates
        : [];

    displayCertificates(allCertificates);
  } catch (error) {
    console.error("Certificates loading error:", error);

    if (container) {
      container.innerHTML = `
                <div class="empty-state">

                    <div>📜</div>

                    <h3>
                        Unable to Load Certificates
                    </h3>

                    <p>
                        ${escapeHtml(
                          error.message ||
                            "Certificate data could not be loaded.",
                        )}
                    </p>

                </div>
            `;
    }
  }
}

/* =========================================================
   DISPLAY CERTIFICATES
   ========================================================= */

function displayCertificates(certificates) {
  const container = document.getElementById("certificatesContainer");

  if (!container) return;

  if (!Array.isArray(certificates) || certificates.length === 0) {
    container.innerHTML = `
            <div class="empty-state">

                <div>📜</div>

                <h3>
                    No Certificates Available
                </h3>

                <p>
                    Your approved certificates
                    will appear here.
                </p>

            </div>
        `;

    return;
  }

  container.innerHTML = certificates
    .map((certificate) => {
      const certificateId =
        certificate.id || certificate._id || certificate.certificateId || "N/A";

      const certificateName =
        certificate.name ||
        certificate.title ||
        certificate.certificateName ||
        "Certificate";

      const applicationId =
        certificate.applicationId || certificate.applicationID || "N/A";

      const status = certificate.status || "Approved";

      const issuedDate =
        certificate.issuedDate || certificate.createdAt || certificate.date;

      const downloadUrl =
        certificate.downloadUrl ||
        certificate.fileUrl ||
        certificate.pdfUrl ||
        certificate.documentUrl;

      return `
                    <div class="certificate-card">

                        <div class="certificate-card-header">

                            <div class="certificate-icon">
                                📜
                            </div>

                            <span class="
                                certificate-status
                                ${getCertificateStatusClass(status)}
                            ">
                                ${escapeHtml(status)}
                            </span>

                        </div>


                        <div class="certificate-card-body">

                            <h3>
                                ${escapeHtml(certificateName)}
                            </h3>


                            <div class="certificate-info">

                                <div class="certificate-info-item">

                                    <span>
                                        Certificate ID
                                    </span>

                                    <strong>
                                        ${escapeHtml(certificateId)}
                                    </strong>

                                </div>


                                <div class="certificate-info-item">

                                    <span>
                                        Application ID
                                    </span>

                                    <strong>
                                        ${escapeHtml(applicationId)}
                                    </strong>

                                </div>


                                <div class="certificate-info-item">

                                    <span>
                                        Issued Date
                                    </span>

                                    <strong>
                                        ${formatCertificateDate(issuedDate)}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div class="certificate-card-actions">

                            ${
                              downloadUrl
                                ? `
                                        <a
                                            href="${escapeHtml(downloadUrl)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="certificate-btn"
                                        >
                                            📥 Download
                                        </a>
                                    `
                                : `
                                        <button
                                            type="button"
                                            class="certificate-btn disabled"
                                            disabled
                                        >
                                            📥 Download
                                        </button>
                                    `
                            }

                        </div>

                    </div>
                `;
    })
    .join("");
}

/* =========================================================
   CERTIFICATE STATUS CLASS
   ========================================================= */

function getCertificateStatusClass(status) {
  const value = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (value === "approved" || value === "issued" || value === "completed") {
    return "approved";
  }

  if (value === "pending" || value === "processing") {
    return "pending";
  }

  if (value === "rejected" || value === "cancelled") {
    return "rejected";
  }

  return "pending";
}

/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatCertificateDate(date) {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   LOAD USER NAME
   ========================================================= */

function loadCitizenName() {
  const userName = document.getElementById("userName");

  if (!userName) return;

  try {
    const storedUser = JSON.parse(localStorage.getItem("svosUser"));

    if (storedUser && storedUser.name) {
      userName.textContent = storedUser.name;
    }
  } catch (error) {
    console.error("User data error:", error);
  }
}

/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("svosUser");

    window.location.href = "../login.html";
  });
}

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  loadCitizenName();

  setupLogout();

  loadCertificates();
});
