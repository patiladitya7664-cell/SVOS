/* =========================================================
   SVOS - COMPLAINT ROUTES
   ========================================================= */

const express = require("express");

const router = express.Router();

const {
    createComplaint,
    getComplaintById
} = require("../controllers/complaintController");


/* =========================================================
   CREATE COMPLAINT
   POST /api/complaints
   ========================================================= */

router.post(
    "/",
    createComplaint
);


/* =========================================================
   GET / TRACK COMPLAINT
   GET /api/complaints/:id
   ========================================================= */

router.get(
    "/:id",
    getComplaintById
);


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;