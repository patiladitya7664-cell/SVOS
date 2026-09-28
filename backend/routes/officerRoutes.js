const express = require("express");

const router = express.Router();


// =====================================================
// MONGODB MODELS
// =====================================================

const Application = require("../models/Application");
const Complaint = require("../models/Complaint");
const User = require("../models/User");


// =====================================================
// EXISTING DATA STORES
// These modules are still used for modules that are
// not migrated to MongoDB yet.
// =====================================================

const services = require("../data/serviceStore");
const notifications = require("../data/notificationStore");
const certificates = require("../data/certificateStore");
const schemes = require("../data/schemeStore");


// =====================================================
// TEMPORARY OFFICER PROFILE
// DATABASE LATER
// =====================================================

let officer = {
  id: "OFFICER-001",
  name: "Panchayat Officer",
  email: "officer@svos.gov.in",
  mobile: "",
  role: "officer",
  village: "",
  taluka: "",
  district: "",
  address: ""
};


// =====================================================
// HELPER - APPLICATION STATUS
// =====================================================

function normalizeApplicationStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value === "pending") {
    return "Pending";
  }

  if (
    value === "under review" ||
    value === "under-review" ||
    value === "processing" ||
    value === "in progress"
  ) {
    return "Under Review";
  }

  if (
    value === "approved" ||
    value === "accepted"
  ) {
    return "Approved";
  }

  if (value === "completed") {
    return "Completed";
  }

  if (
    value === "rejected" ||
    value === "declined"
  ) {
    return "Rejected";
  }

  return null;
}


// =====================================================
// HELPER - COMPLAINT STATUS
// =====================================================

function normalizeComplaintStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value === "pending") {
    return "Pending";
  }

  if (
    value === "under review" ||
    value === "under-review"
  ) {
    return "Under Review";
  }

  if (
    value === "processing" ||
    value === "in progress"
  ) {
    return "In Progress";
  }

  if (
    value === "resolved" ||
    value === "completed"
  ) {
    return "Resolved";
  }

  if (
    value === "rejected" ||
    value === "declined"
  ) {
    return "Rejected";
  }

  if (value === "cancelled") {
    return "Cancelled";
  }

  if (value === "closed") {
    return "Closed";
  }

  return null;
}


// =====================================================
// OFFICER DASHBOARD
// GET /api/officer/dashboard
// =====================================================

router.get("/dashboard", async (req, res) => {
  try {

    // =================================================
    // APPLICATION STATS - MONGODB
    // =================================================

    const totalApplications =
      await Application.countDocuments();

    const pendingApplications =
      await Application.countDocuments({
        status: "Pending"
      });

    const processingApplications =
      await Application.countDocuments({
        status: "Under Review"
      });

    const approvedApplications =
      await Application.countDocuments({
        status: "Approved"
      });

    const rejectedApplications =
      await Application.countDocuments({
        status: "Rejected"
      });


    // =================================================
    // COMPLAINT STATS - MONGODB
    // =================================================

    const totalComplaints =
      await Complaint.countDocuments();

    const pendingComplaints =
      await Complaint.countDocuments({
        status: "Pending"
      });

    const processingComplaints =
      await Complaint.countDocuments({
        status: {
          $in: [
            "Under Review",
            "In Progress"
          ]
        }
      });

    const resolvedComplaints =
      await Complaint.countDocuments({
        status: {
          $in: [
            "Resolved",
            "Closed"
          ]
        }
      });

    const rejectedComplaints =
      await Complaint.countDocuments({
        status: "Rejected"
      });


    // =================================================
    // CITIZEN STATS - MONGODB
    // =================================================

    const totalCitizens =
      await User.countDocuments({
        role: "citizen"
      });


    // =================================================
    // RESPONSE
    // =================================================

    return res.json({
      success: true,

      data: {

        applications: {
          total: totalApplications,
          pending: pendingApplications,
          processing: processingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications
        },

        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          processing: processingComplaints,
          resolved: resolvedComplaints,
          rejected: rejectedComplaints
        },

        totalCitizens: totalCitizens,

        totalServices: services.length
      }
    });

  } catch (error) {

    console.error(
      "❌ Officer Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load officer dashboard"
    });
  }
});


// =====================================================
// SERVICE APPLICATIONS
// =====================================================


// =====================================================
// GET ALL APPLICATIONS
// GET /api/officer/applications
// =====================================================

router.get("/applications", async (req, res) => {
  try {

    const applications =
      await Application.find()
        .sort({
          createdAt: -1
        })
        .lean();

    return res.json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {

    console.error(
      "❌ Officer Applications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load applications"
    });
  }
});


// =====================================================
// GET APPLICATION BY ID
// GET /api/officer/applications/:id
// =====================================================

router.get(
  "/applications/:id",
  async (req, res) => {

    try {

      const application =
        await Application.findOne({
          applicationId: req.params.id
        })
          .lean();

      if (!application) {

        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      return res.json({
        success: true,
        data: application
      });

    } catch (error) {

      console.error(
        "❌ Officer Application Details Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load application"
      });
    }
  }
);


// =====================================================
// UPDATE APPLICATION STATUS
// PUT /api/officer/applications/:id/status
// =====================================================

router.put(
  "/applications/:id/status",
  async (req, res) => {

    try {

      const newStatus =
        normalizeApplicationStatus(
          req.body.status
        );

      if (!newStatus) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid application status. Allowed values: Pending, Under Review, Approved, Rejected, Completed"
        });
      }


      const updateData = {
        status: newStatus
      };


      if (
        req.body.adminRemark !== undefined
      ) {

        updateData.adminRemark =
          String(
            req.body.adminRemark
          );
      }


      if (
        newStatus === "Approved" ||
        newStatus === "Completed"
      ) {

        updateData.processedAt =
          new Date();

      } else if (
        newStatus === "Pending" ||
        newStatus === "Under Review"
      ) {

        updateData.processedAt = null;
      }


      const application =
        await Application.findOneAndUpdate(
          {
            applicationId:
              req.params.id
          },

          {
            $set: updateData
          },

          {
            new: true,
            runValidators: true
          }
        );


      if (!application) {

        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }


      return res.json({
        success: true,
        message:
          "Application status updated successfully",
        data: application
      });

    } catch (error) {

      console.error(
        "❌ Update Application Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update application status"
      });
    }
  }
);


// =====================================================
// COMPLAINTS - MONGODB
// =====================================================


// =====================================================
// GET ALL COMPLAINTS
// GET /api/officer/complaints
// =====================================================

router.get(
  "/complaints",
  async (req, res) => {

    try {

      const complaints =
        await Complaint.find()
          .sort({
            createdAt: -1
          })
          .lean();

      return res.status(200).json({
        success: true,
        count: complaints.length,
        data: complaints
      });

    } catch (error) {

      console.error(
        "❌ Get Officer Complaints Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch complaints"
      });
    }
  }
);


// =====================================================
// GET COMPLAINT BY ID
// GET /api/officer/complaints/:id
// =====================================================

router.get(
  "/complaints/:id",
  async (req, res) => {

    try {

      const complaint =
        await Complaint.findOne({
          complaintId:
            req.params.id
        })
          .lean();

      if (!complaint) {

        return res.status(404).json({
          success: false,
          message:
            "Complaint not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: complaint
      });

    } catch (error) {

      console.error(
        "❌ Get Complaint Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch complaint"
      });
    }
  }
);


// =====================================================
// UPDATE COMPLAINT STATUS
// PUT /api/officer/complaints/:id/status
// =====================================================

router.put(
  "/complaints/:id/status",
  async (req, res) => {

    try {

      const newStatus =
        normalizeComplaintStatus(
          req.body.status
        );


      if (!newStatus) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid complaint status. Allowed values: Pending, Under Review, In Progress, Resolved, Rejected, Cancelled, Closed"
        });
      }


      const updateData = {
        status: newStatus
      };


      if (
        req.body.adminRemark !== undefined
      ) {

        updateData.adminRemark =
          String(
            req.body.adminRemark
          );
      }


      if (
        newStatus === "Resolved" ||
        newStatus === "Closed"
      ) {

        updateData.resolvedAt =
          new Date();

      } else {

        updateData.resolvedAt = null;
      }


      const complaint =
        await Complaint.findOneAndUpdate(
          {
            complaintId:
              req.params.id
          },

          {
            $set: updateData
          },

          {
            new: true,
            runValidators: true
          }
        )
          .lean();


      if (!complaint) {

        return res.status(404).json({
          success: false,
          message:
            "Complaint not found"
        });
      }


      return res.status(200).json({
        success: true,
        message:
          "Complaint status updated successfully",
        data: complaint
      });

    } catch (error) {

      console.error(
        "❌ Update Complaint Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update complaint status"
      });
    }
  }
);


// =====================================================
// CITIZENS - MONGODB
// =====================================================


// =====================================================
// GET ALL CITIZENS
// GET /api/officer/citizens
// =====================================================

router.get(
  "/citizens",
  async (req, res) => {

    try {

      const citizens =
        await User.find({
          role: "citizen"
        })
          .select("-password")
          .sort({
            createdAt: -1
          })
          .lean();


      const formattedCitizens =
        citizens.map((citizen) => {

          return {

            _id: citizen._id,

            citizenId:
              `CITIZEN-${citizen._id
                .toString()
                .slice(-6)
                .toUpperCase()}`,

            name:
              citizen.name || "Citizen",

            email:
              citizen.email || "",

            mobile:
              citizen.mobile || "",

            address:
              citizen.address || "",

            village:
              citizen.village || "",

            city:
              citizen.city || "",

            state:
              citizen.state || "",

            pincode:
              citizen.pincode || "",

            status:
              citizen.status || "active",

            role:
              citizen.role,

            createdAt:
              citizen.createdAt,

            updatedAt:
              citizen.updatedAt
          };
        });


      return res.json({
        success: true,
        count: formattedCitizens.length,
        data: formattedCitizens
      });

    } catch (error) {

      console.error(
        "❌ Officer Citizens Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load citizens"
      });
    }
  }
);


// =====================================================
// GET CITIZEN BY ID
// GET /api/officer/citizens/:id
// =====================================================

router.get(
  "/citizens/:id",
  async (req, res) => {

    try {

      const citizen =
        await User.findOne({
          _id: req.params.id,
          role: "citizen"
        })
          .select("-password")
          .lean();


      if (!citizen) {

        return res.status(404).json({
          success: false,
          message:
            "Citizen not found"
        });
      }


      const formattedCitizen = {

        _id: citizen._id,

        citizenId:
          `CITIZEN-${citizen._id
            .toString()
            .slice(-6)
            .toUpperCase()}`,

        name:
          citizen.name || "Citizen",

        email:
          citizen.email || "",

        mobile:
          citizen.mobile || "",

        address:
          citizen.address || "",

        village:
          citizen.village || "",

        city:
          citizen.city || "",

        state:
          citizen.state || "",

        pincode:
          citizen.pincode || "",

        status:
          citizen.status || "active",

        role:
          citizen.role,

        createdAt:
          citizen.createdAt,

        updatedAt:
          citizen.updatedAt
      };


      return res.json({
        success: true,
        data: formattedCitizen
      });

    } catch (error) {

      console.error(
        "❌ Officer Citizen Details Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load citizen"
      });
    }
  }
);


// =====================================================
// NOTICES
// =====================================================

// GET ALL NOTICES
// GET /api/officer/notices

router.get(
  "/notices",
  (req, res) => {

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  }
);


// =====================================================
// SCHEMES
// =====================================================

// GET ALL SCHEMES
// GET /api/officer/schemes

router.get(
  "/schemes",
  (req, res) => {

    return res.json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  }
);


// =====================================================
// OFFICER PROFILE
// =====================================================


// GET PROFILE
// GET /api/officer/profile

router.get(
  "/profile",
  (req, res) => {

    return res.json({
      success: true,
      data: officer
    });
  }
);


// UPDATE PROFILE
// PUT /api/officer/profile

router.put(
  "/profile",
  (req, res) => {

    const {
      name,
      email,
      mobile,
      village,
      taluka,
      district,
      address
    } = req.body;


    if (!name || !email) {

      return res.status(400).json({
        success: false,
        message:
          "Name and email are required"
      });
    }


    officer.name =
      String(name).trim();

    officer.email =
      String(email).trim();

    officer.mobile =
      mobile
        ? String(mobile).trim()
        : "";

    officer.village =
      village
        ? String(village).trim()
        : "";

    officer.taluka =
      taluka
        ? String(taluka).trim()
        : "";

    officer.district =
      district
        ? String(district).trim()
        : "";

    officer.address =
      address
        ? String(address).trim()
        : "";


    return res.json({
      success: true,
      message:
        "Officer profile updated successfully",
      data: officer
    });
  }
);


// =====================================================
// OFFICER REPORTS
// GET /api/officer/reports
// =====================================================

router.get(
  "/reports",
  async (req, res) => {

    try {

      // =================================================
      // APPLICATION REPORTS
      // =================================================

      const totalApplications =
        await Application.countDocuments();

      const pendingApplications =
        await Application.countDocuments({
          status: "Pending"
        });

      const processingApplications =
        await Application.countDocuments({
          status: "Under Review"
        });

      const approvedApplications =
        await Application.countDocuments({
          status: "Approved"
        });

      const rejectedApplications =
        await Application.countDocuments({
          status: "Rejected"
        });


      // =================================================
      // COMPLAINT REPORTS
      // =================================================

      const totalComplaints =
        await Complaint.countDocuments();

      const pendingComplaints =
        await Complaint.countDocuments({
          status: "Pending"
        });

      const processingComplaints =
        await Complaint.countDocuments({
          status: {
            $in: [
              "Under Review",
              "In Progress"
            ]
          }
        });

      const resolvedComplaints =
        await Complaint.countDocuments({
          status: {
            $in: [
              "Resolved",
              "Closed"
            ]
          }
        });

      const rejectedComplaints =
        await Complaint.countDocuments({
          status: "Rejected"
        });


      // =================================================
      // CITIZEN REPORT
      // =================================================

      const totalCitizens =
        await User.countDocuments({
          role: "citizen"
        });


      // =================================================
      // RESPONSE
      // =================================================

      return res.json({

        success: true,

        data: {

          applications: {

            total:
              totalApplications,

            pending:
              pendingApplications,

            processing:
              processingApplications,

            approved:
              approvedApplications,

            rejected:
              rejectedApplications
          },


          complaints: {

            total:
              totalComplaints,

            pending:
              pendingComplaints,

            processing:
              processingComplaints,

            resolved:
              resolvedComplaints,

            rejected:
              rejectedComplaints
          },


          citizens: {

            total:
              totalCitizens
          },


          certificates: {

            total:
              certificates.length
          }
        }
      });

    } catch (error) {

      console.error(
        "❌ Officer Reports Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load officer reports"
      });
    }
  }
);


// =====================================================
// CERTIFICATES
// Existing store-based implementation
// =====================================================


// GET ALL CERTIFICATES
// GET /api/officer/certificates

router.get(
  "/certificates",
  (req, res) => {

    return res.json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  }
);


// GET CERTIFICATE BY ID
// GET /api/officer/certificates/:id

router.get(
  "/certificates/:id",
  (req, res) => {

    const certificate =
      certificates.find(
        (item) =>
          String(item.id) ===
          String(req.params.id)
      );


    if (!certificate) {

      return res.status(404).json({
        success: false,
        message:
          "Certificate not found"
      });
    }


    return res.json({
      success: true,
      data: certificate
    });
  }
);


// UPDATE CERTIFICATE STATUS
// PUT /api/officer/certificates/:id/status

router.put(
  "/certificates/:id/status",
  (req, res) => {

    const certificate =
      certificates.find(
        (item) =>
          String(item.id) ===
          String(req.params.id)
      );


    if (!certificate) {

      return res.status(404).json({
        success: false,
        message:
          "Certificate not found"
      });
    }


    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected"
    ];


    const newStatus =
      String(
        req.body.status || ""
      ).trim();


    if (
      !allowedStatuses.includes(
        newStatus
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid certificate status. Allowed values: Pending, Under Review, Approved, Rejected"
      });
    }


    certificate.status =
      newStatus;

    certificate.updatedAt =
      new Date().toISOString();


    return res.json({
      success: true,
      message:
        "Certificate status updated successfully",
      data: certificate
    });
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;
