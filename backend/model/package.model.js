import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    packagename: {
        type: String,
        required: true,
        unique: true, // Ensures no duplicate package names
        trim: true // Removes unnecessary spaces
    },
    packageDetails: {
        type: String,
        required: true,
        trim: true
    },
    packagePrice: {
        type: Number,
        required: true,
        min: 0 // Ensures the price can't be negative
    },
    packagevalidity: {
        type: String, // Changed to `Date` for proper date handling
        required: true
    }, 
    packageType: {
        type: String,
        default: 'Others'
    },
    includedCustomizations: {
        type: Array,
        default: []
    }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;
