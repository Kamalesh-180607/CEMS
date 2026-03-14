const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventRecommendations,
} = require("../controllers/eventController");
const { protect, optionalAuth, authorize, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/create", protect, adminOnly, upload.single("bannerImage"), createEvent);
router.post("/", protect, adminOnly, upload.single("bannerImage"), createEvent);
router.get("/my/list", protect, authorize("admin"), getMyEvents);
router.get("/recommendations", protect, authorize("student"), getEventRecommendations);
router.get("/", optionalAuth, getEvents);
router.get("/:id", protect, getEventById);
router.put("/update/:id", protect, adminOnly, upload.single("bannerImage"), updateEvent);
router.put("/:id", protect, adminOnly, upload.single("bannerImage"), updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);
router.delete("/delete/:id", protect, adminOnly, deleteEvent);

module.exports = router;
