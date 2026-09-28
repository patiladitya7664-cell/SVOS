// =====================================================
// SVOS - APPLICATION CONTROLLER
// Citizen Service Applications
// MongoDB
// =====================================================

const mongoose = require("mongoose");
const Application = require("../models/Application");

// =====================================================
// HELPERS
// =====================================================

const getUserId = (req) => {
  return req?.user?.id || req?.user?._id || "";
};

const normalizeId = (value) => {
  return String(value || "").trim();
};

const generateApplicationId = () => {
  return (
    "APP-" +
    Date.now() +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
};

// =====================================================
// CREATE APPLICATION
// POST /api/applications
// =====================================================

const createApplication = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      name,
      email,
      mobile,
      address,
      purpose,
      additionalDetails,
      documentDetails,
      documents,
      citizenId
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required."
      });
    }

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, email and mobile are required."
      });
    }

    // -----------------------------------------------
    // CITIZEN ID
    // -----------------------------------------------

    const authenticatedCitizenId = getUserId(req);

    const finalCitizenId =
      authenticatedCitizenId ||
      normalizeId(citizenId);

    // -----------------------------------------------
    // APPLICATION ID
    // -----------------------------------------------

    let applicationId;
    let duplicate = true;

    while (duplicate) {
      applicationId = generateApplicationId();

      duplicate = await Application.exists({
        applicationId
      });
    }

    // -----------------------------------------------
    // CREATE
    // -----------------------------------------------

    const application = new Application({
      applicationId,

      serviceId: normalizeId(serviceId),

      serviceName:
        String(serviceName || "Government Service").trim(),

      citizenId: finalCitizenId,

      name: String(name).trim(),

      email: String(email)
        .trim()
        .toLowerCase(),

      mobile: String(mobile).trim(),

      address:
        String(address || "").trim(),

      purpose:
        String(purpose || "").trim(),

      additionalDetails:
        String(additionalDetails || "").trim(),

      documentDetails:
        String(documentDetails || "").trim(),

      documents:
        Array.isArray(documents)
          ? documents
          : [],

      status: "Pending",

      adminRemark: "",

      processedAt: null
    });

    const savedApplication =
      await application.save();

    console.log(
      "Application created:",
      savedApplication.applicationId
    );

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Service application submitted successfully.",
      applicationId:
        savedApplication.applicationId,
      data: savedApplication
    });

  } catch (error) {
    console.error(
      "Create Application Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while submitting application."
    });
  }
};

// =====================================================
// GET ALL APPLICATIONS
// GET /api/applications
// Officer / Admin
// =====================================================

const getAllApplications = async (req, res) => {
  try {
    const applications =
      await Application.find()
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error(
      "Get All Applications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching applications."
    });
  }
};

// =====================================================
// GET MY APPLICATIONS
// GET /api/applications/my
// Citizen
// =====================================================

const getMyApplications = async (req, res) => {
  try {
    const citizenId = getUserId(req);

    if (!citizenId) {
      return res.status(401).json({
        success: false,
        message: "Citizen authentication required."
      });
    }

    const applications =
      await Application.find({
        citizenId: String(citizenId)
      })
        .sort({ createdAt: -1 })
        .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error(
      "Get My Applications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your applications."
    });
  }
};

// =====================================================
// GET APPLICATION BY ID
// GET /api/applications/:id
// =====================================================

const getApplicationById = async (req, res) => {
  try {
    const id = normalizeId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required."
      });
    }

    let application = null;

    // -----------------------------------------------
    // First search custom applicationId
    // -----------------------------------------------

    application =
      await Application.findOne({
        applicationId: id
      }).lean();

    // -----------------------------------------------
    // Then search MongoDB _id
    // -----------------------------------------------

    if (
      !application &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      application =
        await Application.findById(id).lean();
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    return res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error(
      "Get Application Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching application."
    });
  }
};

// =====================================================
// UPDATE APPLICATION STATUS
// PUT /api/applications/:id/status
// =====================================================

const updateApplicationStatus = async (req, res) => {
  try {
    const id = normalizeId(req.params.id);

    const {
      status,
      adminRemark,
      remark
    } = req.body;

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
      "Completed"
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Application status is required."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid application status."
      });
    }

    // -----------------------------------------------
    // FIND APPLICATION
    // -----------------------------------------------

    let application =
      await Application.findOne({
        applicationId: id
      });

    if (
      !application &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      application =
        await Application.findById(id);
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    // -----------------------------------------------
    // UPDATE
    // -----------------------------------------------

    application.status = status;

    if (
      typeof adminRemark === "string"
    ) {
      application.adminRemark =
        adminRemark.trim();
    } else if (
      typeof remark === "string"
    ) {
      application.adminRemark =
        remark.trim();
    }

    // -----------------------------------------------
    // PROCESSED DATE
    // -----------------------------------------------

    if (
      ["Approved", "Rejected", "Completed"]
        .includes(status)
    ) {
      application.processedAt =
        new Date();
    } else {
      application.processedAt = null;
    }

    const updatedApplication =
      await application.save();

    console.log(
      "Application updated:",
      updatedApplication.applicationId,
      updatedApplication.status
    );

    return res.status(200).json({
      success: true,
      message:
        `Application ${status.toLowerCase()} successfully.`,
      data: updatedApplication
    });

  } catch (error) {
    console.error(
      "Update Application Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating application."
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createApplication,
  getAllApplications,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus
};