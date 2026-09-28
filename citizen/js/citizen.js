const CITIZEN_API = "http://localhost:5000/api/citizen";

// ==========================================
// SUBMIT CITIZEN APPLICATION
// ==========================================

async function submitCitizenApplication(event) {
  event.preventDefault();

  const form = event.target;

  const applicationData = {
    service: document.getElementById("service").value,
    applicantName: document.getElementById("applicantName").value,
    mobile: document.getElementById("mobile").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    description: document.getElementById("description").value
  };

  try {
    const response = await fetch(
      `${CITIZEN_API}/applications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(applicationData)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Application submission failed"
      );
    }

    alert(
      `Application submitted successfully!\n\nApplication ID: ${result.data.id}`
    );

    form.reset();

    console.log("Application:", result.data);

  } catch (error) {
    console.error("Submit Error:", error);

    alert(
      error.message || "Unable to submit application"
    );
  }
}


// ==========================================
// GET MY APPLICATIONS
// ==========================================

async function loadMyApplications() {
  const container = document.getElementById(
    "applicationsContainer"
  );

  if (!container) {
    console.error("applicationsContainer not found");
    return;
  }

  container.innerHTML = `
    <p>Loading applications...</p>
  `;

  try {
    const response = await fetch(
      `${CITIZEN_API}/applications`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load applications"
      );
    }

    displayApplications(result.data);

  } catch (error) {
    console.error("Applications Error:", error);

    container.innerHTML = `
      <p class="error-message">
        Unable to load applications.
      </p>
    `;
  }
}


// ==========================================
// DISPLAY APPLICATIONS
// ==========================================

function displayApplications(applications) {
  const container = document.getElementById(
    "applicationsContainer"
  );

  if (!container) {
    console.error("applicationsContainer not found");
    return;
  }

  if (!applications || applications.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No Applications Found</h3>
        <p>You have not submitted any application yet.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = applications
    .map((application) => {
      const statusClass = application.status
        .toLowerCase()
        .replace(/\s+/g, "-");

      return `
        <div class="application-card">

          <div class="application-header">
            <h3>${application.service}</h3>

            <span class="status ${statusClass}">
              ${application.status}
            </span>
          </div>

          <div class="application-info">

            <p>
              <strong>Application ID:</strong>
              ${application.id}
            </p>

            <p>
              <strong>Applicant:</strong>
              ${application.applicantName}
            </p>

            <p>
              <strong>Mobile:</strong>
              ${application.mobile}
            </p>

            <p>
              <strong>Submitted:</strong>
              ${formatApplicationDate(
                application.submittedAt
              )}
            </p>

          </div>

          <div class="application-actions">

            <button
              class="view-btn"
              onclick="viewApplication('${application.id}')"
            >
              View Details
            </button>

            <button
              class="track-btn"
              onclick="trackApplication('${application.id}')"
            >
              Track Application
            </button>

          </div>

        </div>
      `;
    })
    .join("");
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatApplicationDate(date) {
  if (!date) {
    return "N/A";
  }

  return new Date(date).toLocaleString("en-IN");
}


// ==========================================
// VIEW APPLICATION DETAILS
// ==========================================

async function viewApplication(applicationId) {
  try {
    const response = await fetch(
      `${CITIZEN_API}/applications/${applicationId}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Application not found"
      );
    }

    const application = result.data;

    alert(
      `Application Details\n\n` +
      `Application ID: ${application.id}\n` +
      `Service: ${application.service}\n` +
      `Applicant: ${application.applicantName}\n` +
      `Mobile: ${application.mobile}\n` +
      `Email: ${application.email}\n` +
      `Address: ${application.address}\n` +
      `Status: ${application.status}`
    );

  } catch (error) {
    console.error(
      "Application Details Error:",
      error
    );

    alert(
      error.message ||
      "Unable to load application"
    );
  }
}


// ==========================================
// TRACK APPLICATION
// ==========================================

async function trackApplication(applicationId) {
  try {
    const response = await fetch(
      `${CITIZEN_API}/applications/${applicationId}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Unable to track application"
      );
    }

    displayTracking(result.data);

  } catch (error) {
    console.error(
      "Tracking Error:",
      error
    );

    alert(
      error.message ||
      "Unable to load tracking information"
    );
  }
}


// ==========================================
// DISPLAY APPLICATION TRACKING
// ==========================================

function displayTracking(application) {
  const container = document.getElementById(
    "trackingContainer"
  );

  if (!container) {
    console.error(
      "trackingContainer not found"
    );

    alert(
      "Tracking container not found in HTML."
    );

    return;
  }

  container.innerHTML = `
    <div class="tracking-card">

      <div class="tracking-header">

        <h2>
          ${application.service}
        </h2>

        <p>
          Application ID:
          <strong>
            ${application.id}
          </strong>
        </p>

        <p>
          Current Status:
          <strong>
            ${application.status}
          </strong>
        </p>

      </div>


      <div class="tracking-timeline">

        ${
          application.tracking &&
          application.tracking.length > 0
            ? application.tracking
                .map(
                  (step) => `
                    <div
                      class="tracking-step ${
                        step.completed
                          ? "completed"
                          : ""
                      }"
                    >

                      <div class="tracking-dot"></div>

                      <div class="tracking-content">

                        <h3>
                          ${step.status}
                        </h3>

                        ${
                          step.completed
                            ? `
                              <p>
                                Completed
                              </p>
                            `
                            : `
                              <p>
                                Waiting
                              </p>
                            `
                        }

                      </div>

                    </div>
                  `
                )
                .join("")
            : `
              <p>
                Tracking information not available.
              </p>
            `
        }

      </div>

    </div>
  `;
}


// ==========================================
// AUTO LOAD APPLICATIONS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const applicationsContainer =
      document.getElementById(
        "applicationsContainer"
      );

    if (applicationsContainer) {
      loadMyApplications();
    }

  }
);
// ==========================================
// GET CITIZEN PROFILE
// ==========================================

async function loadCitizenProfile() {
  try {
    const response = await fetch(
      `${CITIZEN_API}/profile`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to load profile"
      );
    }

    displayCitizenProfile(result.data);

  } catch (error) {
    console.error(
      "Profile Load Error:",
      error
    );

    alert(
      error.message ||
      "Unable to load profile"
    );
  }
}


// ==========================================
// DISPLAY CITIZEN PROFILE
// ==========================================

function displayCitizenProfile(profile) {

  const nameInput =
    document.getElementById("profileName");

  const emailInput =
    document.getElementById("profileEmail");

  const mobileInput =
    document.getElementById("profileMobile");

  const addressInput =
    document.getElementById("profileAddress");

  const cityInput =
    document.getElementById("profileCity");

  const stateInput =
    document.getElementById("profileState");

  const pincodeInput =
    document.getElementById("profilePincode");


  if (nameInput) {
    nameInput.value = profile.name || "";
  }

  if (emailInput) {
    emailInput.value = profile.email || "";
  }

  if (mobileInput) {
    mobileInput.value = profile.mobile || "";
  }

  if (addressInput) {
    addressInput.value = profile.address || "";
  }

  if (cityInput) {
    cityInput.value = profile.city || "";
  }

  if (stateInput) {
    stateInput.value = profile.state || "";
  }

  if (pincodeInput) {
    pincodeInput.value = profile.pincode || "";
  }
}


// ==========================================
// UPDATE CITIZEN PROFILE
// ==========================================

async function updateCitizenProfile(event) {

  event.preventDefault();

  const profileData = {
    name:
      document.getElementById("profileName")?.value
      || "",

    email:
      document.getElementById("profileEmail")?.value
      || "",

    mobile:
      document.getElementById("profileMobile")?.value
      || "",

    address:
      document.getElementById("profileAddress")?.value
      || "",

    city:
      document.getElementById("profileCity")?.value
      || "",

    state:
      document.getElementById("profileState")?.value
      || "",

    pincode:
      document.getElementById("profilePincode")?.value
      || ""
  };


  try {

    const response = await fetch(
      `${CITIZEN_API}/profile`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(profileData)
      }
    );


    const result = await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Profile update failed"
      );
    }


    alert(
      result.message ||
      "Profile updated successfully"
    );


    displayCitizenProfile(result.data);


  } catch (error) {

    console.error(
      "Profile Update Error:",
      error
    );

    alert(
      error.message ||
      "Unable to update profile"
    );
  }
}


// ==========================================
// AUTO LOAD PROFILE
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const profileForm =
      document.getElementById(
        "citizenProfileForm"
      );

    if (profileForm) {

      loadCitizenProfile();

      profileForm.addEventListener(
        "submit",
        updateCitizenProfile
      );

    }

  }
);
// ==========================================
// GET CITIZEN NOTIFICATIONS
// ==========================================

async function loadCitizenNotifications() {
  const container =
    document.getElementById(
      "notificationsContainer"
    );

  if (!container) {
    console.error(
      "notificationsContainer not found"
    );

    return;
  }

  container.innerHTML = `
    <p>Loading notifications...</p>
  `;


  try {

    const response = await fetch(
      `${CITIZEN_API}/notifications`
    );

    const result = await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load notifications"
      );
    }


    displayCitizenNotifications(
      result.data
    );


  } catch (error) {

    console.error(
      "Notifications Error:",
      error
    );


    container.innerHTML = `
      <p class="error-message">
        Unable to load notifications.
      </p>
    `;
  }
}


// ==========================================
// DISPLAY NOTIFICATIONS
// ==========================================

function displayCitizenNotifications(
  notifications
) {

  const container =
    document.getElementById(
      "notificationsContainer"
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

        <h3>
          No Notifications
        </h3>

        <p>
          You don't have any notifications.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    notifications
      .map((notification) => {

        return `
          <div
            class="notification-card ${
              notification.read
                ? "read"
                : "unread"
            }"
          >

            <div class="notification-icon">
              🔔
            </div>


            <div class="notification-content">

              <h3>
                ${notification.title}
              </h3>

              <p>
                ${notification.message}
              </p>

              <small>
                ${formatApplicationDate(
                  notification.createdAt
                )}
              </small>

            </div>


            ${
              !notification.read
                ? `
                  <button
                    class="notification-read-btn"
                    onclick="markNotificationAsRead(
                      '${notification.id}'
                    )"
                  >
                    Mark as Read
                  </button>
                `
                : ""
            }

          </div>
        `;
      })
      .join("");
}


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

async function markNotificationAsRead(
  notificationId
) {

  try {

    const response = await fetch(
      `${CITIZEN_API}/notifications/${notificationId}/read`,
      {
        method: "PUT"
      }
    );


    const result =
      await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Unable to update notification"
      );
    }


    loadCitizenNotifications();


  } catch (error) {

    console.error(
      "Notification Update Error:",
      error
    );


    alert(
      error.message ||
      "Unable to mark notification as read"
    );
  }
}


// ==========================================
// AUTO LOAD NOTIFICATIONS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const notificationContainer =
      document.getElementById(
        "notificationsContainer"
      );


    if (notificationContainer) {
      loadCitizenNotifications();
    }

  }
);
// ==========================================
// LOAD CITIZEN DASHBOARD
// ==========================================

async function loadCitizenDashboard() {
  try {
    const response = await fetch(
      `${CITIZEN_API}/dashboard`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to load dashboard"
      );
    }

    displayCitizenDashboard(result.data);

  } catch (error) {
    console.error(
      "Dashboard Error:",
      error
    );
  }
}


// ==========================================
// DISPLAY CITIZEN DASHBOARD
// ==========================================

function displayCitizenDashboard(data) {

  const totalElement =
    document.getElementById(
      "totalApplications"
    );

  const pendingElement =
    document.getElementById(
      "pendingApplications"
    );

  const approvedElement =
    document.getElementById(
      "approvedApplications"
    );

  const rejectedElement =
    document.getElementById(
      "rejectedApplications"
    );


  if (totalElement) {
    totalElement.textContent =
      data.totalApplications ?? 0;
  }


  if (pendingElement) {
    pendingElement.textContent =
      data.pendingApplications ?? 0;
  }


  if (approvedElement) {
    approvedElement.textContent =
      data.approvedApplications ?? 0;
  }


  if (rejectedElement) {
    rejectedElement.textContent =
      data.rejectedApplications ?? 0;
  }
}


// ==========================================
// AUTO LOAD DASHBOARD
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const dashboard =
      document.getElementById(
        "totalApplications"
      );

    if (dashboard) {
      loadCitizenDashboard();
    }

  }
);
// ==========================================
// CITIZEN LOGIN
// ==========================================

async function citizenLogin(event) {
  event.preventDefault();

  const emailInput =
    document.getElementById("loginEmail");

  const passwordInput =
    document.getElementById("loginPassword");

  if (!emailInput || !passwordInput) {
    console.error(
      "Login fields not found"
    );

    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    alert(
      "Please enter email and password."
    );

    return;
  }

  try {

    const response = await fetch(
      `${CITIZEN_API}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })
      }
    );


    const result =
      await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Login failed"
      );
    }


    // Store temporary citizen session
    localStorage.setItem(
      "svosCitizen",
      JSON.stringify(result.data)
    );


    alert(
      result.message ||
      "Login successful"
    );


    // Dashboard redirect
    window.location.href =
      "citizen-dashboard.html";


  } catch (error) {

    console.error(
      "Citizen Login Error:",
      error
    );


    alert(
      error.message ||
      "Unable to login"
    );
  }
}


// ==========================================
// GET CURRENT CITIZEN
// ==========================================

async function loadCurrentCitizen() {

  try {

    const response = await fetch(
      `${CITIZEN_API}/me`
    );

    const result =
      await response.json();


    if (!response.ok) {
      throw new Error(
        result.message ||
        "Unable to load citizen"
      );
    }


    localStorage.setItem(
      "svosCitizen",
      JSON.stringify(result.data)
    );


    displayCurrentCitizen(
      result.data
    );


  } catch (error) {

    console.error(
      "Citizen Profile Error:",
      error
    );
  }
}


// ==========================================
// DISPLAY CURRENT CITIZEN
// ==========================================

function displayCurrentCitizen(
  citizen
) {

  const nameElements =
    document.querySelectorAll(
      ".citizen-name"
    );


  nameElements.forEach(
    (element) => {
      element.textContent =
        citizen.name || "Citizen";
    }
  );


  const emailElements =
    document.querySelectorAll(
      ".citizen-email"
    );


  emailElements.forEach(
    (element) => {
      element.textContent =
        citizen.email || "";
    }
  );
}


// ==========================================
// CITIZEN LOGOUT
// ==========================================

async function citizenLogout() {

  try {

    await fetch(
      `${CITIZEN_API}/logout`,
      {
        method: "POST"
      }
    );

  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );

  } finally {

    localStorage.removeItem(
      "svosCitizen"
    );

    window.location.href =
      "login.html";
  }
}


// ==========================================
// LOAD CITIZEN SESSION
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const citizen =
      localStorage.getItem(
        "svosCitizen"
      );

    if (citizen) {

      try {

        const parsedCitizen =
          JSON.parse(citizen);

        displayCurrentCitizen(
          parsedCitizen
        );

      } catch (error) {

        console.error(
          "Invalid citizen session",
          error
        );

        localStorage.removeItem(
          "svosCitizen"
        );
      }
    }

  }
);