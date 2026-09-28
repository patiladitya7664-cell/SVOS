/* =========================================================
   SVOS - COMPLAINT MODEL
   ========================================================= */

const mongoose = require("mongoose");


const complaintSchema = new mongoose.Schema(

    {

        complaintId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        citizenId: {
            type: String,
            default: ""
        },

        citizenName: {
            type: String,
            required: true,
            default: "Citizen"
        },

        email: {
            type: String,
            default: ""
        },

        mobile: {
            type: String,
            default: ""
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,

            enum: [
                "Pending",
                "Under Review",
                "In Progress",
                "Resolved",
                "Rejected",
                "Cancelled",
                "Closed"
            ],

            default: "Pending"
        },

        adminRemark: {
            type: String,
            default: ""
        },

        resolvedAt: {
            type: Date,
            default: null
        }

    },

    {
        timestamps: true
    }

);


module.exports =
    mongoose.model(
        "Complaint",
        complaintSchema
    );