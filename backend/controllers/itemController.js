// Temporary data
// Database baad mein connect karenge
let items = [
  {
    id: 1,
    name: "Sample Item",
    status: "Active"
  }
];

// GET all items
const getItems = (req, res) => {
  res.json({
    success: true,
    count: items.length,
    data: items
  });
};

// GET single item
const getItemById = (req, res) => {
  const id = Number(req.params.id);

  const item = items.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found"
    });
  }

  res.json({
    success: true,
    data: item
  });
};

// CREATE item
const createItem = (req, res) => {
  const { name, status } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required"
    });
  }

  const newItem = {
    id: items.length + 1,
    name,
    status: status || "Active"
  };

  items.push(newItem);

  res.status(201).json({
    success: true,
    message: "Item created successfully",
    data: newItem
  });
};

// UPDATE item
const updateItem = (req, res) => {
  const id = Number(req.params.id);
  const { name, status } = req.body;

  const item = items.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found"
    });
  }

  if (name !== undefined) item.name = name;
  if (status !== undefined) item.status = status;

  res.json({
    success: true,
    message: "Item updated successfully",
    data: item
  });
};

// DELETE item
const deleteItem = (req, res) => {
  const id = Number(req.params.id);

  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found"
    });
  }

  const deletedItem = items.splice(index, 1);

  res.json({
    success: true,
    message: "Item deleted successfully",
    data: deletedItem[0]
  });
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};