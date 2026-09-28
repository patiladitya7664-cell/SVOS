// =========================================================
// SVOS - CITIZEN MODEL
// MongoDB / Mongoose
// =========================================================

const mongoose = require("mongoose");


// =========================================================
// CITIZEN SCHEMA
// =========================================================

const citizenSchema = new mongoose.Schema(
    {
        citizenId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        village: {
            type: String,
            default: "",
            trim: true
        },

        taluka: {
            type: String,
            default: "",
            trim: true
        },

        district: {
            type: String,
            default: "",
            trim: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Active",
                "Blocked"
            ],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);


// =========================================================
// EXPORT MODEL
// =========================================================

module.exports =
    mongoose.model(
        "Citizen",
        citizenSchema
    );