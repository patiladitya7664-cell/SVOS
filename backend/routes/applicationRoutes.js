// =====================================================
// SVOS - APPLICATION ROUTES
// =====================================================

const express = require("express");

const router = express.Router();

const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus
} = require("../controllers/applicationController");


// =====================================================
// CREATE APPLICATION
// POST /api/applications
// =====================================================

router.post("/", createApplication);


// =====================================================
// GET ALL APPLICATIONS
// GET /api/applications
// =====================================================

router.get("/", getAllApplications);


// =====================================================
// GET APPLICATION BY ID
// GET /api/applications/:id
// =====================================================

router.get("/:id", getApplicationById);


// =====================================================
// UPDATE APPLICATION STATUS
// PUT /api/applications/:id/status
// =====================================================

router.put("/:id/status", updateApplicationStatus);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
