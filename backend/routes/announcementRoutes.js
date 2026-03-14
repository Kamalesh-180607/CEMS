const express = require("express");
const {
	getAnnouncements,
	dismissAnnouncement,
	getUnreadAnnouncementsCount,
	markAnnouncementsAsViewed,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("student", "admin"), getAnnouncements);
router.get("/unread-count", protect, authorize("student"), getUnreadAnnouncementsCount);
router.post("/mark-viewed", protect, authorize("student"), markAnnouncementsAsViewed);
router.post("/:id/dismiss", protect, authorize("student"), dismissAnnouncement);

module.exports = router;
