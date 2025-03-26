import mongoose from 'mongoose';
import Package from '../model/package.model.js';

export const test = (req,res)=> {
    res.json({message: 'API is working!'});
};

export const promo = async (req, res) => {
    try {
        const { packagename, packageDetails, packagePrice, packagevalidity } = req.body;

        if (!packagename || !packageDetails || !packagePrice || !packagevalidity) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newPackage = new Package({
            packagename,
            packageDetails,
            packagePrice,
            packagevalidity,
        });

        await newPackage.save();
        res.status(201).json({ message: "Adding package is successful" });

    } catch (error) {
        console.error("Error adding package:", error.message);
        res.status(500).json({ error: "Internal Server Error. Please try again." });
    }
};


// Controller to get all packages
export const getPackages = async (req, res) => {
    try {
        // Detailed logging
        console.log('Attempting to fetch packages...');

        // Validate database connection
        if (!Package.db) {
            console.error('MongoDB connection is not established');
            return res.status(500).json({ 
                message: 'Database connection error',
                details: 'Unable to connect to the database'
            });
        }

        // Fetch all packages from the database with error handling
        let packages;
        try {
            packages = await Package.find();
        } catch (findError) {
            console.error('Error during Package.find():', findError);
            return res.status(500).json({ 
                message: 'Error querying packages',
                details: findError.message,
                stack: findError.stack
            });
        }

        // Log found packages
        console.log('Packages found:', packages);

        // Check if packages array is empty
        if (!packages || packages.length === 0) {
            console.warn('No packages found in the database');
            return res.status(404).json({ 
                message: 'No packages found', 
                packages: [] 
            });
        }

        // Send successful response
        res.status(200).json(packages);
    } catch (error) {
        // Catch-all error handling
        console.error('Unexpected error in getPackages:', error);
        res.status(500).json({ 
            message: 'Unexpected server error', 
            details: error.message,
            stack: error.stack
        });
    }
};

export const updatePackage = async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        packagename, 
        packageDetails, 
        packagePrice, 
        packagevalidity 
      } = req.body;
  
      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }
  
      // Check if package exists
      const existingPackage = await Package.findById(id);
      if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      // Validate input
      if (!packagename || !packageDetails || packagePrice === undefined || !packagevalidity) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check for duplicate package name (excluding current package)
      const duplicatePackage = await Package.findOne({ 
        packagename, 
        _id: { $ne: id } 
      });
      if (duplicatePackage) {
        return res.status(400).json({ message: 'Package name must be unique' });
      }
  
      // Update package
      const updatedPackage = await Package.findByIdAndUpdate(
        id, 
        {
          packagename,
          packageDetails,
          packagePrice,
          packagevalidity
        }, 
        { 
          new: true,  // Return the updated document
          runValidators: true  // Run schema validations
        }
      );
  
      res.status(200).json({
        message: 'Package updated successfully',
        package: updatedPackage
      });
  
    } catch (error) {
      console.error('Update Package Error:', error);
      res.status(500).json({ 
        message: 'Server error during package update', 
        error: error.message 
      });
    }
  };
  
  // Delete Package Controller
  export const deletePackage = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }
  
      // Check if package exists
      const existingPackage = await Package.findById(id);
      if (!existingPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      // Delete package
      await Package.findByIdAndDelete(id);
  
      res.status(200).json({ 
        message: 'Package deleted successfully',
        packageId: id
      });
  
    } catch (error) {
      console.error('Delete Package Error:', error);
      res.status(500).json({ 
        message: 'Server error during package deletion', 
        error: error.message 
      });
    }
  };

  export const getPackage = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid package ID' });
      }
  
      // Find the package
      const packageItem = await Package.findById(id);
  
      if (!packageItem) {
        return res.status(404).json({ message: 'Package not found' });
      }
  
      res.status(200).json(packageItem);
    } catch (error) {
      console.error('Get Package Error:', error);
      res.status(500).json({ 
        message: 'Server error while fetching package', 
        error: error.message 
      });
    }
  };

export const updateUser = async(req,res,next)=> {

        
}