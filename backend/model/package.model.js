import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    packagename: {
        type: String,
        required:true,
        unique: true,

    },

    packageDetails: {
        type: String,
        required:true,
        unique: true,

    },

    packagePrice: {
        type: Number,
        required:true,
        unique: true,
    },
    packagevalidity: {
        type: Date,
        required:true,
        unique: true,

    },


}, {timestamps: true});

const Package = mongoose.model('Package', packageSchema);
export default Package;