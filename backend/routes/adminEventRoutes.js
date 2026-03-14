const express = require("express");
const { getMyEvents } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), getMyEvents);

module.exports = router;