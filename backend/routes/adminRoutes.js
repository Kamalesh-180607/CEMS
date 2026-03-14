const express = require("express");
const { removeAdminProfilePicture } = require("../controllers/userController");
const { hideAnnouncementForAdmin, clearAllAnnouncementsForAdmin } = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.delete("/profile-picture", protect, authorize("admin"), removeAdminProfilePicture);
router.post("/announcements/hide/:id", protect, authorize("admin"), hideAnnouncementForAdmin);
router.post("/announcements/clear-all", protect, authorize("admin"), clearAllAnnouncementsForAdmin);

module.exports = router;
