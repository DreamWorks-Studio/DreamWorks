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
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            <ToastContainer position="top-center" />
            
            {/* Hero section */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-500 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-2">Choose Payment Method</h1>
                    <p className="text-amber-100">Select your preferred payment method to secure your booking</p>
                </div>
            </div>
            
            <div className="container mx-auto max-w-4xl px-4 py-12">
                {/* Booking Summary Card */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl mb-10">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold mb-2">Booking Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Package</p>
                                <p className="font-medium">{bookingDetails?.package?.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Date</p>
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
                                <p className="text-gray-400 text-sm mb-1">Email</p>
                                <p className="font-medium">{bookingDetails?.user?.email}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="p-6 bg-gray-700">
                        <h3 className="text-lg font-medium mb-4">Payment Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Package Price:</span>
                                <span className="font-medium">Rs. {(bookingDetails?.package?.price || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">TAX (5%):</span>
                                <span className="font-medium">Rs. {((bookingDetails?.package?.price || 0) * 0.05).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Booking Fee:</span>
                                <span className="font-medium">Rs. 1,000.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-600 mt-3">
                                <span className="text-amber-300 font-medium">Total Amount:</span>
                                <span className="text-2xl font-bold">Rs. {((bookingDetails?.package?.price || 0) * 1.05 + 1000).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Payment Method Selection Card */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold mb-2">Payment Method</h2>
                        <p className="text-gray-400">Select your preferred payment method</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Card Payment Option */}
                        <div 
                            className={`p-5 rounded border-2 cursor-pointer transition ${
                                paymentMethod === 'card' ? 'border-amber-500 bg-amber-500/20' : 'border-gray-600 hover:border-gray-500'
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
                                    <p className="font-medium">Card Payment</p>
                                    <p className="text-sm text-gray-400">Process payment online with secure encryption</p>
                                </div>
                            </div>
                            
                            {paymentMethod === 'card' && (
                                <div className="ml-8 mt-4 space-y-3 text-gray-300">
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Process payment online now with secure encryption
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Flexible options for full or partial payment
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Instant confirmation and digital receipt
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Cash Payment Option */}
                        <div 
                            className={`p-5 rounded border-2 cursor-pointer transition ${
                                paymentMethod === 'cash' ? 'border-amber-500 bg-amber-500/20' : 'border-gray-600 hover:border-gray-500'
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
                                    <p className="font-medium">Cash Payment</p>
                                    <p className="text-sm text-gray-400">Pay in person at our studio</p>
                                </div>
                            </div>
                            
                            {paymentMethod === 'cash' && (
                                <div className="ml-8 mt-4 space-y-3 text-gray-300">
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Visit our studio for in-person payment
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Discuss payment plans with our team
                                    </p>
                                    <p className="flex items-center text-sm">
                                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Downloadable invoice available for your records
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Submit button */}
                        <div className="mt-8">
                            <button
                                onClick={handlePayment}
                                disabled={processingPayment}
                                className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition duration-200 flex items-center justify-center"
                            >
                                {processingPayment ? (
                                    <>
                                        <ClipLoader size={20} color="#ffffff" className="mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    paymentMethod === 'card' ? 'Proceed to Payment' : 'Generate Invoice'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup for Invoice */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4 text-white">Payment Recorded Successfully</h3>
                        <p className="mb-6 text-gray-300">
                            Your cash payment has been recorded in our system. Please download the invoice and bring it when you visit our studio for payment.
                        </p>
                        <div className="flex flex-col space-y-4">
                            <a
                                href={invoiceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded transition-colors"
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
                                className="text-gray-300 py-3 px-4 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
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