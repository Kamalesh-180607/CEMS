const Registration = require("../models/Registration");
const User = require("../models/User");

const getActivitySummary = async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user._id })
      .populate("eventId", "date")
      .sort({ registeredAt: -1 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalRegistered = registrations.length;
    const upcoming = registrations.filter((registration) => {
      const eventDate = registration.eventId?.date ? new Date(registration.eventId.date) : null;
      return eventDate && eventDate >= today;
    }).length;
    const past = registrations.filter((registration) => {
      const eventDate = registration.eventId?.date ? new Date(registration.eventId.date) : null;
      return eventDate && eventDate < today;
    }).length;

    return res.status(200).json({
      totalRegistered,
      upcoming,
      past,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch activity summary",
      error: error.message,
    });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = "";
    const updated = await user.save();

    return res.status(200).json({
      message: "Profile picture removed",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        rollNumber: updated.rollNumber,
        mobileNumber: updated.mobileNumber,
        department: updated.department,
        profileImage: updated.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove profile picture",
      error: error.message,
    });
  }
};

module.exports = {
  getActivitySummary,
  removeProfilePicture,
};
