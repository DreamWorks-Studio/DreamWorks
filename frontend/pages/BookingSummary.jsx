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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
            {/* Top decorative element */}

            {/* Main content */}
            <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-black to-black"></div>

                <div className="max-w-4xl w-full">
                    {/* Main card */}
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 relative">
                        {/* Card header with photo strip design */}
                        <div className="bg-gray-900 py-10 px-8 relative overflow-hidden">
                            {/* Abstract pattern overlay */}
                            <div className="absolute inset-0 opacity-20">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="diagonalLines" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                            <line x1="0" y1="0" x2="0" y2="10" stroke="#fff" strokeWidth="1" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#diagonalLines)" />
                                </svg>
                            </div>

                            <div className="flex flex-col mb-1 mt-4">
                                <div className="flex items-center">
                                    <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-amber-600 mr-4 rounded-full"></div>
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                                        Booking Details
                                    </h1>
                                </div>
                                <p className="text-gray-400 ml-5">
                                    Complete your payment to confirm your photography session
                                </p>
                            </div>


                            {/* Decorative elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500 rounded-full opacity-20 blur-md"></div>
                        </div>

                        {/* Content sections */}
                        <div className="p-8 space-y-12">
                            {/* Booking summary section */}
                            <section className="relative">
                                <h3 className="text-xl font-bold text-black border-b-2 border-amber-500 inline-block pb-2 mb-6">
                                    Session Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Package Name</p>
                                        <p className="font-medium text-lg">{packageDetails?.name || booking.packageType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Session Date</p>
                                        <p className="font-medium text-lg">{formattedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Session Time</p>
                                        <p className="font-medium text-lg">{booking.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Location</p>
                                        <p className="font-medium text-lg">{booking.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Telephone</p>
                                        <p className="font-medium text-lg">{booking.telephone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Additional Requests</p>
                                        <p className="font-medium text-lg">{booking.addson || booking.addsOn || "None"}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Payment details section with film frame design */}
                            <section className="relative">
                                <h3 className="text-xl font-bold text-black border-b-2 border-amber-500 inline-block pb-2 mb-6">
                                    Package Details
                                </h3>

                                <div className="bg-gray-800 rounded-lg p-6 text-white relative">

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