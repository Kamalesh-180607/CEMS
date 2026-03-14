const express = require("express");
const { removeAdminProfilePicture } = require("../controllers/userController");
const { hideAnnouncementForAdmin, clearAllAnnouncementsForAdmin } = require("../controllers/announcementController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.delete("/profile-picture", protect, adminOnly, removeAdminProfilePicture);
router.post("/announcements/hide/:id", protect, adminOnly, hideAnnouncementForAdmin);
router.post("/announcements/clear-all", protect, adminOnly, clearAllAnnouncementsForAdmin);

module.exports = router;
