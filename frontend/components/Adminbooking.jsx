import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, CalendarIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import AdminBookingCalendar from './BookingCalenderView';

const Adminbooking = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("table"); // "table" or "calendar"
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5003/api/booking/display-summary")
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched Booking Data:", data);
                setBookings(data);
            })
            .catch((error) => console.error("Error fetching bookings:", error));
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

    // Filter bookings based on search term
    const filteredBookings = bookings.filter((booking) =>
        booking.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle booking click in calendar view
    const handleBookingClick = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    // Toggle between table and calendar view
    const toggleViewMode = () => {
        setViewMode(viewMode === "table" ? "calendar" : "table");
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Booking</h1>
                    <p className="text-gray-600">Booking History</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* View toggle button */}
                    <button
                        onClick={toggleViewMode}
                        className="flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        {viewMode === "table" ? (
                            <>
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                <span>Calendar View</span>
                            </>
                        ) : (
                            <>
                                <TableCellsIcon className="h-5 w-5 mr-2" />
                                <span>Table View</span>
                            </>
                        )}
                    </button>

                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search by customer name"
                        className="p-2 border border-gray-300 rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {viewMode === "table" ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-200 shadow-md">
                        <thead>
                            <tr className="bg-gray-700 text-white">
                                <th className="py-3 px-4 text-left border">Booking ID</th>
                                <th className="py-3 px-4 text-left border">Customer</th>
                                <th className="py-3 px-4 text-left border">Package</th>
                                <th className="py-3 px-4 text-left border">Date</th>
                                <th className="py-3 px-4 text-left border">Time</th>
                                <th className="py-3 px-4 text-left border">Location</th>
                                <th className="py-3 px-4 text-left border">Status</th>
                                <th className="py-3 px-4 text-left border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking, index) => (
                                    <tr 
                                        key={booking._id || index} 
                                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        onClick={() => handleBookingClick(booking)}
                                    >
                                        <td className="py-3 px-4 border">{booking._id || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.fullName || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.packageType || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.date || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.time || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.location || "-"}</td>
                                        <td className="py-3 px-4 border">{booking.status || "Not Completed"}</td>
                                        <td className="py-3 px-4 border text-center">
                                            {booking.status === "Completed" ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            undoStatus(booking._id);
                                                        }}
                                                        className="text-blue-600"
                                                    >
                                                        <ArrowPathIcon className="h-6 w-6 text-blue-500" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStatus(booking._id, booking.status);
                                                    }}
                                                    className="text-amber-600"
                                                >
                                                    {booking.status === "Completed" ? (
                                                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <XCircleIcon className="h-6 w-6 text-red-500" />
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-3 px-4 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <AdminBookingCalendar 
                    bookings={filteredBookings} 
                    onBookingClick={handleBookingClick}
                />
            )}

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Booking Details</h2>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Booking ID</p>
                                <p className="font-medium">{selectedBooking._id || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Status</p>
                                <p className={`font-medium ${
                                    selectedBooking.status === "Completed" ? "text-green-600" : "text-amber-600"
                                }`}>
                                    {selectedBooking.status || "Not Completed"}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Customer Name</p>
                                <p className="font-medium">{selectedBooking.fullName || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Email</p>
                                <p className="font-medium">{selectedBooking.email || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Phone</p>
                                <p className="font-medium">{selectedBooking.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Package Type</p>
                                <p className="font-medium">{selectedBooking.packageType || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Date</p>
                                <p className="font-medium">{selectedBooking.date || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Time</p>
                                <p className="font-medium">{selectedBooking.time || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Location</p>
                                <p className="font-medium">{selectedBooking.location || "-"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created At</p>
                                <p className="font-medium">
                                    {selectedBooking.createdAt 
                                        ? new Date(selectedBooking.createdAt).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                        
                        {selectedBooking.message && (
                            <div className="mt-4">
                                <p className="text-gray-600">Additional Message</p>
                                <p className="bg-gray-50 p-3 rounded mt-1">{selectedBooking.message}</p>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            {selectedBooking.status === "Completed" ? (
                                <button
                                    onClick={() => {
                                        undoStatus(selectedBooking._id);
                                        setShowDetailsModal(false);
                                    }}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                    Mark as Not Completed
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        toggleStatus(selectedBooking._id, selectedBooking.status);
                                        setShowDetailsModal(false);
                                    }}
                                    className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                >
                                    Mark as Completed
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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