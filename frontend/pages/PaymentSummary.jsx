import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentSummary = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [showPopup, setShowPopup] = useState(false);
    const [invoiceLink, setInvoiceLink] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract data from location state
    const passedBookingDetails = location.state?.bookingDetails;
    const passedPackage = location.state?.package;
    const passedUser = location.state?.user;
    
    // Get bookingId from the passed booking details
    const bookingId = passedBookingDetails?._id;
    const userId = passedUser?.id;

    useEffect(() => {
        console.log("Passed booking details:", passedBookingDetails);
        console.log("Passed package:", passedPackage);
        console.log("Passed user:", passedUser);
        console.log("Package price specifically:", passedPackage?.price);

        // If we have booking details passed from BookingPage
        if (passedBookingDetails && passedPackage) {
            // Ensure the price is a number - this is important
            const packagePrice = Number(passedPackage.price) || 0;
            console.log("Converted package price:", packagePrice);
            
            // Format the data to match the expected structure in the render
            setBookingDetails({
                _id: passedBookingDetails._id,
                date: passedBookingDetails.date,
                package: {
                    name: passedPackage.packageType,
                    price: packagePrice // Use the converted number
                },
                user: {
                    id: passedUser?.id || "",
                    email: passedUser?.email || ""
                },
                totalAmount: packagePrice * 1.05 + 1000 // Calculate with the number
            });
            setLoading(false);
            return;
        }
    
        // Fallback: try to fetch booking details if not passed directly
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                const userId = location.state?.userId || passedUser?.id;
    
                if (userId) {
                    const response = await fetch(`http://localhost:5003/api/booking/display-summary/${userId}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    
                    const data = await response.json();
    
                    if (data && data.bookings.length > 0) {
                        const booking = data.bookings[0];
                        const packagePrice = booking.package?.price || 0;
                        
                        setBookingDetails({
                            ...booking,
                            user: data.user,
                            totalAmount: packagePrice * 1.05 + 1000
                        });
                    } else {
                        setBookingDetails(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
                setBookingDetails(null);
            } finally {
                setLoading(false);
            }
        };
    
        if (!bookingDetails) {
            fetchBookingDetails();
        }
    }, [passedBookingDetails, passedPackage, passedUser, location.state]);
    
    
    const handlePayment = async () => {
        if (!bookingId) {
            alert("No booking information found!");
            return;
        }
        setProcessingPayment(true);
        
        try {
            let totalAmount = 0;
            let packageId = null;
            let packagePrice = 0;

            if (bookingDetails && bookingDetails.package && bookingDetails.package.price) {
                packagePrice = Number(bookingDetails.package.price);
                totalAmount = packagePrice * 1.05 + 1000;
            }

            packageId = passedBookingDetails?.packageId ||
                (bookingDetails?.package?.id) ||
                (passedPackage?._id);

            console.log("Payment details being sent:", {
                bookingId,
                userId,
                packageId,
                packagePrice,
                totalAmount
            });
            
            if (paymentMethod === "cash") {
                // First, store the payment method selection
                const selectMethodResponse = await fetch("http://localhost:5003/api/payments/select-method", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bookingId,
                        paymentMethod: "cash",
                        userId: userId,
                        packageId: packageId,
                        packagePrice: packagePrice
                    })
                });
                
                if (selectMethodResponse.status === 201) {
                    // Then generate the invoice
                    const invoiceResponse = await fetch("http://localhost:5003/api/payments/generate-invoice", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            paymentMethod: "cash",
                            bookingId
                        })
                    });
                    
                    if (!invoiceResponse.ok) {
                        throw new Error(`Invoice generation failed: ${invoiceResponse.status}`);
                    }
                    
                    const invoiceData = await invoiceResponse.json();
                    setInvoiceLink(`http://localhost:5003/api/payments/invoices/${invoiceData.filename}`);
                    setShowPopup(true);
                } else {
                    const errorData = await selectMethodResponse.json();
                    alert(`Failed to process cash payment: ${errorData.message || "Please try again."}`);
                }
            } else if (paymentMethod === "card") {
                // First, store the payment method selection
                const selectMethodResponse = await fetch("http://localhost:5003/api/payments/select-method", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        bookingId,
                        paymentMethod: "card",
                        userId: userId,
                        packageId: packageId,  
                        packagePrice: packagePrice
                    })
                });
                
                if (selectMethodResponse.status === 200) {
                    const selectMethodData = await selectMethodResponse.json();
                    
                    // Log what's being sent to the payment processing API
                    console.log("Payment process data:", {
                        paymentMethod: "card",
                        bookingId,
                        userId
                    });
                    
                    // Then proceed to payment gateway
                    const paymentResponse = await fetch("http://localhost:5003/api/payments/payment-process", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            paymentMethod: "card",
                            bookingId
                        })
                    });
                    
                    if (!paymentResponse.ok) {
                        throw new Error(`Payment initialization failed: ${paymentResponse.status}`);
                    }
                    
                    const paymentData = await paymentResponse.json();
                    
                    if (paymentData.payment && paymentData.payment._id) {
                        localStorage.setItem('currentPaymentId', paymentData.payment._id);
                    }
                    
                    console.log("Booking Details before navigation:", bookingDetails);
                    console.log("Package info being passed:", {
                        packageId: passedBookingDetails?.packageId || passedPackage?._id,
                        packagePrice: bookingDetails?.package?.price || passedPackage?.price
                    });

                    navigate('/gateway', {
                        state: {
                            bookingId: bookingId,
                            bookingDetails: {
                                ...bookingDetails,
                                _id: bookingId,
                                packageId: passedBookingDetails?.packageId || passedPackage?._id, 
                                package: {
                                    ...(bookingDetails.package || {}),
                                    price: bookingDetails.package?.price || passedPackage?.price,
                                    id: passedBookingDetails?.packageId || passedPackage?._id,
                                    _id: passedBookingDetails?.packageId || passedPackage?._id,
                                    name: bookingDetails?.package?.name || passedPackage?.packageType
                                },
                                user: {
                                    id: passedUser?.id,
                                    email: passedUser?.email
                                }
                            },
                            packageId: passedBookingDetails?.packageId || passedPackage?._id,
                            packagePrice: Number(bookingDetails?.package?.price) || Number(passedPackage?.price) || 0,
                            packageName: passedPackage?.packageType,
                            userId: passedUser?.id,
                            paymentMethod: "card",
                            totalAmount
                        }
                    });
                    
                } else {
                    const errorData = await selectMethodResponse.json();
                    alert(`Failed to process card payment: ${errorData.message || "Please try again."}`);
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert(`Failed to process ${paymentMethod} payment: ${error.message || "Unknown error"}`);
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
    {/* Top decorative element */}
    <ToastContainer position="top-right" />
    
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
                                Choose Payment Method
                            </h1>
                        </div>
                        <p className="text-gray-400 ml-5">
                            Select your preferred payment method to secure your booking
                        </p>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500 rounded-full opacity-20 blur-md"></div>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* Booking Summary Card */}
                    <section className="relative">
                        <h3 className="text-xl font-bold text-black border-b-3 border-amber-500 inline-block pb-2 mb-6">
                            Booking Summary
                        </h3>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Package</p>
                                        <p className="font-medium">{bookingDetails?.package?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date</p>
                                        <p className="font-medium">
                                            {bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                                        <p className="font-medium">{bookingDetails?.user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Summary */}
                            <div className="p-6 bg-gray-50">
                                <h3 className="text-lg font-medium mb-4 text-gray-800">Payment Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Package Price:</span>
                                        <span className="font-medium">Rs. {(bookingDetails?.package?.price || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">TAX (5%):</span>
                                        <span className="font-medium">Rs. {((bookingDetails?.package?.price || 0) * 0.05).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Booking Fee:</span>
                                        <span className="font-medium">Rs. 1,000.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-300 mt-3">
                                        <span className="text-amber-600 font-semibold">Total Amount:</span>
                                        <span className="text-2xl font-bold text-amber-600">Rs. {((bookingDetails?.package?.price || 0) * 1.05 + 1000).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Payment Method Selection Card */}
                    <section className="relative">
                        <h3 className="text-xl font-bold text-black border-b-3 border-amber-500 inline-block pb-2 mb-6">
                            Payment Method
                        </h3>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-6 space-y-6">
                                {/* Card Payment Option */}
                                <div 
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                                        paymentMethod === 'card' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <div className="flex items-center">
                                        <div className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                            paymentMethod === 'card' ? 'border-amber-500' : 'border-gray-400'
                                        }`}>
                                            {paymentMethod === 'card' && (
                                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Card Payment</p>
                                            <p className="text-sm text-gray-500">Process payment online with secure encryption</p>
                                        </div>
                                    </div>
                                    
                                    {paymentMethod === 'card' && (
                                        <div className="ml-8 mt-4 space-y-3 text-gray-600">
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Process payment online now with secure encryption
                                            </p>
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Flexible options for full or partial payment
                                            </p>
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Instant confirmation and digital receipt
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Cash Payment Option */}
                                <div 
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                                        paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <div className="flex items-center">
                                        <div className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                            paymentMethod === 'cash' ? 'border-amber-500' : 'border-gray-400'
                                        }`}>
                                            {paymentMethod === 'cash' && (
                                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Cash Payment</p>
                                            <p className="text-sm text-gray-500">Pay in person at our studio</p>
                                        </div>
                                    </div>
                                    
                                    {paymentMethod === 'cash' && (
                                        <div className="ml-8 mt-4 space-y-3 text-gray-600">
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Visit our studio for in-person payment
                                            </p>
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Discuss payment plans with our team
                                            </p>
                                            <p className="flex items-center text-sm">
                                                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Downloadable invoice available for your records
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Submit button */}
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={handlePayment}
                                        disabled={processingPayment}
                                        className="px-10 py-4 bg-gray-900 text-white font-medium rounded-lg shadow-lg hover:bg-amber-500  hover:text-gray-900 focus:outline-none transform transition hover:-translate-y-1 relative overflow-hidden group"
                                    >
                                        {processingPayment ? (
                                            <>
                                                <ClipLoader size={20} color="#000000" className="mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            paymentMethod === 'card' ? 'Proceed to Payment' : 'Generate Invoice'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                
                <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
            </div>
        </div>
    </div>

    {/* Popup for Invoice */}
    {showPopup && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Payment Recorded Successfully</h3>
                <p className="mb-6 text-gray-600">
                    Your cash payment has been recorded in our system. Please download the invoice and bring it when you visit our studio for payment.
                </p>
                <div className="flex flex-col space-y-4">
                    <a
                        href={invoiceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white py-3 px-4 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                        onClick={async (e) => {
                            e.preventDefault();
                            try {
                                console.log('Attempting to download from:', invoiceLink);

                                if(!invoiceLink) {
                                    throw new Error('Invoice URL is not available!');
                                }

                                const url = new URL(invoiceLink);

                                const response = await fetch(url.toString(), {
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/pdf'
                                    }
                                });

                                if (!response.ok) {
                                    console.error('Download failed with status:', response.status);
                                    throw new Error(`Failed to download invoice (Status: ${response.status})`);
                                }

                                const blob = await response.blob();
                                const downloadUrl = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = downloadUrl;
                                a.download = `invoice-${bookingId}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);

                                toast.success('Invoice downloaded successfully!');
                            } catch (error) {
                                console.error('Download error:', error);
                                toast.error('Failed to download invoice. Please try again.');
                            }
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Download Invoice
                    </a>
                    <button 
                        onClick={() => {
                            setShowPopup(false);
                            navigate('/profile', {
                                state: {
                                    currentUser: {
                                        id: userId,
                                        email: passedUser?.email,
                                        fullname: passedUser?.fullname
                                    }
                                }
                            }); // Navigate to dashboard or appropriate page
                        }} 
                        className="text-gray-700 py-3 px-4 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                    >
                        Close and Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    )}
</div>
    );
};

export default PaymentSummary;