const express = require("express");

const router = express.Router();

// =====================================================
// SHARED DATA STORES
// =====================================================

const applications = require("../data/applicationStore");
const certificates = require("../data/certificateStore");
const citizens = require("../data/citizenStore");
const citizenNotifications = require("../data/citizenNotificationStore");

// =====================================================
// CITIZEN DASHBOARD
// =====================================================

router.get("/dashboard", (req, res) => {
  const total = applications.length;

  const pending = applications.filter((app) => app.status === "Pending").length;

  const approved = applications.filter(
    (app) => app.status === "Approved",
  ).length;

  const rejected = applications.filter(
    (app) => app.status === "Rejected",
  ).length;

  const underReview = applications.filter(
    (app) => app.status === "Under Review",
  ).length;

  res.json({
    success: true,

    data: {
      totalApplications: total,

      pendingApplications: pending,

      underReviewApplications: underReview,

      approvedApplications: approved,

      rejectedApplications: rejected,
    },
  });
});

// =====================================================
// GET ALL APPLICATIONS
// =====================================================

router.get("/applications", (req, res) => {
  res.json({
    success: true,

    count: applications.length,

    data: applications,
  });
});

// =====================================================
// SUBMIT APPLICATION
// =====================================================

router.post("/applications", (req, res) => {
  const { service, applicantName, mobile, email, address, description } =
    req.body;

  if (!service || !applicantName || !mobile || !email || !address) {
    return res.status(400).json({
      success: false,

      message: "Please provide all required application details",
    });
  }

  const now = new Date().toISOString();

  const newApplication = {
    id: `APP-${Date.now()}`,

    service: String(service).trim(),

    applicantName: String(applicantName).trim(),

    mobile: String(mobile).trim(),

    email: String(email).trim(),

    address: String(address).trim(),

    description: description ? String(description).trim() : "",

    status: "Pending",

    submittedAt: now,

    updatedAt: now,
  };

  applications.push(newApplication);

  res.status(201).json({
    success: true,

    message: "Application submitted successfully",

    data: newApplication,
  });
});

// =====================================================
// GET APPLICATION BY ID
// + TRACKING
// =====================================================

router.get("/applications/:id", (req, res) => {
  const application = applications.find(
    (app) => String(app.id) === String(req.params.id),
  );

  if (!application) {
    return res.status(404).json({
      success: false,

      message: "Application not found",
    });
  }

  const trackingSteps = [
    {
      status: "Submitted",

      completed: true,

      date: application.submittedAt,
    },

    {
      status: "Under Review",

      completed: ["Under Review", "Approved"].includes(application.status),

      date:
        application.status === "Under Review" ||
        application.status === "Approved"
          ? application.updatedAt
          : null,
    },

    {
      status: "Approved",

      completed: application.status === "Approved",

      date: application.status === "Approved" ? application.updatedAt : null,
    },
  ];

  if (application.status === "Rejected") {
    trackingSteps.push({
      status: "Rejected",

      completed: true,

      date: application.updatedAt,
    });
  }

  res.json({
    success: true,

    data: {
      ...application,

      tracking: trackingSteps,
    },
  });
});

// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

router.put("/applications/:id/status", (req, res) => {
  const application = applications.find(
    (app) => String(app.id) === String(req.params.id),
  );

  if (!application) {
    return res.status(404).json({
      success: false,

      message: "Application not found",
    });
  }

  const { status } = req.body;

  const allowedStatuses = ["Pending", "Under Review", "Approved", "Rejected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,

      message:
        "Invalid application status. Allowed values: Pending, Under Review, Approved, Rejected",
    });
  }

  application.status = status;

  application.updatedAt = new Date().toISOString();

  res.json({
    success: true,

    message: "Application status updated successfully",

    data: application,
  });
});

// =====================================================
// GET CITIZEN PROFILE
// =====================================================

router.get("/profile", (req, res) => {
  const citizen = citizens[0];

  if (!citizen) {
    return res.status(404).json({
      success: false,

      message: "Citizen profile not found",
    });
  }

  res.json({
    success: true,

    data: {
      id: citizen.id,

      name: citizen.name,

      email: citizen.email,

      mobile: citizen.mobile || "",

      address: citizen.address || "",

      city: citizen.city || "",

      state: citizen.state || "",

      pincode: citizen.pincode || "",

      status: citizen.status,

      role: citizen.role,
    },
  });
});

// =====================================================
// UPDATE CITIZEN PROFILE
// =====================================================

router.put("/profile", (req, res) => {
  const citizen = citizens[0];

  if (!citizen) {
    return res.status(404).json({
      success: false,

      message: "Citizen profile not found",
    });
  }

  const { name, email, mobile, address, city, state, pincode } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,

      message: "Name and email are required",
    });
  }

  citizen.name = String(name).trim();

  citizen.email = String(email).trim();

  citizen.mobile = mobile ? String(mobile).trim() : "";

  citizen.address = address ? String(address).trim() : "";

  citizen.city = city ? String(city).trim() : "";

  citizen.state = state ? String(state).trim() : "";

  citizen.pincode = pincode ? String(pincode).trim() : "";

  res.json({
    success: true,

    message: "Profile updated successfully",

    data: citizen,
  });
});

// =====================================================
// GET CITIZEN NOTIFICATIONS
// =====================================================

router.get("/notifications", (req, res) => {
  res.json({
    success: true,

    count: citizenNotifications.length,

    data: citizenNotifications,
  });
});

// =====================================================
// MARK NOTIFICATION AS READ
// =====================================================

router.put("/notifications/:id/read", (req, res) => {
  const notification = citizenNotifications.find(
    (item) => String(item.id) === String(req.params.id),
  );

  if (!notification) {
    return res.status(404).json({
      success: false,

      message: "Notification not found",
    });
  }

  notification.read = true;

  res.json({
    success: true,

    message: "Notification marked as read",

    data: notification,
  });
});

// =====================================================
// GET ALL CITIZEN CERTIFICATES
// =====================================================

router.get("/certificates", (req, res) => {
  res.json({
    success: true,

    count: certificates.length,

    data: certificates,
  });
});

// =====================================================
// GET CERTIFICATE BY ID
// =====================================================

router.get("/certificates/:id", (req, res) => {
  const certificate = certificates.find(
    (item) => String(item.id) === String(req.params.id),
  );

  if (!certificate) {
    return res.status(404).json({
      success: false,

      message: "Certificate not found",
    });
  }

  res.json({
    success: true,

    data: certificate,
  });
});

// =====================================================
// SUBMIT CERTIFICATE APPLICATION
// =====================================================

router.post("/certificates", (req, res) => {
  const { citizenId, citizenName, email, mobile, certificateType, purpose } =
    req.body;

  if (!citizenId || !citizenName || !certificateType) {
    return res.status(400).json({
      success: false,

      message: "Citizen ID, citizen name and certificate type are required",
    });
  }

  const now = new Date().toISOString();

  const newCertificate = {
    id: `CERT-${Date.now()}`,

    citizenId: String(citizenId).trim(),

    citizenName: String(citizenName).trim(),

    email: email ? String(email).trim() : "",

    mobile: mobile ? String(mobile).trim() : "",

    certificateType: String(certificateType).trim(),

    purpose: purpose ? String(purpose).trim() : "",

    status: "Pending",

    appliedAt: now,

    updatedAt: now,
  };

  certificates.push(newCertificate);

  res.status(201).json({
    success: true,

    message: "Certificate application submitted successfully",

    data: newCertificate,
  });
});

// =====================================================
// CITIZEN LOGIN
// =====================================================

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,

      message: "Email and password are required",
    });
  }

  // Temporary login.
  // Database/Auth system later connect hoga.

  const citizen = {
    id: "CITIZEN-001",

    name: "Citizen User",

    email: String(email).trim(),

    role: "citizen",
  };

  res.json({
    success: true,

    message: "Login successful",

    data: citizen,
  });
});

// =====================================================
// CITIZEN LOGOUT
// =====================================================

router.post("/logout", (req, res) => {
  res.json({
    success: true,

    message: "Logout successful",
  });
});

// =====================================================
// GET CURRENT CITIZEN
// =====================================================

router.get("/me", (req, res) => {
  const citizen = citizens[0];

  if (!citizen) {
    return res.status(404).json({
      success: false,

      message: "Citizen not found",
    });
  }

  res.json({
    success: true,

    data: {
      id: citizen.id,

      name: citizen.name,

      email: citizen.email,

      role: citizen.role,
    },
  });
});

module.exports = router;
