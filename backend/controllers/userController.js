const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobileNumber, department } = req.body;
    console.log("Profile update body:", req.body);
    console.log("Profile update file:", req.file);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;

    if (user.role === "student") {
      user.mobileNumber = mobileNumber ?? user.mobileNumber;
      user.department = department ?? user.department;
    } else {
      user.department = department ?? user.department;
      user.mobileNumber = mobileNumber ?? user.mobileNumber;
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updated = await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
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
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const removeAdminProfilePicture = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.profileImage = "";
    const updated = await admin.save();

    return res.status(200).json({
      message: "Profile picture removed successfully",
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
      message: "Failed to remove admin profile picture",
      error: error.message,
    });
  }
};

module.exports = { getProfile, updateProfile, removeAdminProfilePicture };
