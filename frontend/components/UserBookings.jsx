import React from 'react';

const UserBookings = ({
  bookings = [],
  expandedBookingId,
  toggleBookingDetails,
  getPaymentInfo,
  formatCurrency,
  handleRemainingPayment,
  navigate,
  payments = {}
}) => {
  // Safely check for bookings array
  const hasBookings = Array.isArray(bookings) && bookings.length > 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden border border-amber-100 transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5 flex justify-between items-center border-b border-amber-100">
        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">My Bookings</h2>
        <span className="text-sm font-medium text-amber-800 bg-amber-100/70 px-4 py-1 rounded-full">
          {bookings?.length || 0} Total
        </span>
      </div>

      <div className="divide-y divide-amber-50">
        {!hasBookings ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 rounded-full mb-4 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-5">No photography sessions booked yet.</p>
            <button
              onClick={() => navigate('/book')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition font-medium focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Book a Session
            </button>
          </div>
        ) : (
          bookings.map(booking => {
            if (!booking || !booking._id) return null;
            const paymentInfo = getPaymentInfo(booking);
            return (
              <div key={booking._id} className="transition-all duration-200 hover:bg-amber-50/60">
                <div className="p-6 cursor-pointer" onClick={() => toggleBookingDetails(booking._id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{booking.packageType}</h3>
                      <div className="text-gray-600 mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(booking.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {/* Payment status badge */}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        paymentInfo?.isFullyPaid
                          ? 'bg-green-100/80 text-green-800 border border-green-200 shadow-sm shadow-green-100'
                          : paymentInfo?.isPartiallyPaid
                            ? 'bg-amber-100/80 text-amber-800 border border-amber-200 shadow-sm shadow-amber-100'
                            : 'bg-red-100/80 text-red-800 border border-red-200 shadow-sm shadow-red-100'
                      }`}>
                        {paymentInfo?.isFullyPaid ? 'Paid' : paymentInfo?.isPartiallyPaid ? 'Partially Paid' : 'Unpaid'}
                      </span>
                      <div className="flex items-center text-sm text-amber-600 mt-3 font-medium group">
                        {expandedBookingId === booking._id ? (
                          <>
                            Hide Details
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            View Details
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded booking details */}
                {expandedBookingId === booking._id && (
                  <div className="px-6 pb-6 bg-gradient-to-br from-amber-50/70 to-amber-100/50 border-t border-amber-100 animate-fadeIn">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Payment details section */}
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-50 transition-all duration-300 hover:shadow-md">
                        <h4 className="text-amber-700 font-semibold mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Payment Details
                        </h4>
                        <div className="space-y-3 text-gray-800">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Package Price:</span>
                            <span className="font-medium">{formatCurrency(paymentInfo?.packagePrice)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">{formatCurrency(paymentInfo?.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-medium">{formatCurrency(paymentInfo?.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 font-semibold">
                            <span className="text-gray-800">Remaining:</span>
                            <span className={`${paymentInfo.remainingAmount > 0 ? "text-amber-600" : "text-green-600"}`}>
                              {formatCurrency(paymentInfo?.remainingAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="capitalize font-medium">{paymentInfo?.lastPaymentMethod || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`capitalize font-medium px-2 py-0.5 rounded-md text-xs ${
                              paymentInfo?.lastPaymentStatus === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {paymentInfo?.lastPaymentStatus || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Show payment button if not fully paid */}
                        {!paymentInfo.isFullyPaid && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemainingPayment(booking);
                            }}
                            className="mt-5 w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Pay Remaining Amount
                          </button>
                        )}
                      </div>

                      {/* Booking details section */}
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-amber-50 transition-all duration-300 hover:shadow-md">
                        <h4 className="text-amber-700 font-semibold mb-4 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Booking Details
                        </h4>
                        <div className="space-y-3 text-gray-800">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Booking ID:</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-mono max-w-[180px] truncate">
                              {booking._id}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Package:</span>
                            <span className="font-medium">{booking.packageType}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium">
                              {new Date(booking.date).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {booking.location && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                              <span className="text-gray-600">Location:</span>
                              <span className="font-medium">{booking.location}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600">Status:</span>
                            <span className="capitalize bg-green-100 text-green-800 px-2 py-0.5 rounded-md text-xs font-medium">
                              {booking.status || 'confirmed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserBookings;