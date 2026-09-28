/* =========================================================
   SVOS - COMPLAINT CONTROLLER
   Complaint Create + Track
   MongoDB Connected
   ========================================================= */

const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");


// =========================================================
// CREATE COMPLAINT
// POST /api/complaints
// =========================================================

const createComplaint = async (req, res) => {

    try {

        const {
            citizenId,
            citizenName,
            email,
            mobile,
            category,
            subject,
            location,
            description
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (!category || !category.trim()) {

            return res.status(400).json({
                success: false,
                message: "Complaint category is required."
            });

        }


        if (!subject || !subject.trim()) {

            return res.status(400).json({
                success: false,
                message: "Complaint subject is required."
            });

        }


        if (!location || !location.trim()) {

            return res.status(400).json({
                success: false,
                message: "Complaint location is required."
            });

        }


        if (!description || !description.trim()) {

            return res.status(400).json({
                success: false,
                message: "Complaint description is required."
            });

        }


        if (description.trim().length < 10) {

            return res.status(400).json({
                success: false,
                message:
                    "Complaint description should contain at least 10 characters."
            });

        }


        // =====================================================
        // GENERATE UNIQUE COMPLAINT ID
        // =====================================================

        const complaintId =
            `CMP-${Date.now()}`;


        // =====================================================
        // CREATE MONGODB DOCUMENT
        // =====================================================

        const complaint =
            await Complaint.create({

                complaintId,

                citizenId:
                    citizenId || "",

                citizenName:
                    citizenName || "Citizen",

                email:
                    email || "",

                mobile:
                    mobile || "",

                category:
                    category.trim(),

                subject:
                    subject.trim(),

                location:
                    location.trim(),

                description:
                    description.trim(),

                status:
                    "Pending"

            });


        // =====================================================
        // SUCCESS RESPONSE
        // =====================================================

        return res.status(201).json({

            success: true,

            message:
                "Complaint submitted successfully.",

            data: complaint

        });

    } catch (error) {

        console.error(
            "❌ Create Complaint Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to submit complaint.",

            error:
                error.message

        });

    }

};


// =========================================================
// GET COMPLAINT BY ID
// GET /api/complaints/:id
// =========================================================

const getComplaintById = async (req, res) => {

    try {

        const id =
            String(req.params.id || "").trim();


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Complaint ID is required."

            });

        }


        console.log(
            "🔎 Tracking Complaint ID:",
            id
        );


        // =====================================================
        // SEARCH BY CUSTOM COMPLAINT ID
        // Example: CMP-1758631234567
        // =====================================================

        let complaint =
            await Complaint.findOne({
                complaintId: id
            });


        // =====================================================
        // FALLBACK TO MONGODB _id
        // =====================================================

        if (!complaint) {

            if (
                mongoose.Types.ObjectId.isValid(id)
            ) {

                complaint =
                    await Complaint.findById(id);

            }

        }


        // =====================================================
        // COMPLAINT NOT FOUND
        // =====================================================

        if (!complaint) {

            console.log(
                "❌ Complaint not found:",
                id
            );


            return res.status(404).json({

                success: false,

                message:
                    "Complaint not found."

            });

        }


        // =====================================================
        // SUCCESS
        // =====================================================

        console.log(
            "✅ Complaint found:",
            complaint.complaintId
        );


        return res.status(200).json({

            success: true,

            message:
                "Complaint found successfully.",

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
                "Unable to fetch complaint.",

            error:
                error.message

        });

    }

};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    createComplaint,
    getComplaintById

};
