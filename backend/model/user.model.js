import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String, // Should be hashed before storing
        required: true,
    },
    avatar: {
        type: String, // Stores URL instead of Buffer
        default: "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif",
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
