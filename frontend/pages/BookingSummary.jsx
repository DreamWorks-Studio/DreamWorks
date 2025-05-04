import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const BookingSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking;
    const currentUser = location.state?.currentUser;
    const packageDetails = location.state?.packageDetails;
    
    // Add this for debugging
    console.log("Booking data in summary:", booking);
    console.log("User data in summary:", currentUser);
    console.log("Package data in summary:", packageDetails);
    console.log("Package price:", packageDetails?.price); // Specifically log price
    console.log("Addson value specifically:", booking.addson);
    console.log("AddsOn value specifically:", booking.addsOn); 
    
    if (!booking) return <p className="text-center mt-10 text-red-500">No booking data available</p>;
    
    const handleEdit = () => {
        console.log("Editing booking with ID:", booking._id);
        navigate("/booking", { 
            state: { 
                booking: {
                    ...booking,
                    _id: booking._id,
                    userId: currentUser?.id || booking.userId,
                },
                currentUser: currentUser,
                selectedPackage: packageDetails
            } 
        });
    };
    
    // Format the date for display
    const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString() : "Not specified";
    
    // Make sure we have a price value (convert to number to avoid string issues)
    const packagePrice = Number(packageDetails?.price) || Number(booking?.packagePrice) || 0;
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-800">
            {/* Top decorative element */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 opacity-80"></div>

            {/* Background image with pattern overlay */}
            <div
                className="absolute inset-0 opacity-15 mix-blend-overlay"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    filter: 'grayscale(40%)'
                }}
            ></div>

            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-black bg-opacity-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            ></div>
            {/* Main content */}

            <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-black to-black"></div>
                
                <div className="max-w-4xl w-full">
                    {/* Main card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                        {/* Card header with photo strip design */}
                        <div className="bg-black text-white py-8 px-8 relative">
                            <div className="absolute top-0 left-0 right-0 flex">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="flex-1 h-3 bg-amber-500 border-r border-black"></div>
                                ))}
                            </div>
                            
                            <div className="flex items-center mb-1">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 text-black mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold">Booking Summary</h2>
                            </div>
                            
                            <p className="text-gray-400 ml-16">
                                Review and confirm your photography session details
                            </p>
                            
                            {/* Bottom film strip */}
                            <div className="absolute bottom-0 left-0 right-0 flex">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="flex-1 h-3 bg-amber-500 border-r border-black"></div>
                                ))}
                            </div>
                        </div>

                        {/* Content sections */}
                        <div className="p-8 space-y-12">
                            {/* Client information section */}
                            <section className="relative">
                                <h3 className="text-xl font-bold text-black border-b-2 border-amber-500 inline-block pb-2 mb-6">
                                    Client Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name</p>
                                        <p className="font-medium text-lg">{booking.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                                        <p className="font-medium text-lg">{booking.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Telephone</p>
                                        <p className="font-medium text-lg">{booking.telephone}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Session details section - now includes adds-on */}
                            <section className="relative">
                                <h3 className="text-xl font-bold text-black border-b-2 border-amber-500 inline-block pb-2 mb-6">
                                    Session Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                                    <div className="absolute -right-12 -top-12 w-78 h-78 opacity-5 hidden lg:block">
                                        <svg viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" stroke="#000" strokeWidth="8" fill="none" />
                                            <circle cx="50" cy="50" r="20" stroke="#000" strokeWidth="4" fill="none" />
                                            <line x1="5" y1="50" x2="95" y2="50" stroke="#000" strokeWidth="2" />
                                            <line x1="50" y1="5" x2="50" y2="95" stroke="#000" strokeWidth="2" />
                                            <line x1="15" y1="15" x2="85" y2="85" stroke="#000" strokeWidth="2" />
                                            <line x1="15" y1="85" x2="85" y2="15" stroke="#000" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Package Type</p>
                                        <p className="font-medium text-lg">{packageDetails?.name || booking.packageType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Location</p>
                                        <p className="font-medium text-lg">{booking.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date</p>
                                        <p className="font-medium text-lg">{formattedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Time</p>
                                        <p className="font-medium text-lg">{booking.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Additional Requests</p>
                                        <p className="font-medium text-lg">{booking.addson || booking.addsOn || "None"}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Package details section with film frame design */}
                            <section className="relative">
                                <h3 className="text-xl font-bold text-black border-b-2 border-amber-500 inline-block pb-2 mb-6">
                                    Package Details
                                </h3>
                                
                                <div className="bg-black rounded-lg p-6 text-white relative">
                                    {/* Film frame holes */}
                                    <div className="absolute top-3 bottom-3 left-3 flex flex-col justify-between">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        ))}
                                    </div>
                                    
                                    <div className="pl-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Package Name</p>
                                                <p className="font-medium text-lg text-white">{packageDetails?.name || booking.packageType}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Price</p>
                                                <p className="font-medium text-lg text-amber-500">Rs. {packagePrice}</p>
                                            </div>
                                        </div>
                                        {packageDetails?.details && (
                                            <div className="mt-4">
                                                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Description</p>
                                                <p className="font-medium text-white">{packageDetails.details}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Film frame holes - right side */}
                                    <div className="absolute top-3 bottom-3 right-3 flex flex-col justify-between">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            
                            {/* Action buttons with camera shutter design */}
                            <div className="flex flex-col md:flex-row justify-center md:justify-between gap-4 mt-12">
                                <button 
                                    onClick={handleEdit}
                                    className="px-12 py-4 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition group relative overflow-hidden"
                                >
                                    <span className="relative z-10">Edit Details</span>
                                    <span className="absolute inset-0 bg-gray-400 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                                </button>
                                
                                <Link to='/payment' state={{ 
                                    bookingDetails: {
                                        ...booking,
                                        _id: booking._id || "",
                                        date: booking.date,
                                        packageType: booking.packageType,
                                        addson: booking.addson || booking.addsOn || "None",
                                        packageId: booking.packageId
                                    },
                                    package: {
                                        packageType: packageDetails?.name || booking.packageType,
                                        price: packagePrice,
                                        details: packageDetails?.details || "",
                                        _id: booking.packageId
                                    }, 
                                    user: {
                                        id: currentUser?.id || "",
                                        email: currentUser?.email || booking.email,
                                        fullName: currentUser?.fullName || booking.fullName
                                    }
                                }}>
                                    <button className="px-12 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 transition relative overflow-hidden group">
                                        <span className="relative z-10">Confirm & Proceed</span>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity">
                                            <svg className="w-24 h-24" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="45" stroke="#fff" strokeWidth="2" fill="none" />
                                                <circle cx="50" cy="50" r="20" stroke="#fff" strokeWidth="1" fill="none" />
                                                <path d="M5,50 95,50" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                                                <path d="M50,5 50,95" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                                                <path d="M20,20 80,80" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                                                <path d="M20,80 80,20" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                                            </svg>
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </div>
                        
                        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
                    </div>
                
                </div>
            </div>
            
        </div>
    );
};

export default BookingSummary;