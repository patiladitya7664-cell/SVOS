const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

// =========================================================
// GET ALL SERVICES
// =========================================================

router.get("/", async (req, res) => {
  try {
    const services = await Service.find({
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error(
      "Get services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load services.",
    });
  }
});

// =========================================================
// GET ALL SERVICES - ADMIN
// =========================================================

router.get("/all", async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error(
      "Get all services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load services.",
    });
  }
});

// =========================================================
// GET SERVICE BY ID
// =========================================================

router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id).trim();

    let service = await Service.findOne({
      serviceId: id,
    }).lean();

    if (
      !service &&
      require("mongoose").Types.ObjectId.isValid(id)
    ) {
      service = await Service.findById(id).lean();
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Get service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load service.",
    });
  }
});

// =========================================================
// CREATE SERVICE
// =========================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      eligibility,
      requiredDocuments,
      processingTime,
      applicationFee,
    } = req.body;

    if (
      !name ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description and category are required.",
      });
    }

    const serviceId =
      `SERVICE-${Date.now()}`;

    const service = await Service.create({
      serviceId,

      name: String(name).trim(),

      description:
        String(description).trim(),

      category:
        String(category).trim(),

      eligibility:
        String(
          eligibility || ""
        ).trim(),

      requiredDocuments:
        Array.isArray(requiredDocuments)
          ? requiredDocuments
          : [],

      processingTime:
        String(
          processingTime ||
            "7 Working Days"
        ).trim(),

      applicationFee:
        Number(applicationFee || 0),

      status: "Active",
    });

    return res.status(201).json({
      success: true,
      message:
        "Service created successfully.",
      data: service,
    });
  } catch (error) {
    console.error(
      "Create service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create service.",
    });
  }
});

// =========================================================
// UPDATE SERVICE
// =========================================================

router.put("/:id", async (req, res) => {
  try {
    const service =
      await Service.findOne({
        serviceId: req.params.id,
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    const {
      name,
      description,
      category,
      eligibility,
      requiredDocuments,
      processingTime,
      applicationFee,
      status,
    } = req.body;

    if (name !== undefined) {
      service.name =
        String(name).trim();
    }

    if (description !== undefined) {
      service.description =
        String(description).trim();
    }

    if (category !== undefined) {
      service.category =
        String(category).trim();
    }

    if (eligibility !== undefined) {
      service.eligibility =
        String(eligibility).trim();
    }

    if (
      requiredDocuments !== undefined
    ) {
      service.requiredDocuments =
        Array.isArray(requiredDocuments)
          ? requiredDocuments
          : [];
    }

    if (processingTime !== undefined) {
      service.processingTime =
        String(processingTime).trim();
    }

    if (applicationFee !== undefined) {
      service.applicationFee =
        Number(applicationFee);
    }

    if (status !== undefined) {
      if (
        !["Active", "Inactive"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service status.",
        });
      }

      service.status = status;
    }

    await service.save();

    return res.json({
      success: true,
      message:
        "Service updated successfully.",
      data: service,
    });
  } catch (error) {
    console.error(
      "Update service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update service.",
    });
  }
});

// =========================================================
// UPDATE SERVICE STATUS
// =========================================================

router.put(
  "/:id/status",
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      if (
        !["Active", "Inactive"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service status.",
        });
      }

      const service =
        await Service.findOneAndUpdate(
          {
            serviceId:
              req.params.id,
          },
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!service) {
        return res.status(404).json({
          success: false,
          message:
            "Service not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Service status updated successfully.",
        data: service,
      });
    } catch (error) {
      console.error(
        "Service status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update service status.",
      });
    }
  }
);

// =========================================================
// DELETE SERVICE
// =========================================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const service =
        await Service.findOneAndDelete({
          serviceId:
            req.params.id,
        });

      if (!service) {
        return res.status(404).json({
          success: false,
          message:
            "Service not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Service deleted successfully.",
        data: service,
      });
    } catch (error) {
      console.error(
        "Delete service error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete service.",
      });
    }
  }
);

module.exports = router;