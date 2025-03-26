//logics

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
    const newPortfolio = new Portfolio({
      imageUrl: req.file.path,
      // publicId: req.file.filename,
      category: req.body.category,
      description: req.body.description,
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

    // Delete from Cloudinary if publicId exists
    if (portfolioItem.publicId) {
      await cloudinary.uploader.destroy(portfolioItem.publicId);
    }

    // Delete from database
    await Portfolio.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete image", error: error.message });
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