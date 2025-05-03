import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';

const ViewPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [customizations, setCustomizations] = useState({});
    const [customizationQuantities, setCustomizationQuantities] = useState({});
    const [filterCategory, setFilterCategory] = useState('all');
    const navigate = useNavigate();
    
    const { currentUser } = useSelector((state) => state.user);

    const [showLoginDialog, setShowLoginDialog] = useState(false);
    const [pendingPackage, setPendingPackage] = useState(null);

    // Common photography customization options with prices
    const customizationOptions = [
        { 
            id: 'prints', 
            name: 'Additional Prints', 
            price: 1500, 
            description: 'High-quality prints', 
            hasQuantity: true,
            unit: 'set',
            minQuantity: 1,
            maxQuantity: 5,
            unitDescription: 'Each set contains 5 prints'
        },
        { 
            id: 'album', 
            name: 'Premium Photo Album', 
            price: 3000, 
            description: 'Leather-bound premium album',
            hasQuantity: false
        },
        { 
            id: 'retouching', 
            name: 'Advanced Retouching', 
            price: 2000, 
            description: 'Professional skin & color enhancement',
            hasQuantity: false
        },
        { 
            id: 'extraHour', 
            name: 'Extra Hour', 
            price: 2500, 
            description: 'Additional photography time',
            hasQuantity: true,
            unit: 'hour',
            minQuantity: 1,
            maxQuantity: 8,
            unitDescription: 'Extends your session time'
        },
        { 
            id: 'videography', 
            name: 'Video Coverage', 
            price: 5000, 
            description: 'Professional video recording & editing',
            hasQuantity: true,
            unit: 'hour',
            minQuantity: 1,
            maxQuantity: 4,
            unitDescription: 'Duration of video coverage'
        },
        { 
            id: 'drone', 
            name: 'Drone Photography', 
            price: 4000, 
            description: 'Aerial shots with professional drone',
            hasQuantity: true,
            unit: 'session',
            minQuantity: 1,
            maxQuantity: 3,
            unitDescription: 'Each session is 30 minutes'
        }
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('http://localhost:5003/api/package/viewPackages');
              
                if (!response.ok) {
                    throw new Error('Failed to fetch packages');
                }
              
                const data = await response.json();
                
                // Add category for filtering (just for demo - in real app, this would come from backend)
                const categorizedData = data.map(pkg => ({
                    ...pkg,
                    category: pkg.packagename.toLowerCase().includes('wedding') ? 'wedding' : 
                               pkg.packagename.toLowerCase().includes('portrait') ? 'portrait' : 
                               pkg.packagename.toLowerCase().includes('event') ? 'event' : 'other'
                }));
                
                setPackages(categorizedData);
                
                // Initialize customizations state object and quantities
                const initialCustomizations = {};
                const initialQuantities = {};
                
                categorizedData.forEach(pkg => {
                    initialCustomizations[pkg._id] = [];
                    initialQuantities[pkg._id] = {};
                    
                    // Initialize each customization option with default quantity
                    customizationOptions.forEach(option => {
                        if (option.hasQuantity) {
                            initialQuantities[pkg._id][option.id] = option.minQuantity;
                        }
                    });
                });
                
                setCustomizations(initialCustomizations);
                setCustomizationQuantities(initialQuantities);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching packages:', error);
                toast.error('Failed to load packages');
                setLoading(false);
            }
        };
    
        fetchPackages();
    }, []);

    const handleCustomizationToggle = (packageId, customizationId) => {
        setCustomizations(prev => {
            const currentCustomizations = [...(prev[packageId] || [])];
            const index = currentCustomizations.indexOf(customizationId);
            
            if (index === -1) {
                // Add the customization
                return {
                    ...prev,
                    [packageId]: [...currentCustomizations, customizationId]
                };
            } else {
                // Remove the customization
                currentCustomizations.splice(index, 1);
                return {
                    ...prev,
                    [packageId]: currentCustomizations
                };
            }
        });
    };

    const handleQuantityChange = (packageId, customizationId, newQuantity) => {
        setCustomizationQuantities(prev => ({
            ...prev,
            [packageId]: {
                ...(prev[packageId] || {}),
                [customizationId]: newQuantity
            }
        }));

        // Ensure this customization is selected when quantity changes
        if (!customizations[packageId]?.includes(customizationId)) {
            handleCustomizationToggle(packageId, customizationId);
        }
    };

    const calculateTotalPrice = (basePrice, packageId) => {
        const selectedCustomizations = customizations[packageId] || [];
        const additionalCost = selectedCustomizations.reduce((total, customId) => {
            const option = customizationOptions.find(opt => opt.id === customId);
            if (!option) return total;
            
            const quantity = option.hasQuantity 
                ? (customizationQuantities[packageId]?.[customId] || option.minQuantity)
                : 1;
                
            return total + (option.price * quantity);
        }, 0);
        
        return basePrice + additionalCost;
    };

    const handleBookNow = (packageItem) => {
        // The currentUser is now always defined, but you can keep this check for future flexibility
        if (!currentUser) {
          setShowLoginDialog(true);
          setPendingPackage(packageItem);
            return;
        }

        // Include selected customizations with quantities in booking data
        const selectedCustomizationDetails = (customizations[packageItem._id] || []).map(customId => {
            const option = customizationOptions.find(opt => opt.id === customId);
            const quantity = option.hasQuantity 
                ? (customizationQuantities[packageItem._id]?.[customId] || option.minQuantity)
                : 1;
                
            const totalPrice = option.price * quantity;
            
            return {
                id: option.id,
                name: option.name,
                quantity: quantity,
                unitPrice: option.price,
                totalPrice: totalPrice,
                details: option.hasQuantity 
                    ? `${quantity} ${option.unit}${quantity > 1 ? 's' : ''} (${option.unitDescription})`
                    : option.description
            };
        });

        // Pass package data to booking page via React Router state
        navigate('/booking', { 
            state: { 
                selectedPackage: {
                    _id: packageItem._id,
                    name: packageItem.packagename,
                    price: calculateTotalPrice(packageItem.packagePrice, packageItem._id),
                    originalPrice: packageItem.packagePrice,
                    details: packageItem.packageDetails,
                    validity: packageItem.packagevalidity,
                    customizations: selectedCustomizationDetails
                },
                currentUser: {
                  id: currentUser._id || currentUser.id,
                  email: currentUser.email,
                  fullName: currentUser.fullName || currentUser.username || currentUser.name || '',
              }
            } 
        });
    };

    // Filter packages based on selected category
    const filteredPackages = filterCategory === 'all' 
        ? packages 
        : packages.filter(pkg => pkg.category === filterCategory);

    // Minimal loading state with photography theme
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
                <p className="mt-4 text-gray-800">Loading packages</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900">
            <Navbar className="sticky top-0 z-50 shadow-md" />
            
            {/* Clean, modern header */}
            <header className="pt-32 pb-12 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                <div className="absolute top-24 -left-16 w-32 h-32 rounded-full bg-amber-50 opacity-60"></div>
                <div className="absolute top-36 -right-16 w-32 h-32 rounded-full bg-gray-100 opacity-70"></div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 relative inline-block">
                    Photography <span className="text-amber-500">Packages</span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-amber-500 transform"></div>
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                    Select from our carefully crafted packages designed to capture your moments perfectly
                </p>
            </header>

            {/* Filter section */}
            <div className="container mx-auto px-4 mb-8">
                <div className="bg-white shadow-sm rounded-lg p-4 max-w-3xl mx-auto flex flex-wrap justify-center">
                    <button 
                        onClick={() => setFilterCategory('all')}
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            filterCategory === 'all' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        All Packages
                    </button>
                    <button 
                        onClick={() => setFilterCategory('wedding')}
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            filterCategory === 'wedding' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        Wedding
                    </button>
                    <button 
                        onClick={() => setFilterCategory('portrait')}
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            filterCategory === 'portrait' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        Portrait
                    </button>
                    <button 
                        onClick={() => setFilterCategory('event')}
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            filterCategory === 'event' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        Event
                    </button>
                    <button 
                        onClick={() => setFilterCategory('other')}
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${
                            filterCategory === 'other' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        Other
                    </button>
                </div>
            </div>
            
            {/* Main content - Side by side Package Display with fixed heights */}
            <main className="container mx-auto px-4 py-6 flex-grow mb-16">
                {filteredPackages.length === 0 ? (
                    <div className="text-center py-16 bg-white shadow-sm rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h2 className="text-xl font-medium text-gray-900 mb-2">No Packages Available</h2>
                        <p className="text-gray-500">
                            We're currently updating our packages. Please check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map((packageItem) => (
                            <div 
                                key={packageItem._id}
                                className={`${selectedPackage === packageItem._id ? 'ring-1 ring-amber-500' : ''} 
                                bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full`}
                                onMouseEnter={() => setSelectedPackage(packageItem._id)}
                                onMouseLeave={() => setSelectedPackage(null)}
                            >
                                {/* Package header with price */}
                                <div className="bg-gray-900 text-white p-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-full">
                                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-500 opacity-60"></div>
                                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-500 opacity-60"></div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <span className="text-xs uppercase tracking-wider text-amber-400">Photography Package</span>
                                        <h2 className="text-xl font-bold mt-2 mb-3 truncate">
                                            {packageItem.packagename}
                                        </h2>
                                        <div className="h-px w-12 bg-amber-500 mb-4"></div>
                                        
                                        <div className="flex items-baseline">
                                            <span className="text-2xl font-light">
                                                <span className="text-amber-500 font-normal">Rs.</span>
                                                {calculateTotalPrice(packageItem.packagePrice, packageItem._id).toLocaleString()}
                                            </span>
                                            {customizations[packageItem._id]?.length > 0 && (
                                                <span className="ml-2 text-sm text-gray-400 line-through">
                                                    Rs.{packageItem.packagePrice.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Package details with fixed layout */}
                                <div className="p-6 flex flex-col flex-grow">
                                    {/* Package details section - fixed height */}
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-1 h-4 bg-amber-500 mr-2"></div>
                                            <h3 className="text-md font-medium text-gray-900">Package Details</h3>
                                        </div>
                                        <div className="h-16 overflow-y-auto mb-4">
                                            <p className="text-gray-600 text-sm leading-relaxed pr-1">
                                                {packageItem.packageDetails}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Customization options - fixed height with scroll */}
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-1 h-4 bg-amber-500 mr-2"></div>
                                            <h3 className="text-md font-medium text-gray-900">Customizations</h3>
                                        </div>
                                        <div className="h-72 overflow-y-auto mb-4 pr-1 customization-container">
                                            <div className="grid grid-cols-1 gap-2">
                                                {customizationOptions.map(option => (
                                                    <div 
                                                        key={option.id}
                                                        className={`p-3 border rounded-md cursor-pointer text-sm transition-colors duration-200 ${
                                                            customizations[packageItem._id]?.includes(option.id)
                                                            ? 'border-amber-500 bg-amber-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div 
                                                            className="flex justify-between items-center"
                                                            onClick={() => handleCustomizationToggle(packageItem._id, option.id)}
                                                        >
                                                            <span className="font-medium">{option.name}</span>
                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                Rs.{option.price.toLocaleString()}{option.hasQuantity ? `/${option.unit}` : ''}
                                                            </span>
                                                        </div>
                                                        <p 
                                                            className="text-xs text-gray-500 mt-1"
                                                            onClick={() => handleCustomizationToggle(packageItem._id, option.id)}
                                                        >
                                                            {option.description}
                                                        </p>
                                                        
                                                        {/* Quantity selector for options with quantities */}
                                                        {option.hasQuantity && customizations[packageItem._id]?.includes(option.id) && (
                                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                                <div className="text-xs text-gray-500">
                                                                    {option.unitDescription}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <button 
                                                                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const currentQty = customizationQuantities[packageItem._id]?.[option.id] || option.minQuantity;
                                                                            if (currentQty > option.minQuantity) {
                                                                                handleQuantityChange(packageItem._id, option.id, currentQty - 1);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                                        </svg>
                                                                    </button>
                                                                    
                                                                    <span className="mx-3 font-medium text-gray-700">
                                                                        {customizationQuantities[packageItem._id]?.[option.id] || option.minQuantity}
                                                                    </span>
                                                                    
                                                                    <button 
                                                                        className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const currentQty = customizationQuantities[packageItem._id]?.[option.id] || option.minQuantity;
                                                                            if (currentQty < option.maxQuantity) {
                                                                                handleQuantityChange(packageItem._id, option.id, currentQty + 1);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Show total price for quantity-based options when selected */}
                                                        {option.hasQuantity && customizations[packageItem._id]?.includes(option.id) && (
                                                            <div className="text-right text-xs font-medium text-amber-600 mt-2">
                                                                Total: Rs.{(option.price * (customizationQuantities[packageItem._id]?.[option.id] || option.minQuantity)).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer with validity and book button */}
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 mb-4">
                                            Valid until: {new Date(packageItem.packagevalidity).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleBookNow(packageItem)}
                                            className="w-full px-6 py-3 bg-white text-gray-900 font-medium border border-gray-900 rounded-md hover:bg-gray-900 hover:text-white transition-colors duration-300 group-hover:border-amber-500 group-hover:text-amber-500 hover:group-hover:bg-white hover:group-hover:text-gray-900"
                                        >
                                            Book This Package
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>  
            <Footer className="bg-black border-t border-gray-800 py-8" />

        {showLoginDialog && (
          <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white bg-opacity-80 rounded-3xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn backdrop-filter backdrop-blur border border-gray-100">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500 bg-opacity-5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
                <p className="text-gray-600 mt-2">Please log in to book this photography package</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowLoginDialog(false);
                    navigate('/sign-in', {
                      state: {
                        from: '/packages',
                        packageDetails: pendingPackage ? {
                          name: pendingPackage.packagename,
                          price: pendingPackage.packagePrice,
                          details: pendingPackage.packageDetails,
                          validity: pendingPackage.packagevalidity
                        } : null
                      }
                    });
                  }}
                  className="w-full px-4 py-3 bg-amber-500 text-white font-medium rounded-md hover:bg-amber-600 transition-colors duration-300"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    navigate('/sign-up', {
                      state: {
                        redirectTo: '/packages'
                      }
                    });
                  }}
                  className="w-full px-4 py-3 bg-white text-gray-800 font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-300"
                >
                  Create Account
                </button>

                <button
                  onClick={() => setShowLoginDialog(false)}
                  className="w-full px-4 py-3 bg-transparent text-gray-600 font-medium rounded-md hover:bg-gray-50 transition-colors duration-300"
                >
                  Continue Browsing Gallery
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
    );  
}

export default ViewPackages;