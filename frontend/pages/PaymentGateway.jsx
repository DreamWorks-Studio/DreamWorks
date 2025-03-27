import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/ReactToastify.css';

const PaymentManagementPage = () => {
  const [paymentType, setPaymentType] = useState('full');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const passedBookingDetails = location.state?.bookingDetails;
  const passedPackage = location.state?.package;
  const passedUser = location.state?.user;
  const passedTotalAmount = location.state?.totalAmount;
  const passedPaymentMethod = location.state?.paymentMethod;
  
  // Get bookingId from the passed booking details
  const bookingId = passedBookingDetails?._id || location.state?.bookingId;
  const userId = passedUser?.id;

  useEffect(() => {
    console.log("Initial state:", bookingDetails);
    console.log("Passed booking details:", passedBookingDetails);
    
    // First, check if we already have booking details set
    if (bookingDetails) {
        return;
    }

    // Handle case when booking details are passed directly
    if (passedBookingDetails) {
        const formattedBookingDetails = {
            _id: passedBookingDetails._id,
            date: passedBookingDetails.date,
            package: {
                name: passedBookingDetails.package?.name || passedPackage?.packageType,
                price: passedBookingDetails.package?.price || passedPackage?.price || 0
            },
            user: {
                id: passedUser?.id || passedBookingDetails.user?.id,
                email: passedUser?.email || passedBookingDetails.user?.email
            },
            totalAmount: passedTotalAmount || 
                ((passedBookingDetails.package?.price || passedPackage?.price || 0) * 1.05 + 1000)
        };
        
        console.log("Setting formatted booking details:", formattedBookingDetails);
        setBookingDetails(formattedBookingDetails);
        setLoading(false);
        return;
    }
  
    // If we have minimal booking information
    if (bookingId && passedTotalAmount && passedUser) {
        const minimalBookingDetails = {
            _id: bookingId,
            user: {
                id: passedUser.id,
                email: passedUser.email,
            },
            package: passedPackage || null,
            totalAmount: passedTotalAmount
        };
        
        console.log("Setting minimal booking details:", minimalBookingDetails);
        setBookingDetails(minimalBookingDetails);
        setLoading(false);
        return;
    }

    // Fallback: fetch booking details if not passed directly
    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const effectiveUserId = userId || location.state?.userId;

            if (!effectiveUserId) {
                throw new Error("No user ID available to fetch booking details");
            }

            const response = await fetch(`http://localhost:5003/api/booking/display-summary/${effectiveUserId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();

            if (data?.bookings?.[0]) {
                const booking = data.bookings[0];
                const packagePrice = booking.package?.price || 0;
                
                const fetchedBookingDetails = {
                    _id: booking._id,
                    date: booking.date,
                    package: booking.package,
                    user: {
                        id: data.user.id,
                        email: data.user.email
                    },
                    totalAmount: packagePrice * 1.05 + 1000
                };

                console.log("Setting fetched booking details:", fetchedBookingDetails);
                setBookingDetails(fetchedBookingDetails);
            }
        } catch (error) {
            console.error("Error fetching booking details:", error);
            // Set fallback booking details
            const fallbackDetails = {
                _id: bookingId || `fallback-${Date.now()}`,
                user: {
                    id: userId || location.state?.userId || "fallback-user",
                    email: passedUser?.email || "fallback@email.com"
                },
                totalAmount: passedTotalAmount || 0
            };
            console.log("Setting fallback booking details:", fallbackDetails);
            setBookingDetails(fallbackDetails);
        } finally {
            setLoading(false);
        }
    };

    // Only fetch if we don't have any booking details
    if (!bookingDetails && !passedBookingDetails) {
        fetchBookingDetails();
    }
}, [bookingId, passedBookingDetails, passedPackage, passedUser, passedTotalAmount, userId, location.state]);

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {
      paymentType: 'full',
      amount: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      saveCard: false,
    }
  });

  const watchAmount = watch('amount');
  const watchSaveCard = watch('saveCard');
  const cardDetailsEntered = watch('cardNumber') && watch('expiry') && watch('cvc'); 

  const onSubmit = async (data) => {
    console.log('Form submission - bookingDetails:', bookingDetails);

    const effectiveBookingId = bookingDetails?._id || location.state?.bookingId;
    
    // More detailed validation to help identify the specific issue
    if (!bookingDetails?._id) {
      console.error('Invalid booking details:', bookingDetails);
      toast.error('Missing booking information. Please try again.');
      return;
  }
    
    if (!bookingDetails._id) {
      console.error('bookingDetails._id is missing', bookingDetails);
      toast.error('Booking ID is missing. Please try again.');
      return;
    }
    
    if (!bookingDetails.user?.id) {
      console.error('bookingDetails.user.id is missing', bookingDetails);
      toast.error('User information is incomplete. Please try again.');
      return;
    }
  
    try {
      setSubmitting(true);
  
      // Calculate the amount to be paid based on payment type
      const amountPaid = paymentType === 'full' 
        ? bookingDetails.totalAmount 
        : parseFloat(data.amount);

      
      if(paymentType === 'partial') {
        if (isNaN(amountPaid)) {
          throw new Error('Please enter a valid amount');
        }

        if(amountPaid < 3000) {
          throw new Error('Minimum partial payment amount is Rs.3000.00')
        }

        if(amountPaid > bookingDetails.totalAmount) {
          throw new Error('Minimum amount cannot exceed total amount due')
        }
      }  
      
      // Prepare request payload
      const paymentData = {
        bookingId: effectiveBookingId || `recovery-${Date.now()}`,
        userId: bookingDetails.user.id,
        paymentType: paymentType,
        paymentStatus: paymentType === 'full' ? 'paid' : 'partial',
        amountPaid: amountPaid,
        cardNumber: data.cardNumber.replace(/\s/g, ''), // Remove spaces from card number
        expiryDate: data.expiry,
        cvc: data.cvc,
        isCardSaved: paymentType === 'partial' && data.saveCard,
        totalAmount: bookingDetails.totalAmount,
        remainingAmount: paymentType === 'full' ? 0 : bookingDetails.totalAmount - amountPaid
        
        /*cardStorage: paymentType === 'partial' && data.saveCard ? {
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          expirDate: data.expiry,
          lastFourDigits: lastFourDigits,
          userId:bookingDetails.user.id,
          bookingId: effectiveBookingId
        } : null*/

      };
  
      console.log('Sending payment data:', {
        ...paymentData,
        cardNumber: '*'.repeat(12) + paymentData.cardNumber.slice(-4),
        cvc: '***'
      });
      
      // Use fetch instead of axios
      const response = await fetch('http://localhost:5003/api/payments/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Payment successful:', result);
      
      let successMessage = paymentType === 'full'
      ? 'Full payment was successful! Thank you for your purchase.'
      : `Partial payment of Rs.${amountPaid.toFixed(2)} successful! Your card has been charged and your booking is confirmed.`;
      
      if (paymentType === 'partial' && data.saveCard) {
        successMessage += 'Your card has been saved for future payments.';
      }

      toast.success(successMessage);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      value = value.match(/.{1,4}/g).join(' ');
    }
    e.target.value = value.substring(0, 19); 
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value.substring(0, 5);
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="flex-1 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-4xl overflow-hidden">
            <div className="md:grid md:grid-cols-12">
              <div className="md:col-span-5 bg-gradient-to-br from-gray-950 to-gray-900 text-white p-8">
                <h2 className="text-2xl font-bold mb-6 mt-22">
                  Payment Summary
                </h2>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-blue-100">Package Price:</span>
                    <span className="font-medium">
                      {loading ? (
                        <ClipLoader color="#FFF" size={16} />
                      ) : (
                        `Rs.${(bookingDetails?.package?.price || 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-blue-100">TAX (5%):</span>
                    <span className="font-medium">
                      {loading ? (
                        <ClipLoader color="#FFF" size={16} />
                      ) : (
                        `Rs.${((bookingDetails?.package?.price || 0) * 0.05).toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-blue-100">Booking Fee:</span>
                    <span className="font-medium">Rs.1000.00</span>
                  </div>
                  <div className="flex justify-between font-medium pt-3 border-t mt-2">
                    <span>Total:</span>
                    <span className="text-lg font-bold">
                      {loading ? (
                        <ClipLoader color="#FFF" size={16} />
                      ) : (
                        `Rs.${(bookingDetails?.totalAmount || 0).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-7 p-10 pt-20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  Card Payment Details
                </h2>
                <div className="border-b border-gray-200 mb-6"></div>
                <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="space-y-6">
                    <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-white transition-all hover:shadow-md">
                        <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pay Amount</h2>
                        <div className='space-y-4'>
                            <label className='flex items-center'>
                                <input type="radio" name="paymentType" value="full" {...register('paymentType')} checked={paymentType === 'full'} onChange={() => setPaymentType('full')}
                                className='h-5 w-5 text-amber-600 focus:ring-amber-600 border-gray-300'/>
                                <span className='ml-3 text-gray-700'>Full Payment</span>
                            </label>
                            <label className='flex items-center'>
                                <input type="radio" name="paymentType" value="partial" {...register('paymentType')} checked={paymentType === 'partial'} onChange={() => setPaymentType('partial')}
                                className='h-5 w-5 text-amber-600 focus:ring-amber-600 border-gray-300'/>
                                <span className='ml-3 text-gray-700'>Partial Payment</span>
                            </label>

                            {paymentType === 'partial' && (
                                <div className='mt-3 pl-8'>
                                    <div className='relative'>
                                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                            <span className='text-gray-500 sm:text-sm'>Rs.</span>
                                        </div>
                                        <input type="text" placeholder="Enter Amount" {...register('amount', { 
                                         required: 'Amount is required',
                                         min: {
                                          value: 3000,
                                          message: 'Amount must be at least Rs.3000.00'
                                        },
                                        pattern: {
                                          value: /^[0-9]+$/,
                                          message: 'Please enter a valid amount'
                                        }
                                        })}
                                        className={`pl-12 block w-full border-gray-300 rounded-lg shadow-sm sm:text-sm transition-all focus:outline-none focus:ring-1 focus:ring-amber-600 hover:border-gray-400 py-3
                                          ${errors.amount ? 'border-red-500' : ''}`}/>
                                    </div>
                                    {errors.amount && <p className='mt-2 text-sm text-red-600'>{errors.amount.message}</p>}
                                    <p className='mt-2 text-sm text-gray-500 flex items-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>Minimum Payment: Rs.3000.00
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='border border-gray-100 rounded-xl p-6 shadow-sm bg-white transition-all hover:shadow-md'>
                        <h2 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Card Details
                        </h2>
                        <div className='space-y-4'>
                            <div>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    </div>
                                    <input type="text" placeholder='Card Number' {...register('cardNumber', { 
                                        required: 'Card number is required',
                                        minLength: {
                                        value: 19,
                                        message: 'Please enter a valid card number'
                                       },
                                      onChange: handleCardNumberChange
                                      })}
                                      className={`pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-600 sm:text-sm transition-all hover:border-gray-400 py-3
                                        ${errors.cardNumber ? 'border-red-500' : ''}`}/>
                                </div>
                                {errors.cardNumber && <p className='mt-2 text-sm text-red-600'>{errors.cardNumber.message}</p>}
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='flex flex-col'>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    </div>
                                    <input type="text" placeholder='MM/YY' {...register('expiry', { 
                                      required: 'Expiry date is required',
                                      pattern: {
                                        value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                        message: 'Please enter a valid expiry date (MM/YY)'
                                       },
                                       validate: {
                                        future: (value) => {
                                          if (!value) return true;
                                        const [month, year] = value.split('/');
                                        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                                        return expiryDate > new Date() || 'Card has expired';
                                        }
                                        },
                                        onChange: handleExpiryChange
                                      })}
                                      className={`pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-600 sm:text-sm transition-all hover:border-gray-400 py-3
                                        ${errors.expiry ? 'border-red-500' : ''}`}/>
                                </div>
                                {errors.expiry && <p className='mt-1 text-sm text-red-600'>{errors.expiry.message}</p>}
                                </div>
                                <div className='flex flex-col'>
                                <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    </div>
                                    <input type="text" placeholder='CVC' {...register('cvc', { 
                                      required: 'CVC is required',
                                      pattern: {
                                      value: /^[0-9]{3}$/,
                                      message: 'Please enter a valid CVC'
                                       }
                                      })}
                                      className={`pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-600 sm:text-sm transition-all hover:border-gray-400 py-3
                                        ${errors.cvc ? 'border-red-500' : ''}`}
                                        maxLength={4}/>
                                </div>
                                {errors.cvc && <p className='mt-1 text-sm text-red-600'>{errors.cvc.message}</p>}
                                </div>
                            </div>
                            {paymentType === 'partial' && cardDetailsEntered && (
                          <div className="flex items-center mt-4">
                            <input
                              type="checkbox"
                              id="saveCard"
                              {...register('saveCard')}
                              className="h-5 w-5 text-amber-600 focus:ring-amber-600 border-gray-300"
                            />
                            <label htmlFor="saveCard" className="ml-2 text-gray-700">
                              Save this card for future payments
                            </label>
                          </div>
                        )}
                        </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all cursor-pointer"
                    disabled={submitting || (paymentType === 'partial' && (!watchAmount || parseFloat(watchAmount) < 3000 || errors.amount))}>
                    {submitting ? 
                      <ClipLoader color="#FFF" size={16} /> : 
                      'Pay Now'}
                  </button>
                </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentManagementPage;