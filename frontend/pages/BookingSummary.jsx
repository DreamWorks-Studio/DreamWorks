import { useLocation, useNavigate } from "react-router-dom";

const BookingSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking;
    
    // Add this for debugging
    console.log("Booking data in summary:", booking);
    
    if (!booking) return <p className="text-center mt-10 text-red-500">No booking data available</p>;
    
    const handleEdit = () => {
        console.log("Editing booking with ID:", booking._id);
        navigate("/booking", { 
            state: { 
                booking: {
                    ...booking,
                    _id: booking._id // Explicitly ensure _id is included
                } 
            } 
        });
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-indigo-900">Booking Summary</h2>
            
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                {/* Display booking details */}
                <div className="space-y-4">
                    <p><strong>Full Name :</strong> {booking.fullName}</p>
                    <p><strong>Email  :  </strong> {booking.email}</p>
                    <p><strong>Telephone:</strong> {booking.telephone}</p>
                    <p><strong>Location:</strong> {booking.location}</p>
                    <p><strong>Addson:</strong> {booking.addson}</p>
                    <p><strong>PackageType:</strong> {booking.packageType}</p>
                    <p><strong>Date:</strong> {booking.date}</p>
                    <p><strong>Time:</strong> {booking.time}</p>
                    {/* Add this line to debug */}
                    <p><strong>Booking ID:</strong> {booking._id || "Not available"}</p>
                </div>
                
                {/* Edit and Confirm buttons */}
                <div className="flex justify-between mt-6">
                    <button 
                        onClick={handleEdit}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">
                        Edit
                    </button>
                    
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSummary;