import React, { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/20/solid';

const BookingCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingSummary, setBookingSummary] = useState({ total: 0, completed: 0, pending: 0 });

  // Month names for display
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Current date for highlighting today
  const today = new Date();
  const isToday = (date) => {
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Fetch bookings data
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5003/api/booking/display-summary")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Parse dates in the bookings data
        const parsedBookings = data.map(booking => ({
          ...booking,
          parsedDate: booking.date ? new Date(booking.date) : null
        }));
        setBookings(parsedBookings);
        
        // Calculate summary statistics
        const completed = parsedBookings.filter(b => b.status === "Completed").length;
        setBookingSummary({
          total: parsedBookings.length,
          completed: completed,
          pending: parsedBookings.length - completed
        });
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Generate calendar days for current month view
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0-6)
    const firstDayOfWeek = firstDay.getDay();
    
    // Days to show from previous month
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Generate array of all days to display (42 days = 6 weeks)
    const days = [];
    
    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      days.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false,
        day: i
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        day: i
      });
    }
    
    // Add days from next month to complete grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        day: i
      });
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  // Go to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Go to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    if (!date) return [];
    
    return bookings.filter(booking => {
      if (!booking.parsedDate) return false;
      
      return (
        booking.parsedDate.getFullYear() === date.getFullYear() &&
        booking.parsedDate.getMonth() === date.getMonth() &&
        booking.parsedDate.getDate() === date.getDate()
      );
    });
  };

  // Show booking details modal
  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  // Close booking details modal
  const closeBookingDetails = () => {
    setShowBookingDetails(false);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Generate color based on package name (for visual distinction)
  const getPackageColor = (packageName) => {
    if (!packageName) return 'bg-gray-200';
    
    // Simple hash function to generate consistent color based on package name
    const hash = packageName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of background color classes to choose from
    const colorClasses = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-amber-100 text-amber-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-rose-100 text-rose-800',
      'bg-cyan-100 text-cyan-800',
      'bg-emerald-100 text-emerald-800'
    ];
    
    // Use the hash to select a color class
    return colorClasses[Math.abs(hash) % colorClasses.length];
  };

  // Mark booking as completed
  const markAsCompleted = (bookingId) => {
    // Implement API call to update booking status
    fetch(`http://localhost:5003/api/booking/update-status/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Completed' }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update booking status');
        }
        return response.json();
      })
      .then(() => {
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'Completed' } 
              : booking
          )
        );
        
        // Update summary counts
        setBookingSummary(prev => ({
          ...prev,
          completed: prev.completed + 1,
          pending: prev.pending - 1
        }));
        
        // Update selected booking if it's the one that was marked as completed
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: 'Completed' });
        }
        
        closeBookingDetails();
      })
      .catch(error => {
        console.error('Error updating booking status:', error);
        alert('Failed to update booking status');
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Error loading bookings: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-1">Booking Calendar</h2>
        <p className="text-blue-100 mb-4">View and manage your scheduled bookings</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
    <p className="text-sm text-gray-600">Total Bookings</p>
    <p className="text-2xl font-bold text-gray-600">{bookingSummary.total}</p>
  </div>
  <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
    <p className="text-sm text-gray-600">Completed</p>
    <p className="text-2xl font-bold text-gray-600">{bookingSummary.completed}</p>
  </div>
  <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
    <p className="text-sm text-gray-600">Pending</p>
    <p className="text-2xl font-bold text-gray-600">{bookingSummary.pending}</p>
  </div>
</div>
      </div>
      
      <div className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button 
              onClick={goToToday}
              className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center py-2 font-medium text-gray-500 bg-gray-50 rounded">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dateBookings = getBookingsForDate(day.date);
            const hasBookings = dateBookings.length > 0;
            const isTodayCell = isToday(day.date);
            
            return (
              <div 
                key={index}
                className={`min-h-28 border rounded-lg ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${hasBookings ? 'border-blue-300 shadow-sm' : 'border-gray-200'} 
                ${isTodayCell ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              >
                {/* Day Number */}
                <div className={`text-right p-2 font-medium ${
                  day.isCurrentMonth 
                    ? isTodayCell 
                      ? 'text-blue-700 bg-blue-50 rounded-t-lg' 
                      : 'text-gray-700' 
                    : 'text-gray-400'
                }`}>
                  {day.day}
                </div>
                
                {/* Bookings for this day */}
                <div className="p-1 overflow-y-auto max-h-20">
                  {dateBookings.slice(0, 3).map((booking, idx) => (
                    <div 
                      key={booking._id || idx}
                      onClick={() => openBookingDetails(booking)}
                      className={`text-xs mb-1 p-2 rounded cursor-pointer truncate hover:opacity-80 transition-opacity ${getPackageColor(booking.packageType)}`}
                      title={`${booking.fullName || 'No name'} - ${booking.packageType || 'No package'}`}
                    >
                      <div className="font-medium">{booking.packageType || 'Unnamed booking'}</div>
                      {booking.time && <div className="text-xs opacity-75">{booking.time}</div>}
                    </div>
                  ))}
                  
                  {dateBookings.length > 3 && (
                    <div 
                      className="text-xs text-center py-1 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        // Show first booking from the remaining ones
                        openBookingDetails(dateBookings[3]);
                      }}
                    >
                      +{dateBookings.length - 3} more bookings
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Package Color Legend */}
        {bookings.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
              Package Types
            </h4>
            <div className="flex flex-wrap gap-3">
              {[...new Set(bookings.filter(b => b.packageType).map(b => b.packageType))].map(packageType => (
                <div key={packageType} className="flex items-center bg-gray-50 px-2 py-1 rounded">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPackageColor(packageType).split(' ')[0]}`}></span>
                  <span className="text-xs font-medium">{packageType}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Booking Details</h3>
              <button 
                onClick={closeBookingDetails}
                className="text-white hover:text-blue-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                selectedBooking.status === "Completed" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"
              }`}>
                {selectedBooking.status || "Not Completed"}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${getPackageColor(selectedBooking.packageType).split(' ')[0]}`}>
                    <CalendarIcon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium">{selectedBooking.packageType || "N/A"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <UserIcon className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedBooking.fullName || "N/A"}</p>
                    {selectedBooking.email && <p className="text-sm text-gray-500">{selectedBooking.email}</p>}
                    {selectedBooking.phone && <p className="text-sm text-gray-500">{selectedBooking.phone}</p>}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <ClockIcon className="h-5 w-5 text-purple-700" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {selectedBooking.parsedDate ? formatDate(selectedBooking.parsedDate) : "N/A"}
                    </p>
                    {selectedBooking.time && <p className="text-sm">{selectedBooking.time}</p>}
                  </div>
                </div>
                
                {selectedBooking.location && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <MapPinIcon className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedBooking.location}</p>
                    </div>
                  </div>
                )}
                
                {selectedBooking.message && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-2">
                    <p className="text-sm text-gray-500 mb-1">Additional Notes:</p>
                    <p className="text-sm">{selectedBooking.message}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeBookingDetails}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                {selectedBooking.status !== "Completed" && selectedBooking._id && (
                  <button
                    onClick={() => markAsCompleted(selectedBooking._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendarView;