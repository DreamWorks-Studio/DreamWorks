import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Image, Upload, ArrowRight, LayoutGrid, ChevronRight, User, MapPin, Calendar, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import UpdatePortfolio from "../pages/UpdatePortfolio"; // Import UpdatePortfolio

const AdminPortfolio = ({ activePage }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateCaptured, setDateCaptured] = useState("");
  const [photographerName, setPhotographerName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [uploadError, setUploadError] = useState({ show: false, message: '' });
  const [deleteSuccess, setDeleteSuccess] = useState({ show: false, message: '' });
  const [updateSuccess, setUpdateSuccess] = useState({ show: false, imageCategory: '' });
  const [errors, setErrors] = useState({});
  const [highestRatedImages, setHighestRatedImages] = useState([]);
  const [loadingTopImages, setLoadingTopImages] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Add view mode state
  const [viewMode, setViewMode] = useState("upload"); // "upload" or "manage"
  const [isTransitioning, setIsTransitioning] = useState(false);

  const categories = ["Birthday", "Graduation", "Preshoots", "Wedding", "Model Shoots", "Events"];
  const navigate = useNavigate();

  // Fetch highest rated images
  useEffect(() => {
    const fetchTopRatedImages = async () => {
      try {
        setLoadingTopImages(true);
        const response = await fetch('http://localhost:5003/api/portfolio/top-rated');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setHighestRatedImages(data);
      } catch (error) {
        console.error("Failed to fetch top-rated images:", error);
      } finally {
        setLoadingTopImages(false);
      }
    };

    fetchTopRatedImages();
  }, []);

  // Handle navigation without animation
  const handleNavigate = (path, callback = null) => {
    // If there's an additional callback (like setActivePage), execute it
    if (callback) {
      callback();
    }

    // Navigate directly without animation
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle between upload and manage views with animation
  const toggleViewMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode(viewMode === "upload" ? "manage" : "upload");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  // Animation variants for card elements
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0, 0.71, 0.2, 1.01]
      }
    })
  };

  const confirmDelete = (id) => {
    setImageToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!imageToDelete) return;
    try {
      const response = await fetch(`http://localhost:5003/api/portfolio/delete/${imageToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete image");

      // Update any state that needs refreshing after deletion
      setHighestRatedImages(highestRatedImages.filter(img => img._id !== imageToDelete));
      setDeleteModalOpen(false);
      setImageToDelete(null);

      // Increment refreshTrigger to trigger a refresh in UpdatePortfolio
      setRefreshTrigger(prev => prev + 1);

      // Use custom popup instead of toast
      setDeleteSuccess({
        show: true,
        message: "Image deleted successfully!"
      });

      // Auto close after 2.5 seconds
      setTimeout(() => {
        setDeleteSuccess({ show: false, message: '' });
      }, 2500);
    } catch (error) {
      console.error("Delete error:", error);
      setUploadError({
        show: true,
        message: "Failed to delete image. Please try again."
      });

      setTimeout(() => {
        setUploadError({ show: false, message: '' });
      }, 2500);
    }
  };

  // Form validation logic
  const validateFields = () => {
    let errors = {};
    if (!imageFile) errors.imageFile = "Image is required.";
    else if (!imageFile.type.startsWith("image/")) errors.imageFile = "Only image files are allowed.";
    else if (imageFile.size > 5 * 1024 * 1024) errors.imageFile = "File size must be less than 5MB.";

    if (!selectedCategory) errors.selectedCategory = "Category is required.";
    if (!description.trim()) errors.description = "Description is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) setImageFile(file);
  };

  const handleUpload = async () => {
    if (!validateFields()) return;

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("category", selectedCategory);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("dateCaptured", dateCaptured);
    formData.append("photographerName", photographerName);

    console.log("Form data being sent:");
    console.log("Image file:", imageFile);
    console.log("Category:", selectedCategory);
    console.log("Description:", description);
    console.log("Photographer name:", photographerName);
    console.log("Location:", location);
    console.log("Date captured:", dateCaptured);

    try {
      console.log("Sending upload request...");
      const response = await fetch("http://localhost:5003/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        // More detailed error logging
        try {
          const errorData = await response.json();
          console.error("Server error response:", errorData);
        } catch (e) {
          const errorText = await response.text();
          console.error("Server error text:", errorText);
        }

        // Show error popup
        setPopupMessage("Failed to upload image. Please try again.");
        setPopupType("error");
        setShowPopup(true);
        return;
      }

      const data = await response.json();
      console.log("Upload Response:", data);

      // Show success popup
      setPopupMessage(`Image successfully added to the ${selectedCategory} gallery.`);
      setPopupType("success");
      setShowPopup(true);

      // Reset form
      setImageFile(null);
      setSelectedCategory("");
      setDescription("");
      setLocation("");
      setDateCaptured("");
      setPhotographerName("");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Upload error:", error);

      // Show error popup
      setPopupMessage("An error occurred during upload. Please try again.");
      setPopupType("error");
      setShowPopup(true);
    }
  };

  const datePickerCustomStyles = `
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 1rem;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transform: scale(0.95);
            transform-origin: top center;
            margin-top: 4px;
        }
        .react-datepicker__header {
            background: linear-gradient(to right, #000000, #333333);
            border-bottom: none;
            padding: 1rem 0 0.75rem;
            position: relative;
        }
        .react-datepicker__header:after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, #d97706, #f59e0b, #d97706);
        }
        .react-datepicker__current-month {
            color: white !important;
            font-weight: 600;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
        }
        .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.85) !important;
            font-weight: 500;
            width: 2rem;
            margin: 0.2rem;
        }
        .react-datepicker__day {
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            margin: 0.2rem;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        .react-datepicker__day--selected {
            background: linear-gradient(135deg, #d97706, #f59e0b) !important;
            font-weight: 600;
            color: white;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
        .react-datepicker__day:hover {
            background-color: rgba(217, 119, 6, 0.15) !important;
            border-radius: 50%;
        }
        .react-datepicker__day--disabled {
            color: #ccc;
            cursor: not-allowed;
            text-decoration: line-through;
        }
        .react-datepicker__day--today {
            position: relative;
            font-weight: bold;
        }
        .react-datepicker__day--today:after {
            content: "";
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #f59e0b;
        }
        .react-datepicker__navigation {
            top: 1rem;
        }
        .react-datepicker__navigation-icon::before {
            border-color: #fff;
        }
        .react-datepicker__year-dropdown {
            background-color: #222;
            border: 1px solid #444;
            border-radius: 0.5rem;
        }
        .react-datepicker__year-option {
            color: white;
            padding: 0.5rem;
        }
        .react-datepicker__year-option:hover {
            background-color: #333;
        }
    `;


  return (
    <motion.div className="p-6 max-w-7xl mx-auto bg-white min-h-screenp-6">
      <style>{datePickerCustomStyles}</style>

      <div className="mb-8">
        <motion.div
          className="flex justify-between items-center"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Camera size={28} className="text-amber-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800">Portfolio Gallery</h1>
          </div>

          {/* Toggle button between upload/manage views */}
          <motion.button
            onClick={toggleViewMode}
            className="bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-lg text-black font-medium transition-all flex items-center group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {viewMode === "upload" ? (
              <>
                <Edit size={18} className="mr-2" />
                Manage Gallery
              </>
            ) : (
              <>
                <Upload size={18} className="mr-2" />
                Upload Images
              </>
            )}
            <motion.span
              className="inline-block ml-1"
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronRight size={16} />
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Breadcrumb navigation with transition effects */}
        <motion.div
          className="flex items-center text-sm text-gray-500 mt-2"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <motion.button
            onClick={() => handleNavigate("/admin", () => { /* set your active page callback here */ })}
            className="hover:text-amber-600 transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            Dashboard
          </motion.button>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-amber-600 font-medium">Portfolio</span>
          {viewMode === "manage" && (
            <>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-amber-600 font-medium">Manage</span>
            </>
          )}
        </motion.div>
      </div>
      {/* Update Success Popup */}
      <AnimatePresence>
        {updateSuccess.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md mx-4 pointer-events-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="checkmark"
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 52 52"
                >
                  <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Update Successful!</h3>
              <p className="text-gray-600 text-center mb-5">
                Your image has been updated to the {updateSuccess.imageCategory} category.
              </p>
              <div className="flex items-center justify-center">
                <span className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-medium">
                  <Image size={16} />
                  {updateSuccess.imageCategory}
                </span>
              </div>
            </div>
            <style jsx>{/* Same style as above */}</style>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Success Popup */}
      <AnimatePresence>
        {deleteSuccess.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md mx-4 pointer-events-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="checkmark"
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 52 52"
                >
                  <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Delete Successful!</h3>
              <p className="text-gray-600 text-center mb-5">
                {deleteSuccess.message}
              </p>
            </div>
            <style jsx>{/* Same style as above */}</style>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Error Popup */}
      <AnimatePresence>
        {uploadError.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md mx-4 pointer-events-auto">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <X size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Operation Failed</h3>
              <p className="text-gray-600 text-center mb-5">
                {uploadError.message || "There was an error. Please try again."}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* View Content with Transitions */}
      <div className={`transition-all duration-300 ease-in-out 
          ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

        {/* Upload Mode Content */}
        {viewMode === "upload" && (
          <>
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100/50 mb-8 relative overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black/80 flex items-center relative z-10">
                  <motion.div
                    className="bg-amber-100 p-2 rounded-lg mr-3"
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Image size={20} className="text-amber-500" />
                  </motion.div>
                  Highest Rated Photographer Work
                </h2>

                {/* Quick filter pills */}
                <div className="flex gap-2">
                  <motion.button
                    className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium"
                    whileHover={{ scale: 1.05, backgroundColor: "rgb(254 243 199)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    All
                  </motion.button>
                  <motion.button
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium"
                    whileHover={{ scale: 1.05, backgroundColor: "rgb(243 244 246)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    This Week
                  </motion.button>
                </div>
              </div>

              {loadingTopImages ? (
                <div className="flex justify-center items-center h-60">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full absolute border-4 border-amber-200"></div>
                    <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-amber-500 border-t-transparent"></div>
                  </div>
                </div>
              ) : highestRatedImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {highestRatedImages.map((image, index) => (
                    <motion.div
                      key={image._id}
                      className="relative rounded-xl overflow-hidden shadow-md h-52 group"
                      variants={cardVariants}
                      custom={index + 3}
                      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.description}
                        className="w-full h-full object-cover"
                      />
                      {/* Rating badge */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-xs ml-1 text-amber-600">{image.averageRating}</span>
                      </div>

                      {/* Info overlay with glass effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex flex-col justify-end p-4 backdrop-blur-sm">
                        {image.photographerName && (
                          <div className="flex items-center text-amber-300 text-xs mt-1 mb-2">
                            <div className="h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center mr-2">
                              <User size={12} className="text-white" />
                            </div>
                            {image.photographerName}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-xs">
                            {image.ratings?.length || 0} reviews
                          </span>
                          <motion.button
                            className="text-xs bg-amber-500/90 hover:bg-amber-500 text-white py-1 px-3 rounded-full font-medium flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                            <ChevronRight size={12} className="ml-1" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col items-center">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Camera size={36} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 max-w-md mx-auto">No rated images yet. Start rating photographer work to see them here.</p>
                  <motion.button
                    className="mt-4 text-amber-500 font-medium flex items-center text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Your First Rating
                    <ChevronRight size={16} className="ml-1" />
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Main form card with glass morphism effect */}
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-amber-100/40 relative overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >


              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-3 block"></span>
                  Upload New Image
                </h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <motion.div
                  className="w-full lg:w-1/3"
                  variants={cardVariants}
                  custom={3}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">Image Upload</label>
                  <motion.div
                    className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center transition-colors cursor-pointer shadow-sm overflow-hidden relative bg-gradient-to-b from-amber-50 to-white group"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(245, 158, 11, 0.12)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/40 via-amber-50/20 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <motion.div
                      className="bg-amber-100/60 p-4 rounded-full mx-auto mb-5 relative"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                      <Camera size={36} className="text-amber-500" />
                    </motion.div>

                    <h3 className="font-semibold text-gray-800 mb-2">Drop your image here</h3>
                    <p className="text-sm text-gray-500 mb-5">Upload a high-quality image (max 5MB)</p>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 transition-colors focus:outline-none"
                      />
                      {errors.imageFile && (
                        <p className="text-red-500 text-xs mt-2 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.imageFile}
                        </p>
                      )}
                    </div>

                    {/* Supported formats */}
                    <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">Supports: JPG, PNG, WEBP</p>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="w-full lg:w-2/3"
                  variants={cardVariants}
                  custom={4}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      <div className="relative" ref={dropdownRef}>
                        {/* Custom Dropdown Trigger */}
                        <div
                          onClick={() => setIsOpen(!isOpen)}
                          className={`flex items-center justify-between w-full bg-white/90 backdrop-blur-sm border ${isOpen
                            ? "border-amber-500 ring-2 ring-amber-200 ring-opacity-50"
                            : errors.selectedCategory
                              ? "border-red-300 hover:border-red-400"
                              : "border-gray-200 hover:border-amber-300"
                            } rounded-lg shadow-sm py-3 px-4 cursor-pointer transition-all`}
                        >
                          <div className="flex items-center flex-1 truncate">
                            {selectedCategory ? (
                              <span className="text-gray-800">{selectedCategory}</span>
                            ) : (
                              <span className="text-gray-500">Select a category</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            {selectedCategory && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory("");
                                }}
                                className="p-1 mr-1 rounded-full hover:bg-gray-100 text-gray-500"
                                aria-label="Clear selection"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 text-amber-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Dropdown Menu with solid background */}
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                          >
                            {/* Default "Select a category" option */}
                            <div
                              className={`px-4 py-2 cursor-pointer hover:bg-amber-50 ${!selectedCategory ? "bg-amber-50 text-amber-700" : "text-gray-700"}`}
                              onClick={() => {
                                setSelectedCategory("");
                                setIsOpen(false);
                              }}
                            >
                              Select a category
                            </div>

                            {/* Options list */}
                            <div className="max-h-60 overflow-y-auto">
                              {categories.length > 0 ? (
                                categories.map((cat) => (
                                  <div
                                    key={cat}
                                    className={`px-4 py-2 cursor-pointer hover:bg-amber-50 ${selectedCategory === cat ? "bg-amber-50 text-amber-700" : "text-gray-700"}`}
                                    onClick={() => {
                                      setSelectedCategory(cat);
                                      setIsOpen(false);
                                    }}
                                  >
                                    {cat}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-gray-500 text-center">No results found</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Photographer Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <User size={18} className="text-amber-500" strokeWidth={2} />
                        </div>
                        <input
                          type="text"
                          value={photographerName}
                          onChange={(e) => setPhotographerName(e.target.value)}
                          placeholder="Photographer name"
                          className="w-full pl-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 py-3 px-4 transition-shadow hover:border-amber-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <MapPin size={18} className="text-amber-500" strokeWidth={2} />
                        </div>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Where was this photo taken?"
                          className="w-full pl-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 py-3 px-4 transition-shadow hover:border-amber-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Date Captured</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Calendar size={18} className="text-amber-500" strokeWidth={2} />
                        </div>

                        <DatePicker
                          selected={dateCaptured}
                          onChange={(date) => setDateCaptured(date)}
                          dateFormat="dd/MM/yyyy"
                          className="w-full pl-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 py-3 px-4 transition-shadow hover:border-amber-300"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={15}
                          placeholderText="Click to select a date"
                          autoComplete="off"
                          wrapperClassName="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide a description for this image..."
                        rows={5}
                        className="w-full bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 py-3 px-4 transition-shadow hover:border-amber-300 resize-none"
                      ></textarea>
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.description}
                        </p>
                      )}
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {description.length} / 500
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-4">
                    <motion.button
                      className="px-5 py-2.5 rounded-lg text-gray-600 font-medium transition-all flex items-center border border-gray-200 hover:bg-gray-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      onClick={handleUpload}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 rounded-lg text-white font-medium transition-all flex items-center group shadow-lg shadow-amber-200/30"
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(245, 158, 11, 0.25)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-white/20 p-1 rounded-full mr-2">
                        <Upload size={16} className="text-white" />
                      </div>
                      Upload Image
                      <motion.span
                        className="relative ml-2 w-5 h-5 flex items-center justify-center overflow-hidden"
                        initial={{ opacity: 1 }}
                        whileHover={{
                          opacity: 1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <motion.span
                          className="absolute"
                          initial={{ y: 0 }}
                          whileHover={{ y: -20 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <ChevronRight size={16} />
                        </motion.span>
                        <motion.span
                          className="absolute"
                          initial={{ y: 20 }}
                          whileHover={{ y: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <ChevronRight size={16} />
                        </motion.span>
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}

        {/* Manage Mode Content - Embed UpdatePortfolio Component */}
        {viewMode === "manage" && (
          <UpdatePortfolio
            onDeleteRequest={confirmDelete}
            refreshTrigger={refreshTrigger}
            setUpdateSuccess={setUpdateSuccess} // Pass this to UpdatePortfolio
          />
        )}
      </div>
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
            ></motion.div>
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 max-w-md w-full z-10 m-4 border border-white/20"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-center">Confirm Deletion</h3>
              <p className="text-gray-600 mt-2 text-center">Are you sure you want to delete this image? This action cannot be undone.</p>
              <div className="flex justify-center gap-4 mt-6">
                <motion.button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  onClick={() => setDeleteModalOpen(false)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  onClick={handleDelete}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CustomPopup
        show={showPopup}
        message={popupMessage}
        type={popupType}
        onClose={() => setShowPopup(false)}
      />
    </motion.div>
  );
};

export default AdminPortfolio;