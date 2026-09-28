const express = require("express");
const mongoose = require("mongoose");
const Scheme = require("../models/Scheme");

const router = express.Router();

// =========================================================
// GET ACTIVE SCHEMES
// =========================================================

router.get("/", async (req, res) => {
  try {
    const schemes = await Scheme.find({
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    console.error(
      "Get schemes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load schemes.",
    });
  }
});

// =========================================================
// GET ALL SCHEMES - ADMIN
// =========================================================

router.get("/all", async (req, res) => {
  try {
    const schemes = await Scheme.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (error) {
    console.error(
      "Get all schemes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load schemes.",
    });
  }
});

// =========================================================
// GET SCHEME BY ID
// =========================================================

router.get("/:id", async (req, res) => {
  try {
    const id = String(
      req.params.id
    ).trim();

    let scheme =
      await Scheme.findOne({
        schemeId: id,
      }).lean();

    if (
      !scheme &&
      mongoose.Types.ObjectId.isValid(id)
    ) {
      scheme =
        await Scheme.findById(id).lean();
    }

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message:
          "Scheme not found.",
      });
    }

    return res.json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    console.error(
      "Get scheme error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load scheme.",
    });
  }
});

// =========================================================
// CREATE SCHEME
// =========================================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eligibility,
      benefits,
      applicationUrl,
    } = req.body;

    if (
      !title ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and category are required.",
      });
    }

    const schemeId =
      `SCH-${Date.now()}`;

    const scheme =
      await Scheme.create({
        schemeId,

        title:
          String(title).trim(),

        description:
          String(
            description
          ).trim(),

        category:
          String(
            category
          ).trim(),

        eligibility:
          String(
            eligibility || ""
          ).trim(),

        benefits:
          String(
            benefits || ""
          ).trim(),

        applicationUrl:
          String(
            applicationUrl || ""
          ).trim(),

        status: "Active",
      });

    return res.status(201).json({
      success: true,
      message:
        "Scheme created successfully.",
      data: scheme,
    });
  } catch (error) {
    console.error(
      "Create scheme error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create scheme.",
    });
  }
});

// =========================================================
// UPDATE SCHEME
// =========================================================

router.put("/:id", async (req, res) => {
  try {
    const scheme =
      await Scheme.findOne({
        schemeId:
          req.params.id,
      });

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message:
          "Scheme not found.",
      });
    }

    const {
      title,
      description,
      category,
      eligibility,
      benefits,
      applicationUrl,
      status,
    } = req.body;

    if (title !== undefined) {
      scheme.title =
        String(title).trim();
    }

    if (description !== undefined) {
      scheme.description =
        String(description).trim();
    }

    if (category !== undefined) {
      scheme.category =
        String(category).trim();
    }

    if (eligibility !== undefined) {
      scheme.eligibility =
        String(eligibility).trim();
    }

    if (benefits !== undefined) {
      scheme.benefits =
        String(benefits).trim();
    }

    if (applicationUrl !== undefined) {
      scheme.applicationUrl =
        String(applicationUrl).trim();
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
            "Invalid scheme status.",
        });
      }

      scheme.status = status;
    }

    await scheme.save();

    return res.json({
      success: true,
      message:
        "Scheme updated successfully.",
      data: scheme,
    });
  } catch (error) {
    console.error(
      "Update scheme error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update scheme.",
    });
  }
});

// =========================================================
// UPDATE SCHEME STATUS
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
            "Invalid scheme status.",
        });
      }

      const scheme =
        await Scheme.findOneAndUpdate(
          {
            schemeId:
              req.params.id,
          },
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!scheme) {
        return res.status(404).json({
          success: false,
          message:
            "Scheme not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Scheme status updated successfully.",
        data: scheme,
      });
    } catch (error) {
      console.error(
        "Scheme status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update scheme status.",
      });
    }
  }
);

// =========================================================
// DELETE SCHEME
// =========================================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const scheme =
        await Scheme.findOneAndDelete({
          schemeId:
            req.params.id,
        });

      if (!scheme) {
        return res.status(404).json({
          success: false,
          message:
            "Scheme not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Scheme deleted successfully.",
        data: scheme,
      });
    } catch (error) {
      console.error(
        "Delete scheme error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete scheme.",
      });
    }
  }
);

module.exports = router;