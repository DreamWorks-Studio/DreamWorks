import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import axios from 'axios';

const PaymentSummary = () => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [showPopup, setShowPopup] = useState(false);
    const [invoiceLink, setInvoiceLink] = useState('');
    const [bookingDetails, setBoookingDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const bookingId = location.state?.bookingId;

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingId) return;
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5004/api/bookings/${bookingId}`);
                setBoookingDetails(response.data);
            } catch (error) {
                console.error("Error fetching booking details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId]);

    const handlePayment = async () => {
        if (paymentMethod === "cash") {
            try {
                const response = await axios.post("http://localhost:5004/api/generate-invoice", {
                    paymentMethod,
                    bookingId,
                });

                setInvoiceLink(`http://localhost:5004${response.data.invoiceUrl}`);
                setShowPopup(true);

            } catch (error) {
                console.error("Error generating invoice:", error);
                alert("Failed to generate invoice");
            }

        } else if (paymentMethod === "card") {
            try {
                const response = await axios.post("http://localhost:5004/api/payment", 
                    {
                        paymentMethod,
                        bookingId,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log("Payment Response:", response.data)
                navigate('/gateway')

            } catch (error) {
                console.error("Payment error:", error);
                alert("Failed to process card payment.");
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
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
                                                <span className="font-medium">Rs.{bookingDetails?.package?.price?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-blue-100">TAX (5%):</span>
                                                <span className="font-medium">Rs.{(bookingDetails.package.price * 0.05).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-blue-100">Booking Fee:</span>
                                                <span className="font-medium">Rs.1000.00</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-base pt-3 border-t mt-2">
                                                <span>Total:</span>
                                                <span className="text-lg font-bold">Rs.{(bookingDetails.package.price * 1.05 + 1000).toFixed(2)}</span>
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
                                        <button onClick={handlePayment}
                                        className="bg-gray-900 hover:bg-gray-950 text-white font-medium rounded-lg px-5 py-3 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 cursor-pointer">
                                            {paymentMethod === 'card' ? 'Proceed' : 'Complete Payment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Thank You!</h2>
                        <p className="text-gray-600 mb-4">
                            Thank you for choosing us! Please download your invoice and make the payment at our studio.
                        </p>
                        <a
                            href={invoiceLink}
                            download
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Download Invoice
                        </a>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div> 
            )}
        </div>
    )
}

export default PaymentSummary;
