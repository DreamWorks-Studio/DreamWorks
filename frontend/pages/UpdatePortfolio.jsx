import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';
import { Camera, Image, Edit, Trash2, Plus, Filter, User, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Modified to be embedded inside AdminPortfolio
const UpdatePortfolio = ({ onDeleteRequest, refreshTrigger }) => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Filtering
  const [editingImage, setEditingImage] = useState(null); // Image being edited
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (category) => {
    setSelectedOption(category);
    setSelectedCategory(category);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedOption("");
    setSelectedCategory("");
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
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/portfolio/images");
        if (!response.ok) throw new Error("Failed to fetch images");
        const data = await response.json();
        setImages(data);
        // Extract unique categories dynamically
        const uniqueCategories = [...new Set(data.map((img) => img.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchImages();
  }, [refreshTrigger]);

  // Enable edit mode
  const handleEdit = (image) => {
    setEditingImage(image._id);
    setUpdatedDescription(image.description);
    setUpdatedCategory(image.category);
  };

  // Update image
  const handleUpdate = async () => {
    if (!editingImage) return;

    try {
      const response = await fetch(`http://localhost:5003/api/portfolio/update/${editingImage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: updatedCategory, description: updatedDescription }),
      });

      if (!response.ok) throw new Error("Failed to update image");

      setImages(
        images.map((img) =>
          img._id === editingImage ? { ...img, category: updatedCategory, description: updatedDescription } : img
        )
      );

      setEditingImage(null);

      // Success notification
      toast.success("Image updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update image.");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter images based on category
  const filteredImages = selectedCategory ? images.filter((img) => img.category === selectedCategory) : images;

  return (
    <>
      {/* Filter and actions bar */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6 border border-black/10 hover:shadow-lg transition-all mb-6"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <h2 className="text-xl font-semibold text-black/80 mb-4 flex items-center">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Filter size={22} className="text-amber-500 mr-2" />
          </motion.div>
          Filter Images
        </h2>

        <div className="relative">
          {/* Custom Dropdown Trigger */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between w-full md:w-72 py-3 px-4 rounded-lg cursor-pointer ${isOpen ? "ring-2 ring-amber-500 bg-amber-50" : "bg-white border border-gray-300"
              }`}
          >
            <div className="flex items-center flex-1 truncate">
              {selectedOption ? (
                <span className="text-black/80">{selectedOption}</span>
              ) : (
                <span className="text-gray-500">All Categories</span>
              )}
            </div>
            <div className="flex items-center">
              {selectedOption && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="p-1 mr-1 rounded-full hover:bg-gray-100"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              )}
              <svg className={`fill-current h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 w-full md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Search input */}
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Default "All Categories" option */}
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-amber-50 ${!selectedOption ? "bg-amber-50 text-amber-700" : "text-gray-700"}`}
                onClick={() => handleSelect("")}
              >
                All Categories
              </div>

              {/* Options list */}
              <div className="max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <div
                      key={cat}
                      className={`px-4 py-2 cursor-pointer hover:bg-amber-50 ${selectedOption === cat ? "bg-amber-50 text-amber-700" : "text-gray-700"}`}
                      onClick={() => handleSelect(cat)}
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
      </motion.div>

      {/* Image Gallery Grid */}
      {filteredImages.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          {filteredImages.map((img, index) => (
            <motion.div
              key={img._id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              variants={cardVariants}
              custom={index + 4}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            >
              <div className="relative h-64 overflow-hidden group">
                <img
                  src={img.imageUrl}
                  alt={img.description}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <motion.button
                    onClick={() => handleEdit(img)}
                    className="bg-white text-gray-800 rounded-full p-2 mx-2 hover:bg-amber-500 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit size={20} />
                  </motion.button>
                  <motion.button
                    onClick={() => onDeleteRequest(img._id)}
                    className="bg-white text-gray-800 rounded-full p-2 mx-2 hover:bg-red-500 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="p-4">
                {editingImage === img._id ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 text-gray-700 py-3 px-4 resize-none transition-all duration-200 hover:border-amber-300"
                      value={updatedDescription}
                      onChange={(e) => setUpdatedDescription(e.target.value)}
                      rows={3}
                    />
                    <div className="relative">
                      <select
                        className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:ring-opacity-50 text-gray-700 py-3 px-4 appearance-none transition-all duration-200 hover:border-amber-300"
                        value={updatedCategory}
                        onChange={(e) => setUpdatedCategory(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <motion.button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 shadow-sm border border-gray-300 font-medium"
                        onClick={() => setEditingImage(null)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-200 shadow-sm font-medium"
                        onClick={handleUpdate}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Save
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-1 text-xs text-amber-800 bg-amber-100 rounded-full mb-2">
                          {img.category}
                        </span>
                        <p className="text-gray-600 mt-1 line-clamp-2">{img.description}</p>
                        {img.photographerName && (
                          <p className="text-amber-500 text-xs flex items-center mt-2">
                            <User size={12} className="mr-1" />
                            {img.photographerName}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="bg-white rounded-2xl shadow-md p-8 text-center border border-black/5"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <Camera size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mt-4">No images found for this category.</p>
        </motion.div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default UpdatePortfolio;