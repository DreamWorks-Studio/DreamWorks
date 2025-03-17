import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import axios from 'axios';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const PaymentGateway = () => {
    const [paymentType, setPaymentType] = useState('full');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [submitting, setSubmitting] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const bookingId = location.state?.bookingId;
  
    useEffect(() => {
      const fetchBookingDetails = async () => {
        if (!bookingId) {
          toast.error("No booking information found");
          navigate('/booking');
          return;
        } 

        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:5003/api/bookings/${bookingId}`);
          setBookingDetails(response.data);
        } catch (error) {
          console.error("Error fetching booking details:", error);
          toast.error("Could not load booking details");
        } finally {
          setLoading(false);
        }
      };
  
      fetchBookingDetails();
    }, [bookingId, navigate]);
  
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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

    // Calculate total amount
    const totalAmount = bookingDetails ? (bookingDetails.package.price * 1.05 + 1000).toFixed(2) : 0;
    
    const watchPaymentType = watch('paymentType');
    const watchAmount = watch('amount');
    const cardDetailsEntered = watch('cardNumber') && watch('expiry') && watch('cvc');

    useEffect(() => {
      setPaymentType(watchPaymentType);

      if(watchPaymentType === 'full') {
        setValue('amount', totalAmount);
      } else {
        setValue('amount', '');
      }
    }, [watchPaymentType, totalAmount, setValue]);
  
    const onSubmit = async (data) => {
      if (!bookingDetails) {
        toast.error("No booking found");
        return;
      }
      
      try {
        setSubmitting(true);
        
        const paymentData = {
          bookingId: bookingId,
          paymentMethod: 'card',
          paymentType: data.paymentType,
          amountPaid: data.paymentType === 'full' ? 
            parseFloat(totalAmount) : parseFloat(data.amount),
          totalAmount: parseFloat(totalAmount),
          cardNumber: data.cardNumber.replace(/\s/g, ''),
          expiryDate: data.expiry,
          cvc: data.cvc,
          saveCard: data.saveCard || false
        };
        
        console.log('Submitting payment:', paymentData);
        
        const response = await axios.post('http://localhost:5003/api/payments', paymentData);
        
        if (response.data) {
          toast.success(`${data.paymentType === 'full' ? 'Full' : 'Partial'} payment was successful!`);
          navigate('/payment-success', { 
            state: { 
              bookingId, 
              paymentId: response.data.payment.id,
              paymentType: data.paymentType,
              amount: paymentData.amountPaid
            }
          });
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
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
      navigate('/bookings');
    };
  
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-lg rounded-4xl overflow-hidden">
              <div className="md:grid md:grid-cols-12">
                <div className="md:col-span-5 bg-gradient-to-br from-gray-950 to-gray-900 text-white p-8">
                  <h2 className="text-2xl font-bold mb-6 mt-22">
                    Payment Summary
                  </h2>
                  {loading ? (
                    <div className="flex justify-center items-center h-60">
                      <ClipLoader color="#FFF" size={40} />
                    </div>
                  ) : (
                    <div className="space-y-4 text-lg">
                      <div className="flex justify-between items-center py-3">
                        <span className="text-blue-100">Package Price:</span>
                        <span className="font-medium">
                          Rs.{bookingDetails?.package?.price?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-blue-100">TAX (5%):</span>
                        <span className="font-medium">
                          Rs.{(bookingDetails?.package?.price * 0.05).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-blue-100">Booking Fee:</span>
                        <span className="font-medium">Rs.1000.00</span>
                      </div>
                      <div className="flex justify-between font-medium pt-3 border-t mt-2">
                        <span>Total:</span>
                        <span className="text-lg font-bold">
                          Rs.{totalAmount}
                        </span>
                      </div>
                    </div>
                  )} 
                </div>
                <div className="md:col-span-7 p-10 pt-20">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                    Card Payment Details
                  </h2>
                  <div className="border-b border-gray-200 mb-6"></div>
                  {loading ? (
                    <div className="flex justify-center items-center h-60">
                      <ClipLoader color="#666" size={40} />
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="bg-white rounded-xl overflow-hidden">
                        <div className="space-y-6">
                          {/* Payment Type Section */}
                          <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-white transition-all hover:shadow-md">
                            <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Pay Amount
                            </h2>
                            <div className='space-y-4'>
                              <label className='flex items-center'>
                                <input 
                                  type="radio" 
                                  name="paymentType" 
                                  value="full" 
                                  {...register('paymentType')}
                                  className='h-5 w-5 text-amber-600 focus:ring-amber-600 border-gray-300'
                                />
                                <span className='ml-3 text-gray-700'>Full Payment (Rs.{totalAmount})</span>
                              </label>
                              <label className='flex items-center'>
                                <input 
                                  type="radio" 
                                  name="paymentType" 
                                  value="partial" 
                                  {...register('paymentType')}
                                  className='h-5 w-5 text-amber-600 focus:ring-amber-600 border-gray-300'
                                />
                                <span className='ml-3 text-gray-700'>Partial Payment</span>
                              </label>
                              
                              {watchPaymentType === 'partial' && (
                                <div className='mt-3 pl-8'>
                                  <div className='relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                      <span className='text-gray-500 sm:text-sm'>Rs.</span>
                                    </div>
                                    <input
                                      type="text"
                                      {...register('amount', {
                                        required: watchPaymentType === 'partial' ? 'Amount is required' : false,
                                        min: {
                                          value: 1000,
                                          message: 'Minimum payment is Rs.1000'
                                        },
                                        max: {
                                          value: parseFloat(totalAmount) - 1,
                                          message: `Maximum partial payment is Rs.${(parseFloat(totalAmount) - 1).toFixed(2)}`
                                        },
                                        pattern: {
                                          value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                          message: 'Please enter a valid amount'
                                        }
                                      })}
                                      className='pl-10 block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500'
                                      placeholder='Amount'
                                    />
                                  </div>
                                  {errors.amount && (
                                    <p className='mt-1 text-sm text-red-600'>{errors.amount.message}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Details Section */}
                          <div className="border border-gray-100 rounded-xl p-6 shadow-sm bg-white transition-all hover:shadow-md">
                            <h2 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Card Information
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  id="cardNumber"
                                  placeholder="1234 5678 9012 3456"
                                  {...register('cardNumber', {
                                    required: 'Card number is required',
                                    onChange: handleCardNumberChange,
                                    pattern: {
                                      value: /^(\d{4}\s){3}\d{4}$/,
                                      message: 'Please enter a valid 16-digit card number'
                                    }
                                  })}
                                  className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                />
                                {errors.cardNumber && (
                                  <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                                )}
                              </div>
                              </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                id="expiry"
                                placeholder="MM/YY"
                                {...register('expiry', {
                                  required: 'Expiry date is required',
                                  onChange: handleExpiryChange,
                                  pattern: {
                                    value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                                    message: 'Please enter a valid expiry date (MM/YY)'
                                  }
                                })}
                                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                              />
                              {errors.expiry && (
                                <p className="mt-1 text-sm text-red-600">{errors.expiry.message}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                                CVC
                              </label>
                              <input
                                type="text"
                                id="cvc"
                                placeholder="123"
                                {...register('cvc', {
                                  required: 'CVC is required',
                                  pattern: {
                                    value: /^[0-9]{3,4}$/,
                                    message: 'Please enter a valid CVC (3-4 digits)'
                                  }
                                })}
                                className="block w-full sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                                maxLength={4}
                              />
                              {errors.cvc && (
                                <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
                              )}
                            </div>
                          </div>

                              {watchPaymentType === 'partial' && cardDetailsEntered && (
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

                          <div className="flex justify-end space-x-4 mt-8">
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="bg-gradient-to-r bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-6 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all cursor-pointer"
                            >
                              {submitting ? (
                                <ClipLoader color="#FFF" size={16} />
                              ) : (
                                'Submit Payment'
                              )}
                            </button>
                          </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentGateway;