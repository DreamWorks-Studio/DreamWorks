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
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password should be at least 8 chars',
          },
    },
    confirmpassword: {
        type: String,
    },
    avatar: {
        type: String, // Stores URL instead of Buffer
        default: "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif",
    },
    isAdmin: {
        type: Boolean,
        default : false,
       
    },

    verifytoken:{
        type:String
    },
    // // Add the following fields for password reset functionality
    //  resetToken: {
    //     type: String,
    //  },
    //  resetTokenExpiry: {
    //     type: Date,
    //  }

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
      },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;