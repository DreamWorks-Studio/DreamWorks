import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaCamera, FaTimes, FaSpinner, FaStar, FaRegStar, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Info, Loader, LockIcon, Star, User, X, MapPin, Calendar } from 'lucide-react';

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('Birthday');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageOrientation, setImageOrientation] = useState({});
  const [imageSizes, setImageSizes] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showStandaloneSuccessPopup, setShowStandaloneSuccessPopup] = useState(false);
  const observerRef = useRef(null);
  const imageRefs = useRef({});

  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);

  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch categories from your database
  const categories = [
    { id: 'Birthday', name: 'Birthday' },
    { id: 'Graduation', name: 'Graduation' },
    { id: 'Preshoots', name: 'Preshoots' },
    { id: 'Wedding', name: 'Wedding' },
    { id: 'Modelshoots', name: 'Model Shoots' },
    { id: 'Events', name: 'Events' }
  ];

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.dataset.id;
          if (entry.isIntersecting && id) {
            // Start loading the actual image
            const actualSrc = entry.target.dataset.src;
            if (actualSrc) {
              const img = new Image();
              img.src = actualSrc;
              img.onload = () => {
                if (imageRefs.current[id]) {
                  imageRefs.current[id].src = actualSrc;
                  handleImageLoad({ target: img }, id);
                  setImagesLoaded(prev => ({ ...prev, [id]: true }));
                }
              };
            }
            // Unobserve after loading starts
            observerRef.current.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '200px',
        threshold: 0.1
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const fetchUserRating = async (imageId) => {
    if (!currentUser || !imageId) return;

    try {
      const response = await fetch(`http://localhost:5003/api/portfolio/rate/${imageId}/${currentUser._id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }

      const data = await response.json();
      setCurrentRating(data.rating);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };

  // Function for star rating interaction
  const handleStarClick = (rating) => {
    if (!currentUser) return;
    setCurrentRating(rating);
  };

  const handleStarHover = (rating) => {
    if (!currentUser) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Function to render stars
  const renderStars = () => {
    const displayRating = hoverRating || currentRating;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!currentUser}
            className={`text-2xl focus:outline-none transition-transform ${currentUser ? 'hover:scale-110 text-amber-400' : 'text-gray-300 cursor-not-allowed'
              }`}
            onMouseEnter={() => handleStarHover(star)}
            onClick={() => handleStarClick(star)}
          >
            {displayRating >= star ? (
              <FaStar />
            ) : (
              <FaRegStar />
            )}
          </button>
        ))}
      </div>
    );
  };

  const submitRating = async (imageId, rating) => {
    if (!rating || !currentUser) return;
  
    try {
      setSubmittingRating(true);
  
      // Make API call to save the rating with MongoDB ObjectId
      const response = await fetch(`http://localhost:5003/api/portfolio/rate/${imageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          userId: currentUser._id  // This is already a MongoDB ObjectId string
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
  
      // First close the lightbox modal
      setSelectedImage(null);
      
      // After a short delay, show the standalone success popup
      setTimeout(() => {
        setShowStandaloneSuccessPopup({
          rating: rating,
          show: true
        });
        
        // Auto close the popup after 2.5 seconds
        setTimeout(() => {
          setShowStandaloneSuccessPopup(false);
        }, 2500);
      }, 300); // 300ms delay to allow lightbox closing animation to start
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Fetch user's rating when the selected image changes
  useEffect(() => {
    if (selectedImage && currentUser) {
      fetchUserRating(selectedImage._id);
    } else {
      setCurrentRating(0);
    }

    setHoverRating(0);
  }, [selectedImage, currentUser]);

  const handleImageLoad = (event, id) => {
    const { naturalWidth, naturalHeight } = event.target;
    const orientation = naturalWidth > naturalHeight ? 'landscape' : 'portrait';

    // Set orientation
    setImageOrientation(prevState => ({
      ...prevState,
      [id]: orientation
    }));

    // Calculate aspect ratio
    const aspectRatio = naturalWidth / naturalHeight;

    // Determine size category based on orientation and aspect ratio
    let sizeCategory;

    if (orientation === 'portrait') {
      // Only two categories for portrait - very tall and standard
      if (aspectRatio < 0.6) {
        sizeCategory = 'very-tall';
      } else {
        sizeCategory = 'standard-portrait';
      }
    } else {
      // Only two categories for landscape - panoramic and standard
      if (aspectRatio > 2) {
        sizeCategory = 'panoramic';
      } else {
        sizeCategory = 'standard-landscape';
      }
    }

    setImageSizes(prevState => ({
      ...prevState,
      [id]: sizeCategory
    }));
  };

  // Fetch portfolio items
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/portfolio/images');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const processedData = data.map(item => ({
          ...item,
          photographerName: item.photographerName || '',
          location: item.location || '',
          dateCaptured: item.dateCaptured || null
        }));

        setPortfolioItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
        setError("Failed to load images. Please try again later.");
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // Handle navigation to photo detail
  const handlePhotoClick = (photo) => {
    setSelectedImage(photo);
  };

  // Filter portfolio items based on active category and search term
  useEffect(() => {
    let filtered = portfolioItems;

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [activeCategory, searchTerm, portfolioItems]);

  // Observe image elements when filtered items change
  useEffect(() => {
    // Allow a brief delay for DOM to update
    const timer = setTimeout(() => {
      Object.values(imageRefs.current).forEach(imgElement => {
        if (imgElement && observerRef.current) {
          observerRef.current.observe(imgElement);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredItems]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchTerm('');
    }
  };

  // Function to determine grid classes based on orientation and size
  const getGridClasses = (item, index) => {
    const sizeCategory = imageSizes[item._id];
    const orientation = imageOrientation[item._id];

    // If size hasn't been determined yet, use base sizing
    if (!sizeCategory) {
      return '';
    }

    // Apply size-based classes - simpler approach with fewer variations
    switch (sizeCategory) {
      case 'very-tall':
        return 'row-span-2'; // Very tall portrait images span 2 rows

      case 'panoramic':
        return 'col-span-2'; // Panoramic landscape images span 2 columns

      // Add some variety but not too much
      default:
        // Create some variation based on position in the grid but only for every 9th image
        if (index % 9 === 0 && orientation === 'landscape') {
          return 'col-span-2';
        }
        return '';
    }
  };

  // Add image shimmer effect for loading state
  const shimmerAnimation = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%]";

  return (
    <div className="w-full min-h-screen bg-white">
      <Navbar />

      <AnimatePresence>
  {showStandaloneSuccessPopup && (
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
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Rating Submitted!</h3>
        <p className="text-gray-600 text-center mb-5">Thank you for rating this image.</p>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Page Header with parallax effect */}
      {/* Clean, modern header */}
      <div className="pt-32 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="absolute top-24 -left-16 w-32 h-32 rounded-full bg-amber-50 opacity-60"></div>
        <div className="absolute top-36 -right-16 w-32 h-32 rounded-full bg-gray-100 opacity-70"></div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block">
          Our <span className="text-amber-500">Portfolio</span>
          <div className="absolute -bottom-2 left-0 w-full h-1 bg-amber-500 transform"></div>
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Dream Works Studio Photography
        </p>
      </div>

      <div className="container mx-auto px-4 mb-8 pb-8">
        <div className="bg-white shadow-sm rounded-lg p-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-2">
            {/* Category Pills */}
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${activeCategory === category.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}

            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="m-1 p-2 text-gray-600 hover:text-amber-500 transition-colors duration-200"
              aria-label="Search portfolio"
            >
              {isSearchVisible ? <FaTimes size={18} /> : <FaSearch size={18} />}
            </button>
          </div>

          <AnimatePresence>
            {isSearchVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full max-w-md mx-auto overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-3xl border border-gray-300 focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50 outline-none transition-all duration-300"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-500"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gallery Grid - Keeping original implementation */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            <p className="ml-4 text-gray-600">Loading portfolio...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] mt-12">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className={`group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${getGridClasses(item, index)}`}
                  onClick={() => imagesLoaded[item._id] && handlePhotoClick(item)}
                >
                  <div className="relative overflow-hidden w-full h-full">
                    {/* Shimmer loading effect */}
                    {!imagesLoaded[item._id] && (
                      <div className={`absolute inset-0 ${shimmerAnimation}`}>
                        <div className="flex items-center justify-center h-full">
                          <FaSpinner className="animate-spin text-amber-500" size={24} />
                        </div>
                      </div>
                    )}

                    {/* Lazy loaded image */}
                    <img
                      ref={el => imageRefs.current[item._id] = el}
                      src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" // Tiny transparent placeholder
                      data-src={item.imageUrl}
                      data-id={item._id}
                      alt={item.description || 'Portfolio image'}
                      className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${!imagesLoaded[item._id] ? 'opacity-0' : 'opacity-100'}`}
                      style={{
                        // Apply higher quality rendering
                        imageRendering: 'auto',
                        transition: 'opacity 0.5s ease-in-out',
                      }}
                    />

                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 ${imagesLoaded[item._id] ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                      <h3 className="text-white text-lg font-medium">{item.description || 'Untitled'}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FaCamera className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 mb-2">No photos found</h3>
            <p className="text-gray-500">Try adjusting your category selection or search criteria</p>
          </div>
        )}
      </div>

      {/* Updated Lightbox Modal with rating feature */}
      {selectedImage && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative max-w-5xl max-h-180 w-full bg-black/80 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-4 right-4 text-black hover:text-amber-500 transition-colors duration-300 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="text-2xl" />
              </motion.button>

              {/* Left side - Image */}
              <div className="md:w-1/2 bg-transparent">
                <div className="h-full flex items-center justify-center p-4">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.description || 'Portfolio image'}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      imageRendering: 'high-quality',
                      filter: 'contrast(105%) brightness(102%)'
                    }}
                  />
                </div>
              </div>

              {/* Right side - Info and Rating */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col bg-white">
                {/* Birthday tag */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-amber-500 rounded-full mb-3 shadow-sm">
                    {selectedImage.category || "Birthday"}
                  </span>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {selectedImage.description}
                  </h2>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* About This Image */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    About This Image
                  </h3>
                  
                  {/* Image Details Section */}
                  <div className="space-y-3">
                    {/* Photographer Name */}
                    <div className="flex items-center text-gray-700">
                      <User size={16} className="mr-2 text-amber-500"/>
                      <span className="w-1/3 text-sm font-medium">Photographer: </span>
                      <span className="text-sm ml-2">{selectedImage.photographerName || 'Unknown'}</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-700">
                      <MapPin size={16} className="mr-2 text-amber-500"/>
                      <span className="w-1/3 text-sm font-medium">Location:</span>
                      <span className="text-sm ml-2">{selectedImage.location || 'Not specified'}</span>
                    </div>

                    {/* Date Captured */}
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="mr-2 text-amber-500"/>
                      <span className="w-1/3 text-sm font-medium">Date:</span>
                      <span className="text-sm ml-2">
                        {selectedImage.dateCaptured
                          ? new Date(selectedImage.dateCaptured).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : 'Not recorded'}
                      </span>
                    </div>
                  </div>
                </div>

                  {/* Rating Section with Authentication Check */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="border-t border-gray-200 py-3 mt-auto"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                      <Star className="mr-2 text-amber-500" />
                      Rate This Image
                    </h3>

                    {!currentUser ? (
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-4 shadow-sm">
                        <div className="flex items-center text-gray-500 mb-3">
                          <LockIcon className="mr-2 text-amber-500" />
                          <span>Please log in to rate images</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/sign-in')}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm"
                        >
                          Log In
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3" onMouseLeave={handleMouseLeave}>
                          <div className="flex justify-center">
                            {renderStars()}
                          </div>
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            {hoverRating || currentRating || 0} out of 5 stars
                          </p>
                        </div>

                        <div className="flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => submitRating(selectedImage._id, currentRating)}
                            disabled={!currentRating || submittingRating}
                            className={`px-6 py-2.5 rounded-md text-white shadow-sm ${!currentRating || submittingRating
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                              } transition-all`}
                          >
                            {submittingRating ? (
                              <span className="flex items-center">
                                <Loader className="animate-spin" />
                                Submitting...
                              </span>
                            ) : (
                              'Submit Rating'
                            )}
                          </motion.button>
                        </div>
                      </>
                    )}
                  </motion.div>

                {/* Photo metadata footer */}
                <div className="mt-auto pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
                  <span>DreamWorks Studio</span>
                  <span>© {new Date().getFullYear()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      <Footer />
    </div>
  );
};

export default Portfolio;