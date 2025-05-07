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
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [packageToPrint, setPackageToPrint] = useState(null);

    const packageTypeOptions = ["Wedding", "Portrait", "Event", "Preshoot", "Graduation"];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('http://localhost:5003/api/package/viewPackages');

                if (!response.ok) {
                    throw new Error('Failed to fetch packages');
                }

                const data = await response.json();
                setPackages(data);

                // Initialize customizations state object and quantities
                const initialCustomizations = {};
                const initialQuantities = {};

                data.forEach(pkg => {
                    initialCustomizations[pkg._id] = [];
                    initialQuantities[pkg._id] = {};

                    // Initialize quantities for all included customizations
                    if (pkg.includedCustomizations && pkg.includedCustomizations.length > 0) {
                        pkg.includedCustomizations.forEach(custom => {
                            if (custom.hasQuantity) {
                                initialQuantities[pkg._id][custom.id] = custom.quantity || custom.minQuantity || 1;
                            }
                        });
                    }
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
        const selectedCustomizationIds = customizations[packageId] || [];
        const pkg = packages.find(p => p._id === packageId);

        if (!pkg || !pkg.includedCustomizations) return basePrice;

        const additionalCost = selectedCustomizationIds.reduce((total, customId) => {
            const includedCustomization = pkg.includedCustomizations.find(c => c.id === customId);

            if (!includedCustomization) return total;

            const quantity = includedCustomization.hasQuantity
                ? (customizationQuantities[packageId]?.[customId] || includedCustomization.quantity || 1)
                : 1;

            return total + (includedCustomization.price * quantity);
        }, 0);

        return basePrice + additionalCost;
    };

    const handlePrintPackage = (e, packageItem) => {
        e.stopPropagation();
        setPackageToPrint(packageItem);
        setPrintModalOpen(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('print-container');
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;

        // Reinstantiate React after printing
        window.location.reload();
    };

    const handleBookNow = (packageItem) => {
        if (!currentUser) {
            setShowLoginDialog(true);
            setPendingPackage(packageItem);
            return;
        }

        // Get selected customizations from the package's includedCustomizations
        const selectedCustomizationDetails = (customizations[packageItem._id] || []).map(customId => {
            const customOption = packageItem.includedCustomizations?.find(c => c.id === customId);
            if (!customOption) return null;

            const quantity = customOption.hasQuantity
                ? (customizationQuantities[packageItem._id]?.[customId] || customOption.quantity || 1)
                : 1;

            const totalPrice = customOption.price * quantity;

            return {
                id: customOption.id,
                name: customOption.name,
                quantity: quantity,
                unitPrice: customOption.price,
                totalPrice: totalPrice,
                details: customOption.hasQuantity
                    ? `${quantity} ${customOption.unit}${quantity > 1 ? 's' : ''} (${customOption.unitDescription || ''})`
                    : customOption.description
            };
        }).filter(Boolean); // Remove any null values

        // Pass package data to booking page via React Router state
        navigate('/booking', {
            state: {
                selectedPackage: {
                    _id: packageItem._id,
                    name: packageItem.packagename,
                    type: packageItem.packageType || 'Event',  // Add package type
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
        : packages.filter(pkg =>
            pkg.packageType?.toLowerCase() === filterCategory ||
            (!pkg.packageType && filterCategory === 'event')
        );

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
                        className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${filterCategory === 'all'
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                    >
                        All Packages
                    </button>

                    {packageTypeOptions.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterCategory(type.toLowerCase())}
                            className={`m-1 px-4 py-2 rounded-md transition-colors duration-200 ${filterCategory === type.toLowerCase()
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content section with all package cards */}
            <main className="container mx-auto px-6 py-16 flex-grow bg-white">
                {filteredPackages.length === 0 ? (
                    <div className="text-center py-20">
                        <svg className="w-20 h-20 mx-auto text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-6 text-2xl font-medium text-gray-900">No packages found</h3>
                        <p className="mt-2 text-gray-500">Try selecting a different category or check back later</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPackages.map(pkg => (
                            <div
                                key={pkg._id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                {/* Package header */}
                                <div className="bg-gray-900 px-6 py-7 rounded-t-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-xl font-medium mb-4">
                                                {pkg.packageType || "Event"}
                                            </span>
                                            <h3 className="text-xl font-bold text-white">{pkg.packagename}</h3>
                                        </div>
                                        <div className="px-4 py-2 rounded-md text-amber-500 text-xl font-semibold shadow-sm">
                                            Rs.{pkg.packagePrice}
                                        </div>
                                    </div>
                                </div>

                                {/* Package details */}
                                <div className="px-6 py-4">
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {pkg.packageDetails}
                                    </p>

                                    <div className="flex items-center text-xs text-gray-500 mb-5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Valid until: {new Date(pkg.packagevalidity).toLocaleDateString()}
                                    </div>

                                    <div className="border-t border-gray-100 my-4"></div>

                                    {/* Package customization options */}
                                    {pkg.includedCustomizations && pkg.includedCustomizations.length > 0 && (
                                        <div className="mt-6">
                                            <div className="flex items-center mb-4">
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                                <p className="mx-3 text-sm font-medium text-gray-800 uppercase tracking-wider">Enhance Your Package</p>
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                            </div>

                                            <div className="space-y-3">
                                                {pkg.includedCustomizations.map(custom => {
                                                    const isSelected = customizations[pkg._id]?.includes(custom.id);

                                                    return (
                                                        <div
                                                            key={custom.id}
                                                            className={`border rounded-xl py-2 transition-all duration-300 cursor-pointer relative ${isSelected ? 'border-amber-300 bg-amber-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                                                            onClick={() => handleCustomizationToggle(pkg._id, custom.id)}
                                                        >
                                                            {/* Hidden checkbox for accessibility and functionality */}
                                                            <input
                                                                id={`custom-${pkg._id}-${custom.id}`}
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => { }}
                                                                className="sr-only" // Visually hidden
                                                            />

                                                            {/* Status indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-0 right-0 w-0 h-0 border-t-16 border-r-16 border-t-amber-500 border-r-transparent transform -translate-y-1 translate-x-1">
                                                                    <svg className="absolute top-0 right-3 w-3 h-3 text-white transform -translate-y-6 translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}

                                                            <div className="p-3">
                                                                <div className="flex items-start">
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <label htmlFor={`custom-${pkg._id}-${custom.id}`} className="text-sm font-medium text-gray-800 cursor-pointer">
                                                                                {custom.name}
                                                                            </label>
                                                                            <span className="text-sm font-semibold text-amber-500">+Rs.{custom.price}</span>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-1">{custom.description}</p>
                                                                    </div>
                                                                </div>

                                                                {custom.hasQuantity && isSelected && (
                                                                    <div className="mt-3 flex justify-end">
                                                                        <div className="inline-flex items-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Prevent triggering the parent onClick
                                                                                    const currentQuantity = customizationQuantities[pkg._id]?.[custom.id] || custom.quantity || 1;
                                                                                    if (currentQuantity > (custom.minQuantity || 1)) {
                                                                                        handleQuantityChange(pkg._id, custom.id, currentQuantity - 1);
                                                                                    }
                                                                                }}
                                                                                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                                                                </svg>
                                                                            </button>

                                                                            <span className="px-4 py-1 text-sm font-medium text-gray-700">
                                                                                {customizationQuantities[pkg._id]?.[custom.id] || custom.quantity || 1} {custom.unit}
                                                                                {(customizationQuantities[pkg._id]?.[custom.id] || custom.quantity || 1) > 1 ? 's' : ''}
                                                                            </span>

                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Prevent triggering the parent onClick
                                                                                    const currentQuantity = customizationQuantities[pkg._id]?.[custom.id] || custom.quantity || 1;
                                                                                    if (currentQuantity < (custom.maxQuantity || 5)) {
                                                                                        handleQuantityChange(pkg._id, custom.id, currentQuantity + 1);
                                                                                    }
                                                                                }}
                                                                                className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total price section */}
                                    {customizations[pkg._id]?.length > 0 && (
                                        <div className="flex justify-between items-center mt-5 bg-gray-50 p-3 rounded-lg">
                                            <div>
                                                <p className="text-xs text-gray-500">Base price</p>
                                                <p className="text-sm font-medium text-gray-900">Rs.{pkg.packagePrice}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Total with add-ons</p>
                                                <p className="text-base font-semibold text-amber-500">
                                                    Rs.{calculateTotalPrice(pkg.packagePrice, pkg._id)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="px-8 pb-6 pt-2">
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={(e) => handlePrintPackage(e, pkg)}
                                            className="flex-1 px-2 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleBookNow(pkg)}
                                            className="flex-1 px-2 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />

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

            {/* Print modal */}
            {printModalOpen && packageToPrint && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-900">Package Details</h3>
                            <button
                                onClick={() => setPrintModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div id="print-container" className="p-3">
                            <div className="text-center mb-3 border-b pb-3">
                                <h2 className="text-2xl font-bold text-gray-900">{packageToPrint.packagename}</h2>
                                <p className="text-gray-500 mt-1">{packageToPrint.packageType || "Event Package"}</p>
                                <div className="mt-1 text-xl font-bold text-amber-600">${packageToPrint.packagePrice}</div>
                            </div>

                            <div className="mb-3">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">Package Details</h4>
                                <p className="text-gray-700 whitespace-pre-line">{packageToPrint.packageDetails}</p>
                            </div>

                            <div className="mb-3">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">Package Validity</h4>
                                <p className="text-gray-700">Valid until: {new Date(packageToPrint.packagevalidity).toLocaleDateString()}</p>
                            </div>

                            {packageToPrint.includedCustomizations && packageToPrint.includedCustomizations.length > 0 && (
                                <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Available Add-ons</h4>
                                    <div className="space-y-2">
                                        {packageToPrint.includedCustomizations.map(custom => (
                                            <div key={custom.id} className="flex items-start border-b border-gray-100 pb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{custom.name}</p>
                                                    <p className="text-sm text-gray-600">{custom.description}</p>
                                                    {custom.hasQuantity && (
                                                        <p className="text-sm text-gray-500">
                                                            Available: {custom.minQuantity} - {custom.maxQuantity} {custom.unit}
                                                            {custom.maxQuantity > 1 ? 's' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-amber-600">+${custom.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 text-center text-gray-500 text-xs">
                                <p>For booking or more information, please contact us:</p>
                                <p className="mt-1">Phone: +94-72-190-8494 | Email: info@dreamworkstudio.com</p>
                                <p className='text-xs'>Visit Us: DreamWork Studio, Yampanwatta, 2nd Lane, Badulla, Sri Lanka.</p>
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Package Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewPackages;