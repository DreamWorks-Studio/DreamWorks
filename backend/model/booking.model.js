import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, enum: ['morning session', 'afternoon session', 'evening session'] },
    location: { type: String, required: true },
    addson: { type: String },
    status: { type: String, default: "Not Completed" }, // Adding status field
    previousStatus: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;