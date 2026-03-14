const express = require("express");
const { createPaymentOrder } = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, authorize("student"), createPaymentOrder);

module.exports = router;
