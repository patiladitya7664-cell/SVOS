// =====================================================
// SVOS - APPLICATION MODEL
// Citizen Service Application
// =====================================================

const mongoose = require("mongoose");


// =====================================================
// APPLICATION SCHEMA
// =====================================================

const applicationSchema =
  new mongoose.Schema(
    {

      // =================================================
      // APPLICATION ID
      // =================================================

      applicationId: {
        type: String,
        required: true,
        unique: true,
        index: true
      },


      // =================================================
      // SERVICE INFORMATION
      // =================================================

      serviceId: {
        type: String,
        required: true,
        index: true
      },

      serviceName: {
        type: String,
        required: true
      },


      // =================================================
      // CITIZEN INFORMATION
      // =================================================

      citizenId: {
        type: String,
        default: ""
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


      // =================================================
      // ADDRESS
      // =================================================

      address: {
        type: String,
        default: "",
        trim: true
      },


      // =================================================
      // APPLICATION DETAILS
      // =================================================

      purpose: {
        type: String,
        default: "",
        trim: true
      },

      additionalDetails: {
        type: String,
        default: "",
        trim: true
      },

      documentDetails: {
        type: String,
        default: "",
        trim: true
      },


      // =================================================
      // DOCUMENTS
      // =================================================

      documents: {
        type: [String],
        default: []
      },


      // =================================================
      // APPLICATION STATUS
      // =================================================

      status: {
        type: String,

        enum: [
          "Pending",
          "Under Review",
          "Approved",
          "Rejected",
          "Completed"
        ],

        default: "Pending"
      },


      // =================================================
      // ADMIN REMARK
      // =================================================

      adminRemark: {
        type: String,
        default: ""
      },


      // =================================================
      // PROCESSING DATE
      // =================================================

      processedAt: {
        type: Date,
        default: null
      }

    },

    {
      timestamps: true
    }
  );


// =====================================================
// EXPORT MODEL
// =====================================================

module.exports =
  mongoose.model(
    "Application",
    applicationSchema
  );
