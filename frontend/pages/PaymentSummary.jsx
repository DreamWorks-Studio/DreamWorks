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
        // If we have booking details passed from BookingPage
        if (passedBookingDetails && passedPackage && passedUser) {
            // Format the data to match the expected structure in the render
            setBookingDetails({
                _id: passedBookingDetails._id,
                date: passedBookingDetails.date,
                package: {
                    name: passedPackage.packageType,
                    price: passedPackage.price
                },
                user: {
                    id: passedUser.id,
                    email: passedUser.email
                },
                totalAmount: passedPackage.price * 1.05 + 1000
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
            if (bookingDetails && bookingDetails.package && bookingDetails.package.price) {
                totalAmount = (bookingDetails.package.price || 0) * 1.05 + 1000;
            }
            
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
                        userId: userId
                    })
                });
                
                if (selectMethodResponse.status === 200) {
                    const selectMethodData = await selectMethodResponse.json();
                    
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

                    navigate('/gateway', {
                        state: {
                            bookingId: bookingId,
                            bookingDetails : {
                                ...bookingDetails,
                                _id: bookingId
                            },
                            packageName: passedPackage?.packageType, // Pass the package name
                            userId: passedUser?.id, // Pass the user id
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
    

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={3000} />
            <main className="flex-1 py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="bg-white shadow-lg rounded-4xl overflow-hidden">
                        <div className="md:grid md:grid-cols-12">
                            <div className="md:col-span-5 bg-gradient-to-br from-gray-950 to-gray-900 text-white p-8">
                                <h2 className="text-xl font-bold mb-6">Booking Summary</h2>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex justify-between items-center py-3">
                                            <ClipLoader color="#FFF" size={16} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center border-b border-amber-500 border-opacity-30 py-3">
                                                <span className="text-blue-100">Package</span>
                                                <span className="font-medium">{bookingDetails?.package?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-amber-500 border-opacity-30 py-3">
                                                <span className="text-blue-100">Email</span>
                                                <span className="font-medium">{bookingDetails?.user?.email}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-amber-500 border-opacity-30 py-3">
                                                <span className="text-blue-100">Date</span>
                                                <span className="font-medium">{bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString() : ''}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold mb-6 mt-10">Payment Summary</h2>
                                <div className="space-y-4">
                                {loading ? (
                                    <ClipLoader color="#FFF" size={16} />
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-blue-100">Package Price:</span>
                                            <span className="font-medium">Rs.{(bookingDetails?.package?.price || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-blue-100">TAX (5%):</span>
                                            <span className="font-medium">Rs.{((bookingDetails?.package?.price || 0) * 0.05).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-blue-100">Booking Fee:</span>
                                            <span className="font-medium">Rs.1000.00</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-base pt-3 border-t mt-2">
                                            <span>Total:</span>
                                            <span className="text-lg font-bold">
                                                Rs.{(((bookingDetails?.package?.price || 0) * 1.05 + 1000).toFixed(2))}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            </div>

                            <div className="md:col-span-7 p-10 pt-30">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Choose Payment Method</h2>

                                <div className="space-y-4">
                                    <div 
                                        className={`rounded-3xl border-2 ${paymentMethod === 'card' ? 'border-amber-600' : 'border-gray-200'} p-5 cursor-pointer transition-all duration-200 hover:shadow-md`}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <div className="flex items-center mb-4">
                                            <input 
                                                type="radio" 
                                                name="paymentMethod" 
                                                value="card" 
                                                checked={paymentMethod === 'card'} 
                                                onChange={() => setPaymentMethod('card')} 
                                                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <label className="ml-3 block text-lg font-medium text-gray-700">
                                                Card Payment
                                            </label>
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <div className="ml-8 space-y-3 text-gray-700">
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

                                    <div 
                                        className={`rounded-3xl border-2 ${paymentMethod === 'cash' ? 'border-amber-600' : 'border-gray-200'} p-5 cursor-pointer transition-all duration-200 hover:shadow-md`}
                                        onClick={() => setPaymentMethod('cash')}
                                    >
                                        <div className="flex items-center mb-4">
                                            <input 
                                                type="radio" 
                                                name="paymentMethod" 
                                                value="cash" 
                                                checked={paymentMethod === 'cash'} 
                                                onChange={() => setPaymentMethod('cash')} 
                                                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            />
                                            <label className="ml-3 block text-lg font-medium text-gray-700">
                                                Cash Payment
                                            </label>
                                        </div>
                                        {paymentMethod === 'cash' && (
                                            <div className="ml-8 space-y-3 text-gray-700">
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
                                </div>

                                <div className="mt-8">
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={handlePayment}
                                            disabled={processingPayment}
                                            className={`bg-gray-900 hover:bg-gray-950 text-white font-medium rounded-lg px-5 py-3 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 cursor-pointer ${processingPayment ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {processingPayment ? (
                                                <span className="flex items-center">
                                                    <ClipLoader color="#FFF" size={16} />
                                                    <span className="ml-2">Processing...</span>
                                                </span>
                                            ) : (
                                                paymentMethod === 'card' ? 'Proceed to Payment' : 'Generate Invoice'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Popup for Invoice */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-500 bg-opacity-75">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Payment Recorded Successfully</h3>
                        <p className="mb-6 text-gray-600">
                            Your cash payment has been recorded in our system. Please download the invoice and bring it when you visit our studio for payment.
                        </p>
                        <div className="flex flex-col space-y-4">
                            <a
                                href={invoiceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                        console.log('Attempting to download from:', invoiceLink);

                                        if(!invoiceLink) {
                                            throw new Error('Invoice Url is not available!');
                                        }

                                        const url = new URL(invoiceLink);

                                        const response = await fetch(url.toString(), {
                                            method: 'GET',
                                            headers: {
                                                'Accept': 'application/pdf'
                                            }
                                        });
                                        {/*const response = await fetch(invoiceLink, {
                                            method: 'GET',
                                            headers: {
                                                'Accept': 'application/pdf',
                                                'Content-Type': 'application/pdf'
                                            }
                                        });*/}

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
                                    navigate('/'); // Navigate to dashboard or appropriate page
                                }} 
                                className="text-gray-700 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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