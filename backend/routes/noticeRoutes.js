const express = require("express");
const router = express.Router();

const Notice = require("../models/Notice");

// =========================================================
// GET ACTIVE NOTICES
// =========================================================

router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find({
      status: "Active",
    }).sort({
      publishedDate: -1,
    });

    res.json({
      success: true,
      data: notices,
    });
  } catch (error) {
    console.error(
      "Get notices error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
});

// =========================================================
// GET ALL NOTICES - ADMIN
// =========================================================

router.get("/all", async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      data: notices,
    });
  } catch (error) {
    console.error(
      "Get all notices error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
});

// =========================================================
// GET SINGLE NOTICE
// =========================================================

router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findOne({
      $or: [
        { noticeId: req.params.id },
        ...(require("mongoose").Types.ObjectId.isValid(
          req.params.id
        )
          ? [{ _id: req.params.id }]
          : []),
      ],
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      data: notice,
    });
  } catch (error) {
    console.error(
      "Get notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch notice",
    });
  }
});

// =========================================================
// CREATE NOTICE
// =========================================================

router.post("/", async (req, res) => {
  try {
    const {
      noticeId,
      title,
      description,
      category,
      priority,
      targetAudience,
      publishedDate,
      expiryDate,
      status,
    } = req.body;

    if (
      !noticeId ||
      !title ||
      !description ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "noticeId, title, description and category are required",
      });
    }

    const existing =
      await Notice.findOne({
        noticeId,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Notice ID already exists",
      });
    }

    const notice =
      await Notice.create({
        noticeId,
        title,
        description,
        category,
        priority,
        targetAudience,
        publishedDate,
        expiryDate,
        status,
      });

    res.status(201).json({
      success: true,
      message: "Notice created successfully",
      data: notice,
    });
  } catch (error) {
    console.error(
      "Create notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
});

// =========================================================
// UPDATE NOTICE
// =========================================================

router.put("/:id", async (req, res) => {
  try {
    const notice =
      await Notice.findOneAndUpdate(
        {
          $or: [
            { noticeId: req.params.id },
            ...(require("mongoose").Types.ObjectId.isValid(
              req.params.id
            )
              ? [{ _id: req.params.id }]
              : []),
          ],
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      message: "Notice updated successfully",
      data: notice,
    });
  } catch (error) {
    console.error(
      "Update notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update notice",
    });
  }
});

// =========================================================
// STATUS
// =========================================================

router.put("/:id/status", async (req, res) => {
  try {
    const notice =
      await Notice.findOne({
        $or: [
          { noticeId: req.params.id },
          ...(require("mongoose").Types.ObjectId.isValid(
            req.params.id
          )
            ? [{ _id: req.params.id }]
            : []),
        ],
      });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    notice.status =
      notice.status === "Active"
        ? "Inactive"
        : "Active";

    await notice.save();

    res.json({
      success: true,
      message: "Notice status updated",
      data: notice,
    });
  } catch (error) {
    console.error(
      "Notice status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update notice status",
    });
  }
});

// =========================================================
// DELETE
// =========================================================

router.delete("/:id", async (req, res) => {
  try {
    const notice =
      await Notice.findOneAndDelete({
        $or: [
          { noticeId: req.params.id },
          ...(require("mongoose").Types.ObjectId.isValid(
            req.params.id
          )
            ? [{ _id: req.params.id }]
            : []),
        ],
      });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    res.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notice error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete notice",
    });
  }
});

module.exports = router;