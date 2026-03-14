const express = require("express");
const { getActivitySummary, removeProfilePicture } = require("../controllers/studentController");
const { clearAllAnnouncementsForStudent } = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/activity-summary", protect, authorize("student"), getActivitySummary);
router.delete("/profile-picture", protect, authorize("student"), removeProfilePicture);
router.post("/announcements/clear-all", protect, authorize("student"), clearAllAnnouncementsForStudent);

module.exports = router;
