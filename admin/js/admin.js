
// ==========================================
// ADMIN API
// ==========================================

const ADMIN_API = "http://localhost:5000/api/admin";


// ==========================================
// LOAD ADMIN DASHBOARD
// ==========================================

async function loadAdminDashboard() {

  try {

    const response = await fetch(
      `${ADMIN_API}/dashboard`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load admin dashboard"
      );
    }

    displayAdminDashboard(result.data);

  } catch (error) {

    console.error(
      "Admin Dashboard Error:",
      error
    );

  }
}


// ==========================================
// DISPLAY ADMIN DASHBOARD
// ==========================================

function displayAdminDashboard(data) {

  const totalCitizens =
    document.getElementById(
      "totalCitizens"
    );

  const totalApplications =
    document.getElementById(
      "totalApplications"
    );

  const pendingApplications =
    document.getElementById(
      "pendingApplications"
    );

  const approvedApplications =
    document.getElementById(
      "approvedApplications"
    );

  const rejectedApplications =
    document.getElementById(
      "rejectedApplications"
    );

  const totalServices =
    document.getElementById(
      "totalServices"
    );


  if (totalCitizens) {
    totalCitizens.textContent =
      data.totalCitizens ?? 0;
  }


  if (totalApplications) {
    totalApplications.textContent =
      data.totalApplications ?? 0;
  }


  if (pendingApplications) {
    pendingApplications.textContent =
      data.pendingApplications ?? 0;
  }


  if (approvedApplications) {
    approvedApplications.textContent =
      data.approvedApplications ?? 0;
  }


  if (rejectedApplications) {
    rejectedApplications.textContent =
      data.rejectedApplications ?? 0;
  }


  if (totalServices) {
    totalServices.textContent =
      data.totalServices ?? 0;
  }

}


// ==========================================
// LOAD ADMIN PROFILE
// ==========================================

async function loadAdminProfile() {

  try {

    const response = await fetch(
      `${ADMIN_API}/profile`
    );

    const result =
      await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load admin profile"
      );
    }


    displayAdminProfile(
      result.data
    );


  } catch (error) {

    console.error(
      "Admin Profile Error:",
      error
    );

  }

}


// ==========================================
// DISPLAY ADMIN PROFILE
// ==========================================

function displayAdminProfile(
  admin
) {

  const nameElements =
    document.querySelectorAll(
      ".admin-name"
    );


  nameElements.forEach(
    (element) => {
      element.textContent =
        admin.name || "Administrator";
    }
  );


  const emailElements =
    document.querySelectorAll(
      ".admin-email"
    );


  emailElements.forEach(
    (element) => {
      element.textContent =
        admin.email || "";
    }
  );

}


// ==========================================
// ADMIN LOGOUT
// ==========================================

async function adminLogout() {

  try {

    await fetch(
      `${ADMIN_API}/logout`,
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.error(
      "Admin Logout Error:",
      error
    );

  } finally {

    localStorage.removeItem(
      "svosAdmin"
    );

    window.location.href =
      "login.html";
  }

}


// ==========================================
// AUTO LOAD ADMIN DATA
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const dashboardCard =
      document.getElementById(
        "totalApplications"
      );


    if (dashboardCard) {
      loadAdminDashboard();
    }


    const adminName =
      document.querySelector(
        ".admin-name"
      );


    if (adminName) {
      loadAdminProfile();
    }

  }
);
// ==========================================
// ADMIN APPLICATIONS
// ==========================================

async function loadAdminApplications() {

  const container =
    document.getElementById(
      "adminApplicationsContainer"
    );


  if (!container) {
    console.error(
      "adminApplicationsContainer not found"
    );

    return;
  }


  container.innerHTML = `
    <p>Loading applications...</p>
  `;


  try {

    const response = await fetch(
      `${ADMIN_API}/applications`
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to load applications"
      );

    }


    displayAdminApplications(
      result.data
    );


  } catch (error) {

    console.error(
      "Admin Applications Error:",
      error
    );


    container.innerHTML = `
      <p class="error-message">
        Unable to load applications.
      </p>
    `;

  }

}


// ==========================================
// DISPLAY ADMIN APPLICATIONS
// ==========================================

function displayAdminApplications(
  applications
) {

  const container =
    document.getElementById(
      "adminApplicationsContainer"
    );


  if (!applications ||
      applications.length === 0) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>
          No Applications Found
        </h3>

        <p>
          There are no citizen applications
          available.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    applications
      .map((application) => {

        const statusClass =
          application.status
            .toLowerCase()
            .replace(/\s+/g, "-");


        return `
          <div class="admin-application-card">

            <div class="application-header">

              <h3>
                ${application.service}
              </h3>

              <span
                class="status ${statusClass}"
              >
                ${application.status}
              </span>

            </div>


            <div class="application-info">

              <p>
                <strong>
                  Application ID:
                </strong>

                ${application.id}
              </p>


              <p>
                <strong>
                  Applicant:
                </strong>

                ${application.applicantName}
              </p>


              <p>
                <strong>
                  Mobile:
                </strong>

                ${application.mobile}
              </p>


              <p>
                <strong>
                  Email:
                </strong>

                ${application.email}
              </p>


              <p>
                <strong>
                  Submitted:
                </strong>

                ${formatApplicationDate(
                  application.submittedAt
                )}
              </p>

            </div>


            <div class="application-actions">

              <select
                onchange="
                  updateApplicationStatus(
                    '${application.id}',
                    this.value
                  )
                "
              >

                <option
                  value="Pending"
                  ${
                    application.status ===
                    "Pending"
                      ? "selected"
                      : ""
                  }
                >
                  Pending
                </option>


                <option
                  value="Under Review"
                  ${
                    application.status ===
                    "Under Review"
                      ? "selected"
                      : ""
                  }
                >
                  Under Review
                </option>


                <option
                  value="Approved"
                  ${
                    application.status ===
                    "Approved"
                      ? "selected"
                      : ""
                  }
                >
                  Approved
                </option>


                <option
                  value="Rejected"
                  ${
                    application.status ===
                    "Rejected"
                      ? "selected"
                      : ""
                  }
                >
                  Rejected
                </option>

              </select>

            </div>

          </div>
        `;

      })
      .join("");

}


// ==========================================
// UPDATE APPLICATION STATUS
// ==========================================

async function updateApplicationStatus(
  applicationId,
  status
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/applications/${applicationId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          status
        })
      }
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to update status"
      );

    }


    loadAdminApplications();

    loadAdminDashboard();


  } catch (error) {

    console.error(
      "Status Update Error:",
      error
    );


    alert(
      error.message ||
      "Unable to update application status"
    );

  }

}
// ==========================================
// CITIZEN MANAGEMENT
// ==========================================

async function loadAdminCitizens() {
  try {
    const response = await fetch(`${ADMIN_API}/citizens`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load citizens"
      );
    }

    displayAdminCitizens(result.data);

  } catch (error) {
    console.error("Admin Citizens Error:", error);
  }
}


function displayAdminCitizens(citizens) {

  const container = document.getElementById(
    "adminCitizensContainer"
  );

  if (!container) {
    return;
  }

  if (!citizens || citizens.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <p>No citizens found.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = citizens.map((citizen) => {

    return `
      <div class="citizen-card">

        <div class="citizen-card-header">

          <h3>
            ${citizen.name || "Citizen"}
          </h3>

          <span class="citizen-status ${(
            citizen.status || "Active"
          ).toLowerCase()}">
            ${citizen.status || "Active"}
          </span>

        </div>

        <div class="citizen-card-body">

          <p>
            <strong>Citizen ID:</strong>
            ${citizen.id}
          </p>

          <p>
            <strong>Email:</strong>
            ${citizen.email || "-"}
          </p>

          <p>
            <strong>Mobile:</strong>
            ${citizen.mobile || "-"}
          </p>

          <p>
            <strong>City:</strong>
            ${citizen.city || "-"}
          </p>

          <p>
            <strong>State:</strong>
            ${citizen.state || "-"}
          </p>

          <p>
            <strong>Address:</strong>
            ${citizen.address || "-"}
          </p>

        </div>

        <div class="citizen-card-actions">

          <select
            onchange="updateCitizenStatus(
              '${citizen.id}',
              this.value
            )"
          >

            <option
              value="Active"
              ${
                citizen.status === "Active"
                  ? "selected"
                  : ""
              }
            >
              Active
            </option>

            <option
              value="Blocked"
              ${
                citizen.status === "Blocked"
                  ? "selected"
                  : ""
              }
            >
              Blocked
            </option>

          </select>

        </div>

      </div>
    `;

  }).join("");
}


// UPDATE CITIZEN STATUS
async function updateCitizenStatus(
  citizenId,
  status
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/citizens/${citizenId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          status: status
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to update citizen status"
      );
    }

    loadAdminCitizens();

    loadAdminDashboard();

  } catch (error) {

    console.error(
      "Citizen Status Update Error:",
      error
    );

  }

}
// ==========================================
// SERVICE MANAGEMENT
// ==========================================

async function loadAdminServices() {

  try {

    const response = await fetch(
      `${ADMIN_API}/services`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load services"
      );
    }

    displayAdminServices(result.data);

  } catch (error) {

    console.error(
      "Admin Services Error:",
      error
    );

  }
}


function displayAdminServices(services) {

  const container = document.getElementById(
    "adminServicesContainer"
  );

  if (!container) {
    return;
  }

  if (!services || services.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        <p>No services available.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = services.map((service) => {

    return `
      <div class="service-card">

        <div class="service-card-header">

          <h3>
            ${service.name}
          </h3>

          <span class="service-status">
            ${service.status}
          </span>

        </div>

        <div class="service-card-body">

          <p>
            <strong>Service ID:</strong>
            ${service.id}
          </p>

          <p>
            <strong>Category:</strong>
            ${service.category}
          </p>

          <p>
            <strong>Description:</strong>
            ${service.description}
          </p>

        </div>

        <div class="service-card-actions">

          <select
            onchange="updateServiceStatus(
              '${service.id}',
              this.value
            )"
          >

            <option
              value="Active"
              ${
                service.status === "Active"
                  ? "selected"
                  : ""
              }
            >
              Active
            </option>

            <option
              value="Inactive"
              ${
                service.status === "Inactive"
                  ? "selected"
                  : ""
              }
            >
              Inactive
            </option>

          </select>

          <button
            type="button"
            onclick="deleteAdminService('${service.id}')"
          >
            Delete
          </button>

        </div>

      </div>
    `;

  }).join("");
}


// ADD SERVICE
async function addAdminService(event) {

  event.preventDefault();

  const name =
    document.getElementById("serviceName")?.value.trim();

  const description =
    document.getElementById("serviceDescription")?.value.trim();

  const category =
    document.getElementById("serviceCategory")?.value.trim();

  try {

    const response = await fetch(
      `${ADMIN_API}/services`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name,
          description,
          category
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to add service"
      );
    }

    event.target.reset();

    loadAdminServices();

    loadAdminDashboard();

  } catch (error) {

    console.error(
      "Add Service Error:",
      error
    );

  }
}


// UPDATE SERVICE STATUS
async function updateServiceStatus(
  serviceId,
  status
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/services/${serviceId}/status`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          status
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to update service status"
      );
    }

    loadAdminServices();

  } catch (error) {

    console.error(
      "Service Status Error:",
      error
    );

  }
}


// DELETE SERVICE
async function deleteAdminService(serviceId) {

  try {

    const response = await fetch(
      `${ADMIN_API}/services/${serviceId}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to delete service"
      );
    }

    loadAdminServices();

    loadAdminDashboard();

  } catch (error) {

    console.error(
      "Delete Service Error:",
      error
    );

  }
}
// ==========================================
// REPORTS & ANALYTICS
// ==========================================

async function loadAdminReports() {

  try {

    const response = await fetch(
      `${ADMIN_API}/reports/summary`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load reports"
      );
    }

    displayAdminReports(result.data);

  } catch (error) {

    console.error(
      "Admin Reports Error:",
      error
    );

  }
}


function displayAdminReports(data) {

  if (!data) {
    return;
  }

  // CITIZENS

  const totalCitizensReport =
    document.getElementById(
      "reportTotalCitizens"
    );

  const activeCitizensReport =
    document.getElementById(
      "reportActiveCitizens"
    );

  const blockedCitizensReport =
    document.getElementById(
      "reportBlockedCitizens"
    );


  if (totalCitizensReport) {
    totalCitizensReport.textContent =
      data.citizens.total;
  }

  if (activeCitizensReport) {
    activeCitizensReport.textContent =
      data.citizens.active;
  }

  if (blockedCitizensReport) {
    blockedCitizensReport.textContent =
      data.citizens.blocked;
  }


  // APPLICATIONS

  const totalApplicationsReport =
    document.getElementById(
      "reportTotalApplications"
    );

  const pendingApplicationsReport =
    document.getElementById(
      "reportPendingApplications"
    );

  const underReviewApplicationsReport =
    document.getElementById(
      "reportUnderReviewApplications"
    );

  const approvedApplicationsReport =
    document.getElementById(
      "reportApprovedApplications"
    );

  const rejectedApplicationsReport =
    document.getElementById(
      "reportRejectedApplications"
    );


  if (totalApplicationsReport) {
    totalApplicationsReport.textContent =
      data.applications.total;
  }

  if (pendingApplicationsReport) {
    pendingApplicationsReport.textContent =
      data.applications.pending;
  }

  if (underReviewApplicationsReport) {
    underReviewApplicationsReport.textContent =
      data.applications.underReview;
  }

  if (approvedApplicationsReport) {
    approvedApplicationsReport.textContent =
      data.applications.approved;
  }

  if (rejectedApplicationsReport) {
    rejectedApplicationsReport.textContent =
      data.applications.rejected;
  }


  // SERVICES

  const totalServicesReport =
    document.getElementById(
      "reportTotalServices"
    );

  const activeServicesReport =
    document.getElementById(
      "reportActiveServices"
    );

  const inactiveServicesReport =
    document.getElementById(
      "reportInactiveServices"
    );


  if (totalServicesReport) {
    totalServicesReport.textContent =
      data.services.total;
  }

  if (activeServicesReport) {
    activeServicesReport.textContent =
      data.services.active;
  }

  if (inactiveServicesReport) {
    inactiveServicesReport.textContent =
      data.services.inactive;
  }
}
// ==========================================
// ADMIN NOTIFICATIONS
// ==========================================

async function loadAdminNotifications() {

  try {

    const response = await fetch(
      `${ADMIN_API}/notifications`
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to load notifications"
      );

    }

    displayAdminNotifications(result.data);

  } catch (error) {

    console.error(
      "Admin Notifications Error:",
      error
    );

  }

}


function displayAdminNotifications(notifications) {

  const container =
    document.getElementById(
      "adminNotificationsContainer"
    );

  if (!container) {
    return;
  }

  if (
    !notifications ||
    notifications.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">
        <p>No notifications available.</p>
      </div>
    `;

    return;

  }

  container.innerHTML =
    notifications.map((notification) => {

      return `
        <div class="notification-card">

          <div class="notification-header">

            <h3>
              ${notification.title}
            </h3>

            <span>
              ${notification.status}
            </span>

          </div>

          <div class="notification-body">

            <p>
              ${notification.message}
            </p>

            <small>
              Type: ${notification.type}
            </small>

            <br>

            <small>
              ${formatAdminNotificationDate(
                notification.createdAt
              )}
            </small>

          </div>

          <div class="notification-actions">

            <button
              type="button"
              onclick="editAdminNotification(
                '${notification.id}'
              )"
            >
              Edit
            </button>

            <button
              type="button"
              onclick="deleteAdminNotification(
                '${notification.id}'
              )"
            >
              Delete
            </button>

            <select
              onchange="updateNotificationStatus(
                '${notification.id}',
                this.value
              )"
            >

              <option
                value="Active"
                ${
                  notification.status === "Active"
                    ? "selected"
                    : ""
                }
              >
                Active
              </option>

              <option
                value="Inactive"
                ${
                  notification.status === "Inactive"
                    ? "selected"
                    : ""
                }
              >
                Inactive
              </option>

            </select>

          </div>

        </div>
      `;

    }).join("");

}


function formatAdminNotificationDate(date) {

  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString(
    "en-IN"
  );

}


// CREATE NOTIFICATION

async function createAdminNotification(
  title,
  message,
  type = "info"
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/notifications`,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title,
          message,
          type
        })

      }
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to create notification"
      );

    }

    loadAdminNotifications();

    return result.data;

  } catch (error) {

    console.error(
      "Create Notification Error:",
      error
    );

  }

}


// EDIT NOTIFICATION

async function editAdminNotification(
  notificationId
) {

  const title = prompt(
    "Enter notification title:"
  );

  if (!title) {
    return;
  }

  const message = prompt(
    "Enter notification message:"
  );

  if (!message) {
    return;
  }

  const type = prompt(
    "Enter notification type:",
    "info"
  );

  try {

    const response = await fetch(
      `${ADMIN_API}/notifications/${notificationId}`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title,
          message,
          type: type || "info"
        })

      }
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to update notification"
      );

    }

    loadAdminNotifications();

  } catch (error) {

    console.error(
      "Update Notification Error:",
      error
    );

  }

}


// UPDATE STATUS

async function updateNotificationStatus(
  notificationId,
  status
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/notifications/${notificationId}/status`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          status
        })

      }
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to update notification status"
      );

    }

    loadAdminNotifications();

  } catch (error) {

    console.error(
      "Notification Status Error:",
      error
    );

  }

}


// DELETE NOTIFICATION

async function deleteAdminNotification(
  notificationId
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/notifications/${notificationId}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to delete notification"
      );

    }

    loadAdminNotifications();

  } catch (error) {

    console.error(
      "Delete Notification Error:",
      error
    );

  }

}
// ==========================================
// ADMIN SETTINGS
// ==========================================

async function loadAdminSettings() {

  try {

    const response = await fetch(
      `${ADMIN_API}/settings`
    );

    const result = await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to load settings"
      );

    }

    displayAdminSettings(result.data);

  } catch (error) {

    console.error(
      "Admin Settings Error:",
      error
    );

  }

}


function displayAdminSettings(settings) {

  const portalName =
    document.getElementById(
      "portalName"
    );

  const departmentName =
    document.getElementById(
      "departmentName"
    );

  const supportEmail =
    document.getElementById(
      "supportEmail"
    );

  const supportPhone =
    document.getElementById(
      "supportPhone"
    );

  const officeAddress =
    document.getElementById(
      "officeAddress"
    );

  const processingTime =
    document.getElementById(
      "processingTime"
    );

  const maintenanceMode =
    document.getElementById(
      "maintenanceMode"
    );


  if (portalName) {
    portalName.value =
      settings.portalName || "";
  }

  if (departmentName) {
    departmentName.value =
      settings.departmentName || "";
  }

  if (supportEmail) {
    supportEmail.value =
      settings.supportEmail || "";
  }

  if (supportPhone) {
    supportPhone.value =
      settings.supportPhone || "";
  }

  if (officeAddress) {
    officeAddress.value =
      settings.officeAddress || "";
  }

  if (processingTime) {
    processingTime.value =
      settings.processingTime || "";
  }

  if (maintenanceMode) {
    maintenanceMode.checked =
      settings.maintenanceMode === true;
  }

}


// UPDATE SETTINGS

async function updateAdminSettings(event) {

  if (event) {
    event.preventDefault();
  }


  const portalName =
    document.getElementById(
      "portalName"
    )?.value.trim();

  const departmentName =
    document.getElementById(
      "departmentName"
    )?.value.trim();

  const supportEmail =
    document.getElementById(
      "supportEmail"
    )?.value.trim();

  const supportPhone =
    document.getElementById(
      "supportPhone"
    )?.value.trim();

  const officeAddress =
    document.getElementById(
      "officeAddress"
    )?.value.trim();

  const processingTime =
    document.getElementById(
      "processingTime"
    )?.value.trim();

  const maintenanceMode =
    document.getElementById(
      "maintenanceMode"
    )?.checked || false;


  try {

    const response = await fetch(
      `${ADMIN_API}/settings`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          portalName,

          departmentName,

          supportEmail,

          supportPhone,

          officeAddress,

          processingTime,

          maintenanceMode

        })

      }
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to update settings"
      );

    }


    displayAdminSettings(
      result.data
    );


  } catch (error) {

    console.error(
      "Update Settings Error:",
      error
    );

  }

}


// MAINTENANCE MODE

async function updateMaintenanceMode(
  maintenanceMode
) {

  try {

    const response = await fetch(
      `${ADMIN_API}/settings/maintenance`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          maintenanceMode
        })

      }
    );


    const result =
      await response.json();


    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to update maintenance mode"
      );

    }


    const checkbox =
      document.getElementById(
        "maintenanceMode"
      );

    if (checkbox) {
      checkbox.checked =
        result.data.maintenanceMode;
    }


  } catch (error) {

    console.error(
      "Maintenance Mode Error:",
      error
    );

  }

}