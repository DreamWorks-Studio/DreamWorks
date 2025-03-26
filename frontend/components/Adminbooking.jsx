import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // Import ArrowPathIcon for undo

const Adminbooking = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // State to store search term

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
        booking.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Booking</h1>
                <p className="text-gray-600">Booking History</p>

                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search by customer name"
                    className="mt-4 p-2 border border-gray-300 rounded"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

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
                                <tr key={booking._id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                                                    onClick={() => undoStatus(booking._id)}
                                                    className="text-blue-600"
                                                >
                                                    <ArrowPathIcon className="h-6 w-6 text-blue-500" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => toggleStatus(booking._id, booking.status)}
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
        </div>
    );
};

export default Adminbooking;
