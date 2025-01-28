import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connection', ()=> {
        console.log("MongoDB connected!");
    })

    await mongoose.connect(`${process.env.MONGODB_URI}/DreamWorks`)
}

export default connectDB;