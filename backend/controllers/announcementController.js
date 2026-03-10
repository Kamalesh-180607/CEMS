const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("eventId", "title date time venue")
      .sort({ createdAt: -1 });

    return res.status(200).json(announcements);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch announcements", error: error.message });
  }
};

module.exports = { getAnnouncements };
