import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package, Search, Plus, Edit2, Trash2, ChevronRight, Image } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import Pack from '../pages/Pack'

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editPackageId, setEditPackageId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);


  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5003/api/package/viewPackages');
      if (!response.ok) {
        throw new Error('Something went wrong');
      }
      const data = await response.json();
      setPackages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPackages();
  }, []);

  const filteredPackages = packages.length > 0
    ? packages.filter(pkg =>
      pkg.packagename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.packageDetails?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Update Package Handler
  const handleUpdatePackage = (packageId) => {
    setEditPackageId(packageId);
    setShowPackageModal(true);
  };

  const handleAddPackage = () => {
    setEditPackageId(null);
    setShowPackageModal(true);
  };

  // Delete Package Handler
  const handleDeletePackage = async (packageId) => {
    setPackageToDelete(packageId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePackage = async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/package/deletePackage/${packageToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete package');
      }

      // Remove the package from the local state
      setPackages(packages.filter(pkg => pkg._id !== packageToDelete));
      toast.success('Package deleted successfully!'); // Show success toast
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting package'); // Show error toast
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    const searchResultItem = sessionStorage.getItem('searchResultItem');
    if (searchResultItem) {
      const resultData = JSON.parse(searchResultItem);
      
      if (resultData.type === 'package' && Date.now() - resultData.timestamp < 2000) {
        const packageToHighlight = packages.find(pkg => pkg._id === resultData.id);
        
        if (packageToHighlight) {
          // For packages, you might want to:
          // Scroll the package into view or open edit mode
          handleUpdatePackage(resultData.id);
        }
        
        sessionStorage.removeItem('searchResultItem');
      }
    }
  }, [packages]);

  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    out: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="ml-4 text-amber-600">Loading packages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl text-red-700 p-6 max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Error Loading Packages</h3>
          </div>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="p-6 max-w-7xl mx-auto bg-white min-h-screenp-6"
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
      >
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
                <Package size={28} className="text-amber-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800">Photography Packages</h1>
            </div>

            <motion.button
              onClick={handleAddPackage}
              className="bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-lg text-black font-medium transition-all flex items-center group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} className="mr-2" />
              Add New Package
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

          {/* Breadcrumb navigation */}
          <motion.div
            className="flex items-center text-sm text-gray-500 mt-2"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <motion.button
              onClick={() => navigate("/admin")}
              className="hover:text-amber-600 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              Dashboard
            </motion.button>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-amber-600 font-medium">Packages</span>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          className="mb-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2 w-full max-w-md">
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Search packages by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
            />
          </div>
        </motion.div>

        {/* Packages */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          {filteredPackages.length === 0 ? (
            <motion.div
              className="bg-amber-50 rounded-xl p-8 text-center border border-amber-100"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <Image size={48} className="text-amber-300 mx-auto mb-4" />
              <p className="text-gray-600">No packages found. Create your first package!</p>
              <motion.button
                onClick={handleAddPackage}
                className="mt-4 bg-amber-500 hover:bg-amber-600 px-5 py-2 rounded-lg text-black font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} className="inline mr-2" />
                Add New Package
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg, index) => (
                <motion.div
                  key={pkg._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index + 3}
                  whileHover={{ y: -4 }}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-amber-500" />
                        </div>
                        <h3 className="ml-3 text-lg font-bold text-gray-800">{pkg.packagename}</h3>
                      </div>
                      <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-700 text-sm font-semibold">
                        Rs.{pkg.packagePrice}
                      </div>
                    </div>
                    {/* Package Type Badge */}
                    <div className="flex items-center mb-3">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700 font-medium">
                        {pkg.packageType || "Event"}
                      </span>
                    </div>
                    <div className="border-t border-gray-100 my-3"></div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {pkg.packageDetails}
                    </p>
                    {/* Show included customizations if any */}
                    {pkg.includedCustomizations && pkg.includedCustomizations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-1">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.includedCustomizations.map(custom => (
                            <div key={custom.id} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded flex items-center">
                              <span>{custom.name}</span>
                              {custom.hasQuantity && custom.quantity && (
                                <span className="ml-1 text-amber-600">
                                  ({custom.quantity} {custom.unit}{custom.quantity > 1 ? 's' : ''})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <span className="font-medium">Validity:</span>
                      <span className="ml-1">{pkg.packagevalidity}</span>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <motion.button
                        onClick={() => handleUpdatePackage(pkg._id)}
                        className="bg-gray-100 p-2 rounded-lg flex items-center justify-center hover:bg-amber-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 size={16} className="text-amber-600 mr-1" />
                        <span className="text-sm">Edit</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="bg-gray-100 p-2 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} className="text-red-500 mr-1" />
                        <span className="text-sm">Delete</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Toast Container */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </motion.div>

      {showPackageModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="sticky top-0 bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {editPackageId ? 'Edit Package' : 'Add New Package'}
              </h3>
              <button
                onClick={() => setShowPackageModal(false)}
                className="text-white hover:text-amber-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <Pack
                isModal={true}
                packageId={editPackageId}
                onClose={() => {
                  setShowPackageModal(false);
                  // Refresh packages after submission
                  fetchPackages();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
      {deleteDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <Trash2 size={20} className="text-red-500" />
                </div>
                <p className="text-gray-600">Are you sure you want to delete this package? This action cannot be undone.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={confirmDeletePackage}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Package
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AdminPackages;