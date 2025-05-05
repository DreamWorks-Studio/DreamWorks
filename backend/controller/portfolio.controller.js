
//logics
import mongoose from "mongoose";
import Portfolio from "../model/portfolio.model.js";


export const test = (req,res) => {
    res.json({
 
        message : 'API  route is Working !!',
    });
};

//Upload image

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    
    const newPortfolio = new Portfolio({
      imageUrl: imageUrl,
      category: req.body.category,
      description: req.body.description,
      location: req.body.location || '',
      dateCaptured: req.body.dateCaptured || null,
      photographerName: req.body.photographerName || '',
    });
    
    await newPortfolio.save();
    res.status(201).json({ message: 'Image uploaded successfully', data: newPortfolio });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Fetch Images
export const getPortfolioImages = async (req, res) => {
  try {
    // Get query parameters for optional filtering
    const { category } = req.query;
    
    // Create filter object
    const filter = {};
    if (category) {
      filter.category = category;
    }
    
    // Find portfolio items with optional filtering
    const images = await Portfolio.find(filter)
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching portfolio images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch images', 
      error: error.message 
    });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const updatedImage = await Portfolio.findByIdAndUpdate(
      id,
      { category, description },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.status(200).json({ message: "Image updated successfully", data: updatedImage });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Failed to update image", error: error.message });
  }
};



export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolioItem = await Portfolio.findById(id);

    if (!portfolioItem) {
      return res.status(404).json({ message: "Image not found" });
    }

    try {
      if (portfolioItem.imageUrl) {
        // Extract the public ID from the URL pattern
        const urlParts = portfolioItem.imageUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        
        // For folder structure in Cloudinary, you need to include the folder
        const folder = urlParts[urlParts.length - 2];
        const fullPublicId = `${folder}/${publicId}`;
        
        console.log("Attempting to delete from Cloudinary:", fullPublicId);
        
        await cloudinary.uploader.destroy(fullPublicId);
      }
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }
  

    // Delete from database
    await Portfolio.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete image", error: error.message });
  }
};


export const rateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { rating, userId } = req.body;
    
    // Validate required fields
    if (!rating || !userId) {
      return res.status(400).json({ 
        message: 'Rating and user ID are required' 
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Find the portfolio item
    const portfolioItem = await Portfolio.findById(imageId);
    
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check if the user has already rated this image
    const existingRatingIndex = portfolioItem.ratings.findIndex(
      r => r.userId.equals(userObjectId)
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      portfolioItem.ratings[existingRatingIndex].rating = Number(rating);
    } else {
      // Add new rating
      portfolioItem.ratings.push({
        userId: userObjectId,
        rating: Number(rating)
      });
    }
    
    // Save the updated portfolio item
    await portfolioItem.save();
    
    res.status(200).json({
      message: 'Rating updated successfully',
      rating: Number(rating)
    });
  } catch (error) {
    console.error('Error rating image:', error);
    res.status(500).json({ 
      message: 'Failed to rate image', 
      error: error.message 
    });
  }
};
// Get user's rating for an image
export const getUserRating = async (req, res) => {
  try {
    const { imageId, userId } = req.params;
    
    const portfolioItem = await Portfolio.findById(imageId);
    
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Find the user's rating
    const userRating = portfolioItem.ratings.find(r => r.userId.equals(userObjectId));
    
    res.status(200).json({
      rating: userRating ? userRating.rating : 0
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ 
      message: 'Failed to fetch rating', 
      error: error.message 
    });
  }
};

export const getTopRatedImages = async (req, res) => {
  try {
    // Find all portfolio items with ratings
    const portfolioItems = await Portfolio.find({ 'ratings.0': { $exists: true } });
    
    // Calculate average rating for each item
    const itemsWithRatings = portfolioItems.map(item => {
      const ratings = item.ratings || [];
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const avgRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      
      return {
        ...item.toObject({ virtuals: true }),
        averageRating: avgRating.toFixed(1)
      };
    });
    
    // Sort by average rating (highest first)
    const sortedItems = itemsWithRatings.sort((a, b) => b.averageRating - a.averageRating);
    
    // Limit to top 4 items
    const topItems = sortedItems.slice(0, 4);
    
    res.status(200).json(topItems);
  } catch (error) {
    console.error('Error fetching top-rated images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch top-rated images', 
      error: error.message 
    });
  }
};

/*export const uploadImage = async (req, res) => {
    try {
      const { category, description } = req.body;
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
      }
  
      const newImage = new Image({
        image: `/uploads/${req.file.filename}`,
        category,
        description
      });
  
      await newImage.save();
      res.json({ success: true, message: "Image uploaded successfully!" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  };

  // Get All Images
export const getAllImages = async (req, res) => {
    try {
      const images = await Image.find();
      res.json(images);
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch images" });
    }
  };

 // Update Image
export const updateImage = async (req, res) => {
  try {
      const { id } = req.params;
      const { category, description, photos } = req.body;

      const updatedImage = await Portfolio.findByIdAndUpdate(id, { category, description, photos }, { new: true });
      if (!updatedImage) {
          return res.status(404).json({ success: false, message: "Image not found" });
      }

      res.json({ success: true, message: "Image updated successfully!", updatedImage });
  } catch (error) {
      res.status(500).json({ success: false, message: "Update failed" });
  }
};

// Delete Image
export const deleteImage = async (req, res) => {
  try {
      const { id } = req.params;

      const deletedImage = await Portfolio.findByIdAndDelete(id);
      if (!deletedImage) {
          return res.status(404).json({ success: false, message: "Image not found" });
      }

      res.json({ success: true, message: "Image deleted successfully!" });
  } catch (error) {
      res.status(500).json({ success: false, message: "Deletion failed" });
  }
};*/

