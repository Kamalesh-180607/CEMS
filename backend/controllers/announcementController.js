const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const baseQuery = {};

    if (req.user?.role === "student") {
      baseQuery.clearedByStudents = { $ne: req.user._id };
      const announcements = await Announcement.find(baseQuery)
        .populate("eventId", "title date time venue")
        .sort({ createdAt: -1 })
        .limit(20);

      console.log("Announcements fetched for student:", announcements.length);
      return res.status(200).json(announcements);
    }

    baseQuery.clearedByAdmins = { $ne: req.user._id };
    const announcements = await Announcement.find(baseQuery)
      .populate("eventId", "title date time venue")
      .sort({ createdAt: -1 })
      .limit(20);

    console.log("Announcements fetched for admin:", announcements.length);
    return res.status(200).json(announcements);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
  }
};

const dismissAnnouncement = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can dismiss announcements" });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndUpdate(req.params.id, {
      $addToSet: {
        dismissedBy: req.user._id,
        clearedByStudents: req.user._id,
      },
    });

    return res.status(200).json({ message: "Announcement dismissed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to dismiss announcement", error: error.message });
  }
};

const getUnreadAnnouncementsCount = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can view unread announcement count" });
    }

    const unreadCount = await Announcement.countDocuments({
      clearedByStudents: { $ne: req.user._id },
      viewedBy: { $ne: req.user._id },
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch unread announcement count", error: error.message });
  }
};

const markAnnouncementsAsViewed = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can mark announcements as viewed" });
    }

    await Announcement.updateMany(
      {
        clearedByStudents: { $ne: req.user._id },
        viewedBy: { $ne: req.user._id },
      },
      {
        $addToSet: { viewedBy: req.user._id },
      }
    );

    return res.status(200).json({ message: "Announcements marked as viewed" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark announcements as viewed", error: error.message });
  }
};

const hideAnnouncementForAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can hide announcements" });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndUpdate(req.params.id, {
      $addToSet: {
        hiddenByAdmins: req.user._id,
        clearedByAdmins: req.user._id,
      },
    });

    return res.status(200).json({ message: "Announcement hidden for admin" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to hide announcement", error: error.message });
  }
};

const clearAllAnnouncementsForStudent = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can clear announcements" });
    }

    await Announcement.updateMany({}, { $addToSet: { clearedByStudents: req.user._id } });

    return res.status(200).json({ message: "Announcements cleared for student" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear announcements", error: error.message });
  }
};

const clearAllAnnouncementsForAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can clear announcements" });
    }

    await Announcement.updateMany({}, { $addToSet: { clearedByAdmins: req.user._id } });

    return res.status(200).json({ message: "Announcements cleared for admin" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear announcements", error: error.message });
  }
};

module.exports = {
  getAnnouncements,
  dismissAnnouncement,
  getUnreadAnnouncementsCount,
  markAnnouncementsAsViewed,
  hideAnnouncementForAdmin,
  clearAllAnnouncementsForStudent,
  clearAllAnnouncementsForAdmin,
};
