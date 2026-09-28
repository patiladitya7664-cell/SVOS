// =========================================================
// SVOS - ADMIN ROUTES
// =========================================================
// Admin Dashboard
// Admin Profile
// Applications - MongoDB
// Citizens - MongoDB
// Reports - MongoDB
// Notifications - MongoDB
// Settings
// Complaints - MongoDB
//
// Services -> /api/services
// Schemes  -> /api/schemes
// =========================================================

const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// =========================================================
// MODELS
// =========================================================

const Application = require("../models/Application");
const Citizen = require("../models/Citizen");
const Service = require("../models/Service");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

// =========================================================
// DATA STORES
// =========================================================

const settings = require("../data/settingsStore");

// =========================================================
// TEMPORARY ADMIN PROFILE
// =========================================================

let admin = {
  id: "ADMIN-001",
  name: "SVOS Administrator",
  email: "admin@svos.gov.in",
  role: "admin",
};

// =========================================================
// HELPERS
// =========================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ---------------------------------------------------------
// Find Complaint by custom complaintId or MongoDB _id
// ---------------------------------------------------------

const findComplaint = async (id) => {
  const complaintId = String(id || "").trim();

  if (!complaintId) {
    return null;
  }

  let complaint = await Complaint.findOne({
    complaintId,
  });

  if (!complaint && isValidObjectId(complaintId)) {
    complaint = await Complaint.findById(complaintId);
  }

  return complaint;
};

// =========================================================
// ADMIN DASHBOARD
// =========================================================
// GET /api/admin/dashboard
// =========================================================

router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalCitizens,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalServices,
    ] = await Promise.all([
      Citizen.countDocuments(),

      Application.countDocuments(),

      Application.countDocuments({
        status: "Pending",
      }),

      Application.countDocuments({
        status: "Approved",
      }),

      Application.countDocuments({
        status: "Rejected",
      }),

      Service.countDocuments(),
    ]);

    return res.json({
      success: true,

      data: {
        totalCitizens,

        totalApplications,

        pendingApplications,

        approvedApplications,

        rejectedApplications,

        totalServices,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load admin dashboard",
    });
  }
});

// =========================================================
// GET ADMIN PROFILE
// =========================================================

router.get("/profile", (req, res) => {
  return res.json({
    success: true,
    data: admin,
  });
});

// =========================================================
// UPDATE ADMIN PROFILE
// =========================================================

router.put("/profile", (req, res) => {
  try {
    const {
      name,
      email,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Name and email are required",
      });
    }

    admin.name = String(name).trim();

    admin.email = String(email)
      .trim()
      .toLowerCase();

    return res.json({
      success: true,
      message:
        "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error(
      "Update admin profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update admin profile",
    });
  }
});

// =========================================================
// GET ALL APPLICATIONS
// =========================================================
// GET /api/admin/applications
// =========================================================

router.get(
  "/applications",
  async (req, res) => {
    try {
      const applications =
        await Application.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count:
          applications.length,
        data: applications,
      });
    } catch (error) {
      console.error(
        "Admin get applications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load applications",
      });
    }
  }
);

// =========================================================
// GET APPLICATION BY ID
// =========================================================
// GET /api/admin/applications/:id
// =========================================================

router.get(
  "/applications/:id",
  async (req, res) => {
    try {
      const id =
        String(req.params.id).trim();

      let application = null;

      // ---------------------------------------------------
      // Try custom applicationId
      // ---------------------------------------------------

      application =
        await Application.findOne({
          applicationId: id,
        });

      // ---------------------------------------------------
      // Try MongoDB _id
      // ---------------------------------------------------

      if (
        !application &&
        isValidObjectId(id)
      ) {
        application =
          await Application.findById(id);
      }

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found",
        });
      }

      return res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error(
        "Admin get application error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load application",
      });
    }
  }
);

// =========================================================
// UPDATE APPLICATION STATUS
// =========================================================
// PUT /api/admin/applications/:id/status
// =========================================================

router.put(
  "/applications/:id/status",
  async (req, res) => {
    try {
      const {
        status,
        adminRemark,
        remark,
      } = req.body;

      const allowedStatuses = [
        "Pending",
        "Under Review",
        "Approved",
        "Rejected",
        "Completed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status",
        });
      }

      const id =
        String(req.params.id).trim();

      let application = null;

      application =
        await Application.findOne({
          applicationId: id,
        });

      if (
        !application &&
        isValidObjectId(id)
      ) {
        application =
          await Application.findById(id);
      }

      if (!application) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found",
        });
      }

      application.status = status;

      if (
        typeof adminRemark ===
        "string"
      ) {
        application.adminRemark =
          adminRemark.trim();
      } else if (
        typeof remark === "string"
      ) {
        application.adminRemark =
          remark.trim();
      }

      if (
        [
          "Approved",
          "Rejected",
          "Completed",
        ].includes(status)
      ) {
        application.processedAt =
          new Date();
      }

      await application.save();

      return res.json({
        success: true,
        message:
          "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      console.error(
        "Admin update application status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update application status",
      });
    }
  }
);

// =========================================================
// ADMIN LOGIN
// =========================================================
// NOTE:
// Main authentication is handled by /api/auth.
// This route is kept for existing frontend compatibility.
// =========================================================

router.post("/login", (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Email and password are required",
    });
  }

  const adminUser = {
    id: "ADMIN-001",

    name: "SVOS Administrator",

    email: String(email)
      .trim()
      .toLowerCase(),

    role: "admin",
  };

  return res.json({
    success: true,
    message:
      "Admin login successful",
    data: adminUser,
  });
});

// =========================================================
// ADMIN LOGOUT
// =========================================================

router.post("/logout", (req, res) => {
  return res.json({
    success: true,
    message:
      "Admin logout successful",
  });
});

// =========================================================
// CITIZEN MANAGEMENT
// MONGODB
// =========================================================

// ---------------------------------------------------------
// GET ALL CITIZENS
// GET /api/admin/citizens
// ---------------------------------------------------------

router.get(
  "/citizens",
  async (req, res) => {
    try {
      const citizens =
        await Citizen.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count:
          citizens.length,
        data: citizens,
      });
    } catch (error) {
      console.error(
        "Admin get citizens error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load citizens",
      });
    }
  }
);

// ---------------------------------------------------------
// GET CITIZEN BY ID
// ---------------------------------------------------------

router.get(
  "/citizens/:id",
  async (req, res) => {
    try {
      const id =
        String(req.params.id).trim();

      let citizen = null;

      if (isValidObjectId(id)) {
        citizen =
          await Citizen.findById(id).lean();
      }

      if (!citizen) {
        citizen =
          await Citizen.findOne({
            citizenId: id,
          }).lean();
      }

      if (!citizen) {
        return res.status(404).json({
          success: false,
          message:
            "Citizen not found",
        });
      }

      return res.json({
        success: true,
        data: citizen,
      });
    } catch (error) {
      console.error(
        "Admin get citizen error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load citizen",
      });
    }
  }
);

// ---------------------------------------------------------
// UPDATE CITIZEN STATUS
// ---------------------------------------------------------

router.put(
  "/citizens/:id/status",
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "Active",
        "Blocked",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid citizen status",
        });
      }

      const id =
        String(req.params.id).trim();

      let citizen = null;

      if (isValidObjectId(id)) {
        citizen =
          await Citizen.findById(id);
      }

      if (!citizen) {
        citizen =
          await Citizen.findOne({
            citizenId: id,
          });
      }

      if (!citizen) {
        return res.status(404).json({
          success: false,
          message:
            "Citizen not found",
        });
      }

      citizen.status = status;

      await citizen.save();

      return res.json({
        success: true,
        message:
          "Citizen status updated successfully",
        data: citizen,
      });
    } catch (error) {
      console.error(
        "Admin update citizen status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update citizen status",
      });
    }
  }
);

// =========================================================
// ADMIN REPORTS & ANALYTICS
// MONGODB
// =========================================================

router.get(
  "/reports/summary",
  async (req, res) => {
    try {
      const [
        totalCitizens,
        activeCitizens,
        blockedCitizens,

        totalApplications,
        pendingApplications,
        underReviewApplications,
        approvedApplications,
        rejectedApplications,

        totalServices,
        activeServices,
        inactiveServices,
      ] = await Promise.all([
        Citizen.countDocuments(),

        Citizen.countDocuments({
          status: "Active",
        }),

        Citizen.countDocuments({
          status: "Blocked",
        }),

        Application.countDocuments(),

        Application.countDocuments({
          status: "Pending",
        }),

        Application.countDocuments({
          status: "Under Review",
        }),

        Application.countDocuments({
          status: "Approved",
        }),

        Application.countDocuments({
          status: "Rejected",
        }),

        Service.countDocuments(),

        Service.countDocuments({
          status: "Active",
        }),

        Service.countDocuments({
          status: "Inactive",
        }),
      ]);

      return res.json({
        success: true,

        data: {
          citizens: {
            total:
              totalCitizens,

            active:
              activeCitizens,

            blocked:
              blockedCitizens,
          },

          applications: {
            total:
              totalApplications,

            pending:
              pendingApplications,

            underReview:
              underReviewApplications,

            approved:
              approvedApplications,

            rejected:
              rejectedApplications,
          },

          services: {
            total:
              totalServices,

            active:
              activeServices,

            inactive:
              inactiveServices,
          },
        },
      });
    } catch (error) {
      console.error(
        "Admin reports summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load reports",
      });
    }
  }
);

// =========================================================
// ADMIN NOTIFICATIONS
// MONGODB
// =========================================================

// ---------------------------------------------------------
// GET ALL NOTIFICATIONS
// ---------------------------------------------------------

router.get(
  "/notifications",
  async (req, res) => {
    try {
      const notifications =
        await Notification.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.json({
        success: true,
        count:
          notifications.length,

        data:
          notifications.map(
            (notification) => ({
              id:
                notification.notificationId,

              title:
                notification.title,

              message:
                notification.message,

              type:
                notification.type,

              status:
                notification.status,

              createdAt:
                notification.createdAt,

              updatedAt:
                notification.updatedAt,
            })
          ),
      });
    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load notifications",
      });
    }
  }
);

// ---------------------------------------------------------
// GET NOTIFICATION BY ID
// ---------------------------------------------------------

router.get(
  "/notifications/:id",
  async (req, res) => {
    try {
      const notification =
        await Notification.findOne({
          notificationId:
            req.params.id,
        }).lean();

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.json({
        success: true,

        data: {
          id:
            notification.notificationId,

          title:
            notification.title,

          message:
            notification.message,

          type:
            notification.type,

          status:
            notification.status,

          createdAt:
            notification.createdAt,

          updatedAt:
            notification.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Get notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load notification",
      });
    }
  }
);

// ---------------------------------------------------------
// CREATE NOTIFICATION
// ---------------------------------------------------------

router.post(
  "/notifications",
  async (req, res) => {
    try {
      const {
        title,
        message,
        type,
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message:
            "Title and message are required",
        });
      }

      const newNotification =
        await Notification.create({
          notificationId:
            `NOTIF-${Date.now()}`,

          title:
            String(title).trim(),

          message:
            String(message).trim(),

          type:
            type || "info",

          status:
            "Active",
        });

      return res.status(201).json({
        success: true,

        message:
          "Notification created successfully",

        data: {
          id:
            newNotification.notificationId,

          title:
            newNotification.title,

          message:
            newNotification.message,

          type:
            newNotification.type,

          status:
            newNotification.status,

          createdAt:
            newNotification.createdAt,

          updatedAt:
            newNotification.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Create notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create notification",
      });
    }
  }
);

// ---------------------------------------------------------
// UPDATE NOTIFICATION
// ---------------------------------------------------------

router.put(
  "/notifications/:id",
  async (req, res) => {
    try {
      const {
        title,
        message,
        type,
      } = req.body;

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message:
            "Title and message are required",
        });
      }

      const notification =
        await Notification.findOne({
          notificationId:
            req.params.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.title =
        String(title).trim();

      notification.message =
        String(message).trim();

      notification.type =
        type || "info";

      await notification.save();

      return res.json({
        success: true,

        message:
          "Notification updated successfully",

        data: {
          id:
            notification.notificationId,

          title:
            notification.title,

          message:
            notification.message,

          type:
            notification.type,

          status:
            notification.status,

          createdAt:
            notification.createdAt,

          updatedAt:
            notification.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Update notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notification",
      });
    }
  }
);

// ---------------------------------------------------------
// UPDATE NOTIFICATION STATUS
// ---------------------------------------------------------

router.put(
  "/notifications/:id/status",
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "Active",
        "Inactive",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification status",
        });
      }

      const notification =
        await Notification.findOne({
          notificationId:
            req.params.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.status =
        status;

      await notification.save();

      return res.json({
        success: true,

        message:
          "Notification status updated successfully",

        data: {
          id:
            notification.notificationId,

          title:
            notification.title,

          message:
            notification.message,

          type:
            notification.type,

          status:
            notification.status,

          createdAt:
            notification.createdAt,

          updatedAt:
            notification.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "Update notification status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notification status",
      });
    }
  }
);

// ---------------------------------------------------------
// DELETE NOTIFICATION
// ---------------------------------------------------------

router.delete(
  "/notifications/:id",
  async (req, res) => {
    try {
      const deletedNotification =
        await Notification.findOneAndDelete({
          notificationId:
            req.params.id,
        });

      if (!deletedNotification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.json({
        success: true,

        message:
          "Notification deleted successfully",

        data: {
          id:
            deletedNotification.notificationId,

          title:
            deletedNotification.title,

          message:
            deletedNotification.message,

          type:
            deletedNotification.type,

          status:
            deletedNotification.status,
        },
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification",
      });
    }
  }
);

// =========================================================
// ADMIN SETTINGS
// =========================================================

// ---------------------------------------------------------
// GET SETTINGS
// ---------------------------------------------------------

router.get(
  "/settings",
  (req, res) => {
    return res.json({
      success: true,
      data: settings,
    });
  }
);

// ---------------------------------------------------------
// UPDATE SETTINGS
// ---------------------------------------------------------

router.put(
  "/settings",
  (req, res) => {
    const {
      portalName,
      departmentName,
      supportEmail,
      supportPhone,
      officeAddress,
      processingTime,
      maintenanceMode,
    } = req.body;

    if (
      !portalName ||
      !departmentName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Portal name and department name are required",
      });
    }

    settings.portalName =
      String(portalName).trim();

    settings.departmentName =
      String(departmentName).trim();

    settings.supportEmail =
      supportEmail || "";

    settings.supportPhone =
      supportPhone || "";

    settings.officeAddress =
      officeAddress || "";

    settings.processingTime =
      processingTime ||
      "7 Working Days";

    settings.maintenanceMode =
      maintenanceMode === true;

    return res.json({
      success: true,
      message:
        "Settings updated successfully",
      data: settings,
    });
  }
);

// ---------------------------------------------------------
// UPDATE MAINTENANCE MODE
// ---------------------------------------------------------

router.put(
  "/settings/maintenance",
  (req, res) => {
    const {
      maintenanceMode,
    } = req.body;

    if (
      typeof maintenanceMode !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "maintenanceMode must be true or false",
      });
    }

    settings.maintenanceMode =
      maintenanceMode;

    return res.json({
      success: true,
      message:
        "Maintenance mode updated successfully",
      data: {
        maintenanceMode:
          settings.maintenanceMode,
      },
    });
  }
);

// =========================================================
// COMPLAINT MANAGEMENT
// MONGODB
// =========================================================

// ---------------------------------------------------------
// GET ALL COMPLAINTS
// GET /api/admin/complaints
// ---------------------------------------------------------

router.get(
  "/complaints",
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find()
          .sort({
            createdAt: -1,
          })
          .lean();

      const stats = {
        total:
          complaints.length,

        pending:
          complaints.filter(
            (item) =>
              item.status ===
              "Pending"
          ).length,

        underReview:
          complaints.filter(
            (item) =>
              item.status ===
              "Under Review"
          ).length,

        inProgress:
          complaints.filter(
            (item) =>
              item.status ===
              "In Progress"
          ).length,

        resolved:
          complaints.filter(
            (item) =>
              item.status ===
              "Resolved"
          ).length,

        rejected:
          complaints.filter(
            (item) =>
              item.status ===
              "Rejected"
          ).length,

        cancelled:
          complaints.filter(
            (item) =>
              item.status ===
              "Cancelled"
          ).length,

        closed:
          complaints.filter(
            (item) =>
              item.status ===
              "Closed"
          ).length,
      };

      return res.json({
        success: true,

        count:
          complaints.length,

        stats,

        data: complaints,
      });
    } catch (error) {
      console.error(
        "Admin get complaints error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load complaints",
      });
    }
  }
);

// ---------------------------------------------------------
// GET COMPLAINT BY ID
// ---------------------------------------------------------

router.get(
  "/complaints/:id",
  async (req, res) => {
    try {
      const complaint =
        await findComplaint(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      return res.json({
        success: true,
        data: complaint,
      });
    } catch (error) {
      console.error(
        "Admin get complaint error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load complaint",
      });
    }
  }
);

// ---------------------------------------------------------
// CREATE COMPLAINT
// ---------------------------------------------------------

router.post(
  "/complaints",
  async (req, res) => {
    try {
      const {
        citizenId,
        citizenName,
        email,
        mobile,
        subject,
        description,
        category,
        location,
      } = req.body;

      if (
        !citizenName ||
        !subject ||
        !description ||
        !location
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Citizen name, subject, description and location are required",
        });
      }

      const complaintId =
        `CMP-${Date.now()}`;

      const newComplaint =
        await Complaint.create({
          complaintId,

          citizenId:
            citizenId || "",

          citizenName:
            String(
              citizenName
            ).trim(),

          email:
            String(
              email || ""
            ).trim(),

          mobile:
            String(
              mobile || ""
            ).trim(),

          category:
            String(
              category ||
                "General"
            ).trim(),

          subject:
            String(
              subject
            ).trim(),

          location:
            String(
              location
            ).trim(),

          description:
            String(
              description
            ).trim(),

          status:
            "Pending",

          adminRemark:
            "",

          resolvedAt:
            null,
        });

      return res.status(201).json({
        success: true,

        message:
          "Complaint submitted successfully",

        data: newComplaint,
      });
    } catch (error) {
      console.error(
        "Admin create complaint error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create complaint",
      });
    }
  }
);

// ---------------------------------------------------------
// UPDATE COMPLAINT STATUS
// ---------------------------------------------------------

router.put(
  "/complaints/:id/status",
  async (req, res) => {
    try {
      const {
        status,
        adminRemark,
        remark,
      } = req.body;

      const allowedStatuses = [
        "Pending",
        "Under Review",
        "In Progress",
        "Resolved",
        "Rejected",
        "Cancelled",
        "Closed",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid complaint status",
        });
      }

      const complaint =
        await findComplaint(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      complaint.status =
        status;

      if (
        typeof adminRemark ===
        "string"
      ) {
        complaint.adminRemark =
          adminRemark.trim();
      } else if (
        typeof remark ===
        "string"
      ) {
        complaint.adminRemark =
          remark.trim();
      }

      if (
        status === "Resolved"
      ) {
        complaint.resolvedAt =
          new Date();
      } else {
        complaint.resolvedAt =
          null;
      }

      await complaint.save();

      return res.json({
        success: true,

        message:
          "Complaint status updated successfully",

        data: complaint,
      });
    } catch (error) {
      console.error(
        "Admin update complaint status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update complaint status",
      });
    }
  }
);

// ---------------------------------------------------------
// UPDATE COMPLAINT DETAILS
// ---------------------------------------------------------

router.put(
  "/complaints/:id",
  async (req, res) => {
    try {
      const {
        subject,
        description,
        category,
        location,
      } = req.body;

      const complaint =
        await findComplaint(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      if (
        subject !== undefined
      ) {
        complaint.subject =
          String(
            subject
          ).trim();
      }

      if (
        description !== undefined
      ) {
        complaint.description =
          String(
            description
          ).trim();
      }

      if (
        category !== undefined
      ) {
        complaint.category =
          String(
            category
          ).trim();
      }

      if (
        location !== undefined
      ) {
        complaint.location =
          String(
            location
          ).trim();
      }

      await complaint.save();

      return res.json({
        success: true,

        message:
          "Complaint updated successfully",

        data: complaint,
      });
    } catch (error) {
      console.error(
        "Admin update complaint error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update complaint",
      });
    }
  }
);

// ---------------------------------------------------------
// DELETE COMPLAINT
// ---------------------------------------------------------

router.delete(
  "/complaints/:id",
  async (req, res) => {
    try {
      const complaint =
        await findComplaint(
          req.params.id
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      await Complaint.findByIdAndDelete(
        complaint._id
      );

      return res.json({
        success: true,

        message:
          "Complaint deleted successfully",

        data: complaint,
      });
    } catch (error) {
      console.error(
        "Admin delete complaint error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete complaint",
      });
    }
  }
);

// =========================================================
// EXPORT ROUTER
// =========================================================

module.exports = router;