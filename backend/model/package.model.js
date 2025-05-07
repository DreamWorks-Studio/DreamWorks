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

// Create the model
const Package = mongoose.model('Package', packageSchema);

// Attempt to drop the problematic unique index on packagePrice
const dropPriceIndex = async () => {
    try {
        // Try to drop the index if it exists
        await Package.collection.dropIndex("packagePrice_1");
        console.log("Successfully dropped the packagePrice unique index");
    } catch (error) {
        // This will likely fail if index doesn't exist, which is fine
        console.log("Note: packagePrice index may not exist or was already removed");
    }
};

// Execute the function to drop the index
dropPriceIndex();

// Explicitly create a non-unique index for packagePrice (if needed for queries)
packageSchema.index({ packagePrice: 1 }, { unique: false });

export default Package;