const express = require("express");
const { chatWithAssistant } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", protect, authorize("student"), chatWithAssistant);

module.exports = router;
