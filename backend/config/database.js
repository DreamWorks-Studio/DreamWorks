import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', ()=> {
        console.log("MongoDB connected!");
    })

    mongoose.connection.on('error', (err) => {
        console.error("MongoDB connection error:", err);
        console.log("MongoDB not connected!");
    });

    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
}

export default connectDB;