import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, enum: ['morning session', 'afternoon session', 'evening session'] },
    location: { type: String, required: true },
    addson: { type: String },
    status: { type: String, default: "Not Completed" }, // Adding status field
    previousStatus: { type: String },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    packageType: { type: String, required: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;