const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ["Technical", "Non Technical", "Workshop"],
      required: true,
    },
    hostingClub: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    contactPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    instagramLink: {
      type: String,
      trim: true,
      default: "",
    },
    whatsappGroupLink: {
      type: String,
      trim: true,
      default: "",
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    eventPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
