import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const existingBooking = location.state?.booking;

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
    const [bookedDates, setBookedDates] = useState([]);
    const [formData, setFormData] = useState({
        _id: "",
        fullName: "",
        email: "",
        telephone: "",
        location: "",
        addson: "",
        packageType: "",
        date: "",
        time: "morning session",
    });

    useEffect(() => {
        console.log("Initial location state:", location.state);
        console.log("Existing booking data:", existingBooking);

        if (existingBooking) {
            console.log("Existing booking ID:", existingBooking._id);
            setFormData(prevData => ({
                ...prevData,
                ...existingBooking
            }));
        }
    }, [existingBooking, location.state]);

    useEffect(() => {
        console.log("Current form data:", formData);
    }, [formData]);

    useEffect(() => {
        if (existingBooking) {
            Object.keys(formData).forEach(key => {
                setValue(key, formData[key]);
            });
        }
    }, [formData, existingBooking, setValue]);

    useEffect(() => {
        fetch("http://localhost:5003/api/booking/booked-dates")
            .then(res => res.json())
            .then(data => setBookedDates(data.map(date => new Date(date))))
            .catch(err => console.error("Error fetching booked dates:", err));
    }, []);

    const onSubmit = async (data) => {
        console.log("Submitting Form Data:", data);

        try {
            let response;
            if (data._id) {
                console.log("Updating booking with ID:", data._id);
                response = await fetch(`http://localhost:5003/api/booking/update-booking/${data._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            } else {
                response = await fetch("http://localhost:5003/api/booking/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            }

            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                navigate("/booking-summary", { state: { booking: result.booking || data } });
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            alert("Error submitting form");
            console.error(error);
        }
    };

    return (
        <div className="text-center p-6 py-20 lg:px-32 w-full overflow-hidden bg-white" id="Contact">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-center text-amber-600">
                {existingBooking ? "Edit Booking" : "Book an Appointment"}
            </h1>
            <p className="text-center text-gray-300 mb-12 max-w-80 mx-auto">
                Your Story, Our Lens
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto text-gray-600 pt-8">
                <div className="flex flex-wrap">
                    <div className="w-full md:w-1/2 text-left mb-4">
                        <label className="block text-gray-600 text-sm mb-1">Full Name</label>
                        <input
    type="text"
    {...register("fullName", { 
        required: "Full Name is required",
        pattern: { 
            value: /^[A-Za-z\s]+$/, 
            message: "Only letters and spaces are allowed" 
        },
        minLength: { value: 3, message: "Must be at least 3 characters long" }
    })}
    className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
/>
                        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                    </div>

                    <div className="w-full md:w-1/2 text-left md:pl-4 mb-4">
                        <label className="block text-gray-600 text-sm mb-1">Email</label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                    message: "Enter a valid email address",
                                }
                            })}
                            className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                </div>

                <div className="my-6 text-left mb-4">
                    <label className="block text-gray-600 text-sm mb-1">Telephone</label>
                    <input
                        type="tel"
                        {...register("telephone", { required: "Telephone is required" })}
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                    />
                    {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone.message}</p>}
                </div>

                <div className="my-6 text-left mb-4">
                    <label className="block text-gray-600 text-sm mb-1">Location</label>
                    <input
                        type="text"
                        {...register("location", { required: "Location is required" })}
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                    />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                </div>

                <div className="my-6 text-left mb-4">
                    <label className="block text-gray-600 text-sm mb-1">Add-ons</label>
                    <input
                        type="text"
                        {...register("addson")}
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                    />
                </div>

                <div className="my-6 text-left mb-4">
                    <label className="block text-gray-600 text-sm mb-1">Package Type</label>
                    <input
                        type="text"
                        {...register("packageType", { required: "Package Type is required" })}
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                    />
                    {errors.packageType && <p className="text-red-500 text-sm">{errors.packageType.message}</p>}
                </div>

                <div className="my-6 text-left mb-4">
                    <label className="block text-gray-600 text-sm mb-1">Select Time</label>
                    <select
                        {...register("time", { required: "Select a time" })}
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                    >
                        <option value="morning session">Morning Session</option>
                        <option value="afternoon session">Afternoon Session</option>
                        <option value="evening session">Evening Session</option>
                    </select>
                    {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
                </div>

           {/* Select Date */}
           <div className="my-6 text-left mb-4">
            <label className="block text-gray-600 text-sm mb-1">Select Date</label>
            <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                    <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="dd/MM/yyyy"
                        className="w-full border border-amber-600 rounded py-2 px-4 mt-2"
                        minDate={new Date()} // Prevent past dates
                        excludeDates={bookedDates} // Disable booked dates
                        showYearDropdown // Enables year dropdown
                        scrollableYearDropdown // Allows scrolling through years
                        yearDropdownItemNumber={15}
                        placeholderText="Select a date" // Placeholder text
                        autoComplete="off" 
                    />
                )}
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>
                <button type="submit" className="cursor-pointer bg-transparent text-amber-600 hover:text-black px-5 py-2 border-2 border-amber-600 hover:border-black rounded-full">
                    {existingBooking ? "Update Booking" : "Book Appointment"}
                </button>
            </form>
        </div>
    );
};

export default BookingPage;
