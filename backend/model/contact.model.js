import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  }
  
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
