const express = require("express");

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} = require("../controllers/itemController");

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;