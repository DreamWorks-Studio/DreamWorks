import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: function () {
      return !this.googlePhotoUrl;
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googlePhotoUrl;
    },
  },
  confirmpassword: {
    type: String,
  },
  googlePhotoUrl: {
    type: String,
  },
  avatar: {
    type: String,
    default:
      "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  verifytoken: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
