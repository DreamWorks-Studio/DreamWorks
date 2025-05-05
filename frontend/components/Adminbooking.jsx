import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, CalendarIcon, TableCellsIcon, ArrowDownIcon } from "@heroicons/react/20/solid";
import { Download, Camera, ChevronRight } from "lucide-react";
import BookingCalenderView from './BookingCalenderView';
import BookingCalendarView from "./BookingCalenderView";
import { motion } from "framer-motion";

const Adminbooking = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [sortLatest, setSortLatest] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetch("http://localhost:5003/api/booking/display-summary")
                .then((response) => response.json())
                .then((data) => {
                    console.log("Fetched Booking Data:", data);
                    setBookings(data);
                })
                .catch((error) => console.error("Error fetching bookings:", error));
        }, 75);
        return () => clearTimeout(timer);
    }, []);

    // Toggle status between "Completed" and "Not Completed"
    const toggleStatus = async (bookingId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Not Completed" : "Completed";

        const updatedBookings = bookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
        );
        setBookings(updatedBookings);

        try {
            await fetch(`http://localhost:5003/api/booking/update-booking-status/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error("Error updating status in the database:", error);
        }
    };


    // Undo the status (set back to "Not Completed") for completed bookings
    const undoStatus = async (bookingId) => {
        const newStatus = "Not Completed"; // Set status to Not Completed

        const updatedBookings = bookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
        );
        setBookings(updatedBookings);

        try {
            await fetch(`http://localhost:5003/api/booking/update-booking-status/${bookingId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error("Error updating status in the database:", error);
        }
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedBookings = [...filteredBookings].sort((a, b) => {
        if (!sortLatest) return 0;

        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    // Handle booking click in calendar view
    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    // Toggle between table and calendar view
    const toggleViewMode = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setViewMode(viewMode === "table" ? "calendar" : "table");
            setTimeout(() => {
                setIsTransitioning(false);
            }, 50);
        }, 300);
    };

    const toggleSortLatest = () => {
        setSortLatest(!sortLatest);
    };

    const exportToCSV = () => {
        const headers = [
            'Full Name',
            'Email',
            'Phone',
            'Package Type',
            'Date',
            'Time',
            'Location',
            'Status',
        ];
        const csvRows = sortedBookings.map(booking => {
            return [
                booking.fullName || '',
                booking.email || '',
                booking.phone || '',
                booking.packageType || '',
                booking.date || '',
                booking.time || '',
                booking.location || '',
                booking.status || 'Not Completed',
            ].map(field => {
                const escaped = String(field).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',');
        });
        const csvContent = [
            headers.join(','),
            ...csvRows
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `booking_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
            <div className="flex justify-between mb-6 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <Camera size={24} className="text-amber-500" />
                        <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
                    </motion.div>
                    <div
                        className="flex items-center text-sm text-gray-500 mt-2"
                        initial="hidden"
                        animate="visible"
                        custom={1}
                    >
                        <button
                            onClick={() => handleNavigate("/admin", () => { /* set your active page callback here */ })}
                            className="hover:text-amber-600 transition-colors flex items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            Dashboard
                        </button>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="text-amber-600 font-medium">Bookings</span>
                    </div>
                </div>

                {/* Modern search and view toggle controls */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center text-sm focus:outline-none"
                            title="Export to CSV"
                        >
                            <Download className="h-4 w-4 text-amber-500" />
                            <span className="ml-2 text-gray-700">Export CSV</span>
                        </button>
                    </div>
                    <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2">
                        <button
                            onClick={toggleSortLatest}
                            className="flex items-center text-sm focus:outline-none"
                            title={sortLatest ? "Showing newest first" : "Default order"}
                        >
                            <ArrowDownIcon className={`h-4 w-4 text-amber-500 ${sortLatest ? '' : 'opacity-50'}`} />
                            <span className="ml-2 text-gray-700">Latest First</span>
                        </button>
                    </div>
                    {/* View toggle button with matching style */}
                    <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2">
                        <button
                            onClick={toggleViewMode}
                            className="flex items-center text-sm focus:outline-none"
                        >
                            {viewMode === "table" ? (
                                <>
                                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                                    <span className="ml-2 text-gray-700">Calendar View</span>
                                </>
                            ) : (
                                <>
                                    <TableCellsIcon className="h-4 w-4 text-amber-500" />
                                    <span className="ml-2 text-gray-700">Table View</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Search input with your exact specifications */}
                    <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2 w-64">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
                        />
                    </div>
                </div>
            </div>

            {bookings.length === 0 && (
                <div className="p-12 text-center mt-4">
                    <div className="relative mx-auto mb-6 w-16 h-16">
                        {/* Circular spinner representing a lens focusing */}
                        <div className="absolute inset-0 border-4 border-gray-200 border-opacity-30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>

                        {/* Camera icon in the middle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera size={20} className="text-gray-700" />
                        </div>

                        {/* Pulsing light effect */}
                        <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Loading bookings...</p>
                </div>
            )}

            {/* Table View */}
            {viewMode === "table" && bookings.length > 0 && (
                <div className={`rounded-lg overflow-hidden 
                    transition-all duration-300 ease-in-out 
                    ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="py-3.5 px-4 text-left text-sm font-semibold">Customer</th>
                                    <th className="py-3.5 px-4 text-left text-sm font-semibold">Package</th>
                                    <th className="py-3.5 px-4 text-left text-sm font-semibold">
                                        Date & Time
                                        {sortLatest && <span className="ml-1 inline-block text-amber-300">↓</span>}
                                    </th>
                                    <th className="py-3.5 px-4 text-left text-sm font-semibold">Location</th>
                                    <th className="py-3.5 px-4 text-left text-sm font-semibold">Status</th>
                                    <th className="py-3.5 px-4 text-center text-sm font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {sortedBookings.length > 0 ? (
                                    sortedBookings.map((booking, index) => (
                                        <tr
                                            key={booking._id || index}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleBookingClick(booking)}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{booking.fullName || "-"}</div>
                                                <div className="text-sm text-gray-500">{booking.email || "-"}</div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-700">{booking.packageType || "-"}</td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-900">{booking.date || "-"}</div>
                                                <div className="text-sm text-gray-500">{booking.time || "-"}</div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-700">{booking.location || "-"}</td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === "Completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-amber-100 text-amber-800"
                                                    }`}>
                                                    {booking.status || "Not Completed"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {booking.status === "Completed" ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            undoStatus(booking._id);
                                                        }}
                                                        className="inline-flex items-center p-1.5 border border-blue-300 rounded-full bg-white hover:bg-blue-50 transition-colors"
                                                        title="Mark as Not Completed"
                                                    >
                                                        <ArrowPathIcon className="h-5 w-5 text-blue-500" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleStatus(booking._id, booking.status);
                                                        }}
                                                        className="inline-flex items-center p-1.5 border border-amber-300 rounded-full bg-white hover:bg-amber-50 transition-colors"
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5 text-amber-500" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p>No bookings found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Calendar View */}
            {viewMode === "calendar" && (
                <div className={`bg-white rounded-lg shadow-md p-4 
                    transition-all duration-300 ease-in-out 
                    ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <BookingCalendarView
                        bookings={filteredBookings}
                        onBookingClick={handleBookingClick}
                    />
                </div>
            )}

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-800">Booking Details</h2>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Customer Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{selectedBooking.fullName || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-medium">{selectedBooking.email || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone Number</p>
                                        <p className="font-medium">{selectedBooking.phone || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Session Details</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Package Type</p>
                                        <p className="font-medium">{selectedBooking.packageType || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date & Time</p>
                                        <p className="font-medium">{selectedBooking.date || "-"} at {selectedBooking.time || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium">{selectedBooking.location || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-800">Booking Information</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedBooking.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                    }`}>
                                    {selectedBooking.status || "Not Completed"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">Booking ID</p>
                                    <p className="font-medium text-sm">{selectedBooking._id || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="font-medium text-sm">
                                        {selectedBooking.createdAt
                                            ? new Date(selectedBooking.createdAt).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {selectedBooking.message && (
                            <div className="mt-5 bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-500 mb-1">Additional Message</p>
                                <p className="text-gray-700">{selectedBooking.message}</p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-3">
                            {selectedBooking.status === "Completed" ? (
                                <button
                                    onClick={() => {
                                        undoStatus(selectedBooking._id);
                                        setShowDetailsModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    Mark as Not Completed
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        toggleStatus(selectedBooking._id, selectedBooking.status);
                                        setShowDetailsModal(false);
                                    }}
                                    className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                                >
                                    Mark as Completed
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adminbooking;