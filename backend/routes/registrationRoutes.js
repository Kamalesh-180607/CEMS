const express = require("express");
const {
  createOrder,
  registerForEvent,
  getRegistrationsByEvent,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("student"), registerForEvent);
router.post("/order", protect, authorize("student"), createOrder);
router.get("/event/:eventId", protect, authorize("admin"), getRegistrationsByEvent);

module.exports = router;
