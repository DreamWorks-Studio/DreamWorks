import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from 'react-toastify';

import 'react-toastify/ReactToastify.css';

const PaymentGateway = () => {
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
  const passedPackageId = location.state?.packageId;
  const passedPackagePrice = location.state?.packagePrice;
  const isRemainingPayment = location.state?.isRemainingPayment;
  const defaultCard = location.state?.defaultCard;
  const [selectedCardId, setSelectedCardId] = useState(defaultCard?.id || null);


  // Get bookingId from the passed booking details
  const bookingId = passedBookingDetails?._id || location.state?.bookingId;
  const userId = passedUser?.id;

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = useForm({
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
  
  useEffect(() => {
    console.log("Initial state:", bookingDetails);
    console.log("Passed booking details:", passedBookingDetails);
    console.log("Package ID from location:", passedBookingDetails?.packageId || location.state?.packageId);
    console.log("Passed package ID:", passedPackageId);
    console.log("Passed package price:", passedPackagePrice);
    
    // First, check if we already have booking details set
    if (bookingDetails) {
        return;
    }
    // Handle case when booking details are passed directly
    if (passedBookingDetails) {
        const formattedBookingDetails = {
            _id: passedBookingDetails._id,
            date: passedBookingDetails.date,
            packageId: passedBookingDetails.packageId,
            package: {
                name: passedBookingDetails.package?.name || passedPackage?.packageType,
                price: passedBookingDetails.package?.price || passedPackage?.price || 0,
                id: passedBookingDetails.package?.id || passedPackageId // Include package ID
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
            package: {
                id: passedPackageId,
                price: passedPackagePrice || 0
            },
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
                    package: {
                        ...booking.package,
                        id: booking.packageId // Ensure package ID is included
                    },
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
                package: {
                    id: passedPackageId,
                    price: passedPackagePrice || 0
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
  }, [bookingId, passedBookingDetails, passedPackage, passedUser, passedTotalAmount, userId, location.state, passedPackageId, passedPackagePrice]);

  useEffect(() => {
    if (isRemainingPayment && defaultCard) {
      console.log("Default card data:", defaultCard);

      let formattedCardNumber = defaultCard.cardNumber;
      if (formattedCardNumber && !formattedCardNumber.includes(' ') && formattedCardNumber.length === 16) {
        formattedCardNumber = formattedCardNumber.replace(/(.{4})/g, '$1 ').trim();
      }
  
      setValue('cardNumber', formattedCardNumber);
      setValue('expiry', defaultCard.expiryDate);

      setValue('cvc', '');
    }
  }, [isRemainingPayment, defaultCard, setValue]);

  useEffect(() => {
    if (paymentType === 'full') {
      setValue('saveCard', false);
    }
  }, [paymentType, setValue]);

  const watchAmount = watch('amount');
  const watchSaveCard = watch('saveCard');
  const cardDetailsEntered = watch('cardNumber') && watch('expiry') && watch('cvc'); 

  const onSubmit = async (data) => {
    console.log('Form submission - bookingDetails:', bookingDetails);
    
    // Add full location.state debug logging to see what's available
    console.log('Full location.state:', location.state);
    const effectiveBookingId = bookingDetails?._id || location.state?.bookingId;
    
    // Try to find packageId from multiple possible sources
    // This makes the code resilient without hardcoding
    const effectivePackageId = 
        bookingDetails?.packageId ||
        bookingDetails?.package?.id || 
        bookingDetails?.package?._id || 
        location.state?.packageId ||
        location.state?.bookingDetails?.packageId;
    console.log('Effective package ID found:', effectivePackageId);


    const effectivePackagePrice = 
        Number(bookingDetails?.package?.price) || 
        Number(location.state?.packagePrice) || 
        Number(passedPackagePrice) ||
        Number(bookingDetails?.packagePrice) ||
        13500; // Default price as last resort (replace with your actual default)
    
    console.log('Effective package price found:', effectivePackagePrice);
    
    // More detailed validation to help identify the specific issue
    if (!bookingDetails?._id) {
      console.error('Invalid booking details:', bookingDetails);
      toast.error('Missing booking information. Please try again.');
      return;
    }
    
    // Add debug logging for package information
    console.log('Package information:', {
      packageFromBookingDetails: bookingDetails?.package,
      price: bookingDetails?.package?.price,
      id: effectivePackageId
    });
    
    // Check if package ID is missing
    if (!effectivePackageId) {
      console.error('Missing package ID:', bookingDetails);
      toast.error('Package information is incomplete. Please try again.');
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
      const amountPaid = isRemainingPayment
        ? Number(passedTotalAmount) // For remaining payments, use the passed amount directly
        : (paymentType === 'full' 
            ? Number(bookingDetails.totalAmount) 
            : parseFloat(data.amount));
      
      if(paymentType === 'partial' && !isRemainingPayment) {
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
      
      // Prepare request payload with explicit packageId
      const paymentData = {
        bookingId: effectiveBookingId,
        userId: bookingDetails.user.id,
        packageId: effectivePackageId,
        packagePrice: effectivePackagePrice,
        paymentType: isRemainingPayment ? 'full' : paymentType,
        paymentStatus: (isRemainingPayment || paymentType === 'full') ? 'paid' : 'partial',
        amountPaid: isRemainingPayment ? Number(passedTotalAmount) : (paymentType === 'full' ? Number(bookingDetails.totalAmount) : parseFloat(data.amount)),
        totalAmount: Number(bookingDetails.totalAmount) || 0,
        remainingAmount: (isRemainingPayment || paymentType === 'full') ? 0 : Number(bookingDetails.totalAmount) - Number(amountPaid),
        isRemainingPayment: isRemainingPayment,
        isCardSaved: data.saveCard,
      };

      if (data.cardNumber.includes('*') && defaultCard?.id) {
        paymentData.savedCardId = defaultCard.id;
      } else {
        paymentData.cardNumber = data.cardNumber.replace(/\s/g, '');
        paymentData.expiryDate = data.expiry;
      }

      paymentData.cvc = data.cvc;
  
      console.log('Sending payment data:', {
        ...paymentData,
        cardNumber: '*'.repeat(12) + paymentData.cardNumber.slice(-4),
        cvc: '***',
        packageId: paymentData.packageId,
        packagePrice: paymentData.packagePrice
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
      
      // Customize success message based on payment type
      let successMessage;
      if (isRemainingPayment) {
        successMessage = `Payment of Rs.${amountPaid.toFixed(2)} completed successfully! Your booking is now fully paid.`;
      } else if (paymentType === 'full') {
        successMessage = 'Full payment was successful! Thank you for your purchase.';
      } else {
        successMessage = `Partial payment of Rs.${amountPaid.toFixed(2)} successful! Your card has been charged and your booking is confirmed.`;
      }
      
      if ((paymentType === 'partial' || isRemainingPayment) && data.saveCard) {
        try {
          // Save the card details
          const saveCardResponse = await fetch('http://localhost:5003/api/cards/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: bookingDetails.user.id,
              cardNumber: data.cardNumber.replace(/\s/g, ''),
              expiryDate: data.expiry
            })
          });
          if (!saveCardResponse.ok) {
            console.warn('Failed to save card:', await saveCardResponse.text());
          } else {
            console.log('Card saved successfully');
            successMessage += ' Your card has been saved for future payments.';
          }
        } catch (cardError) {
          console.warn('Error saving card:', cardError);
        }
      }
      toast.success(successMessage);
      
      setTimeout(() => {
        navigate('/profile', {
          state: {
            // Pass the full user object from the booking details
            currentUser: {
              id: bookingDetails.user.id
            },
            bookingId: effectiveBookingId,
            fromPayment: true
          }
        });
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

  const handleCVCChange = (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const bookingDate = bookingDetails.date
    ? new Date(bookingDetails.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Not specified';

  
  const getPackageName = () => {
    // Try to get package name from multiple possible places
    return passedBookingDetails?.packageType ||
      bookingDetails?.package?.name ||
      location.state?.packageType ||
      passedPackage?.packageType ||
      'Package';
  };

  const getBookingDate = () => {
    // Try to get date from multiple possible places
    const dateString = passedBookingDetails?.date || bookingDetails?.date;

    if (!dateString) return 'Not specified';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800">
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
                    {isRemainingPayment ? 'Complete Your Payment' : 'Secure Payment'}
                  </h1>
                </div>
                <p className="text-gray-400 ml-5">
                  {isRemainingPayment 
                    ? 'Pay the remaining amount to complete your booking' 
                    : 'Please enter your payment details to secure your booking'
                  }
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500 rounded-full opacity-20 blur-md"></div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Booking Summary Section */}
              <section className="relative">
                <h3 className="text-xl font-bold text-black border-b-3 border-amber-500 inline-block pb-2 mb-6">
                  Booking Summary
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Package name</p>
                        <p className="font-medium text-gray-800">{getPackageName()}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date of booking</p>
                        <p className="font-medium text-gray-800">{getBookingDate()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-600 text-lg font-semibold">Amount to be Pay</span>
                      <span className="text-2xl font-bold text-amber-600">Rs. {isRemainingPayment
                        ? Number(passedTotalAmount).toLocaleString()
                        : Number(bookingDetails?.totalAmount || 0).toLocaleString()
                      }</span>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Payment Details Section */}
              <section className="relative">
                <h3 className="text-xl font-bold text-black border-b-3 border-amber-500 inline-block pb-2 mb-6">
                  Payment Details
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Payment type selection - conditionally show based on payment type */}
                      {!isRemainingPayment ? (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div 
                              onClick={() => setPaymentType('full')}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                                paymentType === 'full' 
                                  ? 'border-amber-500 bg-amber-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  paymentType === 'full' ? 'border-amber-500' : 'border-gray-400'
                                }`}>
                                  {paymentType === 'full' && (
                                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Full Payment</p>
                                  <p className="text-sm text-gray-500">Pay the entire amount now</p>
                                </div>
                              </div>
                            </div>
                            <div 
                              onClick={() => setPaymentType('partial')}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                                paymentType === 'partial' 
                                  ? 'border-amber-500 bg-amber-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`h-5 w-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  paymentType === 'partial' ? 'border-amber-500' : 'border-gray-400'
                                }`}>
                                  {paymentType === 'partial' && (
                                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">Partial Payment</p>
                                  <p className="text-sm text-gray-500">Pay a portion now</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <div className="p-4 rounded border-2 border-amber-500 bg-amber-50">
                            <p className="font-medium text-gray-800">Complete Your Payment</p>
                            <p className="text-sm text-gray-600 mt-1">Pay the remaining amount to complete your booking</p>
                            <p className="text-2xl font-bold mt-2 text-gray-800">Rs. {parseFloat(passedTotalAmount).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Amount field for partial payments */}
                      {paymentType === 'partial' && !isRemainingPayment && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Pay (Minimum Rs.3000)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">Rs.</span>
                            </div>
                            <input
                              type="number"
                              {...register('amount', { 
                                required: 'Amount is required', 
                                min: { value: 3000, message: 'Minimum amount is Rs.3000' } 
                              })}
                              className={`block w-full pl-12 pr-3 py-2 rounded-lg border-2 text-gray-800 bg-white focus:outline-none focus:border-2 focus:border-amber-500 ${
                                errors.amount ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.amount && (
                            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
                          )}
                        </div>
                      )}
                      
                      {/* Card details section */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Card Details</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Number
                            </label>
                            <input
                              {...register('cardNumber', {
                                required: 'Card number is required',
                                validate: (value) => {
                                  if (value.includes('*')) {
                                    return true;
                                  }
                                  const cardWithoutSpaces = value.replace(/\s/g, '');
                                  return cardWithoutSpaces.length === 16 || 'Card number must have 16 digits';
                                }
                              })}
                              onChange={handleCardNumberChange}
                              className={`w-full px-4 py-3 bg-white border-2 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:border-2 focus:border-amber-500 text-gray-800`}
                              placeholder="Card Number"
                              disabled={isRemainingPayment && defaultCard}
                            />
                            {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                {...register('expiry', { 
                                  required: 'Expiry date is required',
                                  pattern: {
                                    value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                    message: 'Must be in MM/YY format'
                                  }
                                })}
                                onChange={handleExpiryChange}
                                className={`block w-full px-3 py-2 rounded-lg border-2 text-gray-800 bg-white focus:outline-none focus:border-2 focus:border-amber-500 ${
                                  errors.expiry ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="MM/YY"
                              />
                              {errors.expiry && (
                                <p className="mt-1 text-sm text-red-500">{errors.expiry.message}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                CVC
                              </label>
                              <input
                                type="text"
                                {...register('cvc', { 
                                  required: 'CVC is required',
                                  pattern: {
                                    value: /^\d{3,4}$/,
                                    message: 'Must be 3 or 4 digits'
                                  }
                                })}
                                onChange={handleCVCChange}
                                className={`block w-full px-3 py-2 rounded-lg border-2 text-gray-800 bg-white focus:outline-none focus:border-2 focus:border-amber-500 ${
                                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="123"
                              />
                              {errors.cvc && (
                                <p className="mt-1 text-sm text-red-500">{errors.cvc.message}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Save card option - show for all payments */}
                          {paymentType === 'partial' && !isRemainingPayment && (
                            <div className="mt-4">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  {...register('saveCard')}
                                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                  Save card for future payments
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Submit button */}
                      <div className="flex justify-center mt-8">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-10 py-4 bg-gray-900 text-white font-medium rounded-lg shadow-lg hover:bg-amber-500  hover:text-gray-900 focus:outline-none transform transition hover:-translate-y-1 relative overflow-hidden group"
                        >
                          {submitting ? (
                            <>
                              <ClipLoader size={20} color="#000000" className="mr-2" />
                              Processing...
                            </>
                          ) : isRemainingPayment ? (
                            'Complete Payment'
                          ) : (
                            `Pay ${paymentType === 'full' ? 'Full' : 'Partial'} Amount`
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;