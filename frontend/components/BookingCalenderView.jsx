import React, { useState, useEffect } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/20/solid';
import { motion } from 'framer-motion';

const BookingCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingSummary, setBookingSummary] = useState({ total: 0, completed: 0, pending: 0 });
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [yearOptions, setYearOptions] = useState([]);

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

  const handleYearSelect = (year) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearSelector(false);
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

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate options for 5 years back and 5 years ahead
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    setYearOptions(years);
  };

  useEffect(() => {
    generateYearOptions();
  }, []);

  const toggleYearSelector = () => {
    setShowYearSelector(!showYearSelector);
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

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden border-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Summary Stats with Enhanced Design */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <svg width="280" height="280" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 5C22 4.44772 22.4477 4 23 4H33C33.5523 4 34 4.44772 34 5V8.5H36.5C37.0523 8.5 37.5 8.94772 37.5 9.5V13H46.5C48.433 13 50 14.567 50 16.5V46.5C50 48.433 48.433 50 46.5 50H9.5C7.567 50 6 48.433 6 46.5V16.5C6 14.567 7.567 13 9.5 13H18.5V9.5C18.5 8.94772 18.9477 8.5 19.5 8.5H22V5ZM24 6V8.5H32V6H24ZM20.5 10.5V13H35.5V10.5H20.5ZM9.5 15C8.67157 15 8 15.6716 8 16.5V46.5C8 47.3284 8.67157 48 9.5 48H46.5C47.3284 48 48 47.3284 48 46.5V16.5C48 15.6716 47.3284 15 46.5 15H9.5Z" />
            <path d="M17 25C17 24.4477 17.4477 24 18 24C18.5523 24 19 24.4477 19 25C19 25.5523 18.5523 26 18 26C17.4477 26 17 25.5523 17 25Z" />
            <path d="M24 25C24 24.4477 24.4477 24 25 24C25.5523 24 26 24.4477 26 25C26 25.5523 25.5523 26 25 26C24.4477 26 24 25.5523 24 25Z" />
            <path d="M31 25C31 24.4477 31.4477 24 32 24C32.5523 24 33 24.4477 33 25C33 25.5523 32.5523 26 32 26C31.4477 26 31 25.5523 31 25Z" />
            <path d="M38 25C38 24.4477 38.4477 24 39 24C39.5523 24 40 24.4477 40 25C40 25.5523 39.5523 26 39 26C38.4477 26 38 25.5523 38 25Z" />
            <path d="M17 32C17 31.4477 17.4477 31 18 31C18.5523 31 19 31.4477 19 32C19 32.5523 18.5523 33 18 33C17.4477 33 17 32.5523 17 32Z" />
            <path d="M24 32C24 31.4477 24.4477 31 25 31C25.5523 31 26 31.4477 26 32C26 32.5523 25.5523 33 25 33C24.4477 33 24 32.5523 24 32Z" />
            <path d="M31 32C31 31.4477 31.4477 31 32 31C32.5523 31 33 31.4477 33 32C33 32.5523 32.5523 33 32 33C31.4477 33 31 32.5523 31 32Z" />
            <path d="M38 32C38 31.4477 38.4477 31 39 31C39.5523 31 40 31.4477 40 32C40 32.5523 39.5523 33 39 33C38.4477 33 38 32.5523 38 32Z" />
            <path d="M17 39C17 38.4477 17.4477 38 18 38C18.5523 38 19 38.4477 19 39C19 39.5523 18.5523 40 18 40C17.4477 40 17 39.5523 17 39Z" />
            <path d="M24 39C24 38.4477 24.4477 38 25 38C25.5523 38 26 38.4477 26 39C26 39.5523 25.5523 40 25 40C24.4477 40 24 39.5523 24 39Z" />
            <path d="M31 39C31 38.4477 31.4477 38 32 38C32.5523 38 33 38.4477 33 39C33 39.5523 32.5523 40 32 40C31.4477 40 31 39.5523 31 39Z" />
            <path d="M38 39C38 38.4477 38.4477 38 39 38C39.5523 38 40 38.4477 40 39C40 39.5523 39.5523 40 39 40C38.4477 40 38 39.5523 38 39Z" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-1">Booking Calendar</h2>
          <p className="text-gray-300 mb-8 max-w-xl">View and manage your scheduled photography sessions all in one place</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 relative z-10">
          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-5 border border-white border-opacity-20 hover:shadow-xl transition-all"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium text-gray-900">Total Bookings</p>
              <div className="p-2 bg-amber-500 bg-opacity-20 rounded-full">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{bookingSummary.total}</p>
            <div className="mt-2 w-full bg-white bg-opacity-10 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-5 border border-white border-opacity-20 hover:shadow-xl transition-all"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium text-gray-900">Completed</p>
              <div className="p-2 bg-emerald-500 bg-opacity-20 rounded-full">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{bookingSummary.completed}</p>
            <div className="mt-2 w-full bg-white bg-opacity-10 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${bookingSummary.total ? (bookingSummary.completed / bookingSummary.total) * 100 : 0}%` }}></div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-5 border border-white border-opacity-20 hover:shadow-xl transition-all"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xl font-medium text-gray-900">Pending</p>
              <div className="p-2 bg-amber-500 bg-opacity-20 rounded-full">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{bookingSummary.pending}</p>
            <div className="mt-2 w-full bg-white bg-opacity-10 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${bookingSummary.total ? (bookingSummary.pending / bookingSummary.total) * 100 : 0}%` }}></div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-8">
        {/* Calendar Header with Improved Design */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex items-center">
            <div className="p-2.5 bg-gray-900 text-white rounded-full mr-3">
              <CalendarIcon className="h-4 w-4" />
            </div>

            <div className="relative">
              <button
                onClick={toggleYearSelector}
                className="text-lg font-semibold text-gray-800 px-2 py-1 hover:bg-gray-100 rounded-md flex items-center"
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                <ChevronRightIcon className={`h-4 w-4 ml-1 transform transition-transform ${showYearSelector ? 'rotate-90' : ''}`} />
              </button>
              {/* Year Selector Dropdown */}
              {showYearSelector && (
                <motion.div
                  className="absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 py-1 w-32 max-h-64 overflow-y-auto"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {yearOptions.map(year => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${currentDate.getFullYear() === year ? 'bg-amber-100 font-medium text-amber-800' : ''}`}
                    >
                      {year}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <button
              onClick={goToToday}
              className="ml-4 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={goToPrevMonth}
              className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Next Month"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </motion.div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center py-2 font-medium text-gray-700 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid with Enhanced Design */}
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((day, index) => {
            const dateBookings = getBookingsForDate(day.date);
            const hasBookings = dateBookings.length > 0;
            const isTodayCell = isToday(day.date);

            return (
              <motion.div
                key={index}
                className={`min-h-32 border rounded-lg ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${hasBookings ? 'border-gray-800 shadow-sm' : 'border-gray-200'
                  } ${isTodayCell ? 'ring-2 ring-amber-500 ring-offset-1' : ''
                  } hover:shadow-md transition-all duration-200`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * (index % 7), duration: 0.2 }}
              >
                {/* Day Number */}
                <div className={`text-right p-2.5 font-medium ${day.isCurrentMonth
                  ? isTodayCell
                    ? 'text-white bg-amber-500 rounded-t-lg'
                    : 'text-gray-700'
                  : 'text-gray-400'
                  }`}>
                  {day.day}
                </div>

                {/* Bookings for this day */}
                <div className="p-1.5 overflow-y-auto max-h-24">
                  {dateBookings.slice(0, 3).map((booking, idx) => (
                    <motion.div
                      key={booking._id || idx}
                      onClick={() => openBookingDetails(booking)}
                      className={`text-xs mb-1.5 p-2.5 rounded-lg cursor-pointer truncate 
                      hover:shadow-md transition-all duration-200 border-l-4 ${getPackageColor(booking.packageType)}`}
                      whileHover={{ x: 2 }}
                      title={`${booking.fullName || 'No name'} - ${booking.packageType || 'No package'}`}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.2 }}
                    >
                      <div className="font-medium">{booking.packageType || 'Unnamed booking'}</div>
                      {booking.time && (
                        <div className="text-xs opacity-75 flex items-center mt-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {booking.time}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {dateBookings.length > 3 && (
                    <div
                      className="text-xs text-center py-1.5 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        // Show first booking from the remaining ones
                        openBookingDetails(dateBookings[3]);
                      }}
                    >
                      +{dateBookings.length - 3} more bookings
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Package Color Legend */}
        {bookings.length > 0 && (
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <div className="w-4 h-4 bg-gray-900 rounded-lg mr-2"></div>
              Package Types
            </h4>
            <div className="flex flex-wrap gap-3">
              {[...new Set(bookings.filter(b => b.packageType).map(b => b.packageType))].map(packageType => (
                <div key={packageType} className="flex items-center bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPackageColor(packageType).split(' ')[0]}`}></span>
                  <span className="text-xs font-medium text-gray-800">{packageType}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal - Enhanced Design */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-0"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Booking Details</h3>
              <button
                onClick={closeBookingDetails}
                className="text-white hover:text-amber-200 transition-colors"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${selectedBooking.status === "Completed"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}>
                {selectedBooking.status || "Not Completed"}
              </div>

              <div className="space-y-5">
                <div className="flex items-start">
                  <div className={`p-2.5 rounded-lg ${getPackageColor(selectedBooking.packageType).split(' ')[0]}`}>
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium">{selectedBooking.packageType || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2.5 rounded-lg bg-gray-900">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedBooking.fullName || "N/A"}</p>
                    {selectedBooking.email && <p className="text-sm text-gray-500">{selectedBooking.email}</p>}
                    {selectedBooking.phone && <p className="text-sm text-gray-500">{selectedBooking.phone}</p>}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2.5 rounded-lg bg-gray-900">
                    <ClockIcon className="h-5 w-5 text-white" />
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
                    <div className="p-2.5 rounded-lg bg-gray-900">
                      <MapPinIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedBooking.location}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.message && (
                  <div className="bg-gray-50 p-4 rounded-xl mt-2 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Additional Notes:</p>
                    <p className="text-sm">{selectedBooking.message}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeBookingDetails}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>

                {selectedBooking.status !== "Completed" && selectedBooking._id && (
                  <button
                    onClick={() => markAsCompleted(selectedBooking._id)}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-3"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Error loading bookings: {error}
        </div>
      )}
    </motion.div>
  );
};

export default BookingCalendarView;