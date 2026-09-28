// =========================================================
// SVOS - SERVER
// Express + MongoDB + API Routes
// =========================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


// =========================================================
// ROUTES
// =========================================================

const itemRoutes = require("./routes/itemRoutes");
const citizenRoutes = require("./routes/citizenRoutes");
const adminRoutes = require("./routes/adminRoutes");
const officerRoutes = require("./routes/officerRoutes");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const serviceRoutes = require("./routes/serviceRoutes");
const schemeRoutes = require("./routes/schemeRoutes");
const noticeRoutes = require("./routes/noticeRoutes");


// =========================================================
// APP
// =========================================================

const app = express();


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());

app.use(express.json());


// =========================================================
// MONGODB CONNECTION
// =========================================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.error(
            "MongoDB Connection Error:",
            error.message
        );
    });


// =========================================================
// ROOT ROUTE
// =========================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "SVOS Backend is running successfully"
    });
});


// =========================================================
// API TEST ROUTE
// =========================================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "SVOS API connected successfully"
    });
});


// =========================================================
// AUTH ROUTES
// =========================================================

app.use(
    "/api/auth",
    authRoutes
);


// =========================================================
// ITEM ROUTES
// =========================================================

app.use(
    "/api/items",
    itemRoutes
);


// =========================================================
// CITIZEN ROUTES
// =========================================================

app.use(
    "/api/citizen",
    citizenRoutes
);


// =========================================================
// ADMIN ROUTES
// =========================================================

app.use(
    "/api/admin",
    adminRoutes
);


// =========================================================
// OFFICER ROUTES
// =========================================================

app.use(
    "/api/officer",
    officerRoutes
);


// =========================================================
// COMPLAINT ROUTES
// =========================================================

app.use(
    "/api/complaints",
    complaintRoutes
);


// =========================================================
// APPLICATION ROUTES
// =========================================================

app.use(
    "/api/applications",
    applicationRoutes
);


// =========================================================
// SERVICE ROUTES
// =========================================================

app.use(
    "/api/services",
    serviceRoutes
);


// =========================================================
// SCHEME ROUTES
// =========================================================

app.use(
    "/api/schemes",
    schemeRoutes
);


// =========================================================
// NOTICE ROUTES
// =========================================================

app.use(
    "/api/notices",
    noticeRoutes
);


// =========================================================
// 404 HANDLER
// =========================================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
        path: req.originalUrl
    });
});


// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================

app.use((error, req, res, next) => {
    console.error(
        "SVOS Server Error:",
        error
    );

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
});


// =========================================================
// SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `SVOS Backend running on http://localhost:${PORT}`
    );
});