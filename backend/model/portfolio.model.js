import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    //publicId: { type: String, required: true }, // Cloudinary Image ID for deletion
    category: { type: String, required: true },
    description: { type: String },
    ratings: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
      rating: { type: Number, required: true, min: 1, max: 5}
    }]
  },
  { timestamps: true }
);

portfolioSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  
  const sum = this.ratings.reduce((total, current) => total + current.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;
