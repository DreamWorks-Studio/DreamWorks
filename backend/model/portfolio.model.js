import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    //publicId: { type: String, required: true }, // Cloudinary Image ID for deletion
    category: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
