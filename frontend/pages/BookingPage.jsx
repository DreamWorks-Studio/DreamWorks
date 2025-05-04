import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const existingBooking = location.state?.booking;
    const selectedPackage = location.state?.selectedPackage;
    const currentUser = location.state?.currentUser;

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
    const [bookedDates, setBookedDates] = useState([]);

    const [formData, setFormData] = useState({
        _id: "",
        fullName: "",
        email: "",
        telephone: "",
        location: "",
        addson: "",
        packageId: "",
        date: "",
        time: "morning session",
        status: "Not Completed",
    });

    useEffect(() => {
        if (currentUser) {
            setFormData(prevData => ({
                ...prevData,
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                userId: currentUser.id || '',
            }));

            setValue('fullName', currentUser.fullName || '');
            setValue('email', currentUser.email || '');
        }

        if (selectedPackage) {
            setFormData(prevData => ({
                ...prevData,
                packageId: selectedPackage._id || '', 
                packageType: selectedPackage.name || ''
            }));

            setValue('packageId', selectedPackage._id || '');
            setValue('packageType', selectedPackage.name || '');
        }
    }, [currentUser, selectedPackage, setValue]);

    useEffect(() => {
        if (existingBooking) {
            setFormData(prevData => ({
                ...prevData,
                ...existingBooking
            }));

            Object.keys(existingBooking || {}).forEach(key => {
                setValue(key, existingBooking[key]);
            });
        }
    }, [existingBooking, setValue]);

    useEffect(() => {
        fetch("http://localhost:5003/api/booking/booked-dates")
            .then(res => res.json())
            .then(data => setBookedDates(data.map(date => new Date(date))))
            .catch(err => console.error("Error fetching booked dates:", err));
    }, []);

    const onSubmit = async (data) => {
        console.log("Submitting Form Data:", data);
        console.log("Selected Package:", selectedPackage);
        console.log("Add-on value from form:", data.addson);
        
        try {
            const formattedData = {
                fullName: data.fullName,
                email: data.email,
                telephone: data.telephone,
                location: data.location,
                addson: data.addson,
                packageId: data.packageId,
                packageType: data.packageType,
                date: data.date,
                time: data.time,
                userId: currentUser?.id,
                status: "Not Completed"
            };
            
            console.log("Form data values:", {
                addsonValue: data.addson,
                formData: formattedData
            });
            
            console.log("Formatted data:", JSON.stringify(formattedData, null, 2));
            
            let response;
            if (data._id) {
                response = await fetch(`http://localhost:5003/api/booking/update-booking/${data._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formattedData),
                });
            } else {
                response = await fetch("http://localhost:5003/api/booking/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formattedData),
                });
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server error:", errorText);
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }
            const result = await response.json();
            alert(result.message);
            
            console.log("Package being passed:", selectedPackage);
            
            console.log("Data being passed to booking summary:", {
                booking: {
                    ...result.booking || formattedData,
                    packagePrice: selectedPackage?.price,
                    addson: data.addson
                },
                currentUser,
                packageDetails: {
                    name: selectedPackage?.name,
                    price: selectedPackage?.price,
                    details: selectedPackage?.details
                }
            });
            
            navigate("/booking-summary", { 
                state: { 
                    booking: {
                        ...result.booking || formattedData,
                        packagePrice: selectedPackage?.price,
                        addson: data.addson || formattedData.addson || "None"
                    },
                    currentUser: currentUser,
                    packageDetails: {
                        name: selectedPackage?.name,
                        price: selectedPackage?.price,
                        details: selectedPackage?.details
                    }
                } 
            });
        } catch (error) {
            alert("Error submitting form: " + error.message);
            console.error("Form submission error:", error);
        }
    };

    // Enhanced custom styling for DatePicker
    const datePickerCustomStyles = `
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 1rem;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transform: scale(1.1);
            transform-origin: top center;
            margin-top: 4px;
        }
        .react-datepicker__header {
            background: linear-gradient(to right, #000000, #333333);
            border-bottom: none;
            padding: 1rem 0 0.75rem;
            position: relative;
        }
        .react-datepicker__header:after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, #d97706, #f59e0b, #d97706);
        }
        .react-datepicker__current-month {
            color: white !important;
            font-weight: 600;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
        }
        .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.85) !important;
            font-weight: 500;
            width: 2rem;
            margin: 0.2rem;
        }
        .react-datepicker__day {
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            margin: 0.2rem;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        .react-datepicker__day--selected {
            background: linear-gradient(135deg, #d97706, #f59e0b) !important;
            font-weight: 600;
            color: white;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
        .react-datepicker__day:hover {
            background-color: rgba(217, 119, 6, 0.15) !important;
            border-radius: 50%;
        }
        .react-datepicker__day--disabled {
            color: #ccc;
            cursor: not-allowed;
            text-decoration: line-through;
        }
        .react-datepicker__day--today {
            position: relative;
            font-weight: bold;
        }
        .react-datepicker__day--today:after {
            content: "";
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #f59e0b;
        }
        .react-datepicker__navigation {
            top: 1rem;
        }
        .react-datepicker__navigation-icon::before {
            border-color: #fff;
        }
        .react-datepicker__year-dropdown {
            background-color: #222;
            border: 1px solid #444;
            border-radius: 0.5rem;
        }
        .react-datepicker__year-option {
            color: white;
            padding: 0.5rem;
        }
        .react-datepicker__year-option:hover {
            background-color: #333;
        }
    `;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-800">
            {/* Custom styles for DatePicker */}
            <style>{datePickerCustomStyles}</style>

            {/* Top decorative element */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 opacity-80"></div>

            {/* Background image with pattern overlay */}
            <div
                className="absolute inset-0 opacity-15 mix-blend-overlay"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    filter: 'grayscale(40%)'
                }}
            ></div>

            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-black bg-opacity-50"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            ></div>

            {/* Main content */}
            <div className="relative min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full relative">
                    {/* Decorative photography elements */}
                    <div className="hidden lg:block absolute -left-16 -top-16 w-32 h-32 bg-amber-500 rounded-full opacity-20 blur-lg"></div>
                    <div className="hidden lg:block absolute -right-10 -bottom-10 w-24 h-24 bg-amber-600 rounded-full opacity-30 blur-lg"></div>

                    {/* Camera shutter decorative element */}
                    <div className="hidden lg:block absolute -right-8 -top-8 w-24 h-24">
                        <svg viewBox="0 0 100 100" className="opacity-20">
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#f59e0b" strokeWidth="2" />
                            <path d="M50 2 L50 98" stroke="#f59e0b" strokeWidth="2" />
                            <path d="M2 50 L98 50" stroke="#f59e0b" strokeWidth="2" />
                            <path d="M26 26 L74 74" stroke="#f59e0b" strokeWidth="2" />
                            <path d="M26 74 L74 26" stroke="#f59e0b" strokeWidth="2" />
                            <circle cx="50" cy="50" r="20" fill="none" stroke="#f59e0b" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Form container with glass morphism effect */}
                    <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-gray-100">
                        {/* Header section */}
                        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-10 px-8 relative overflow-hidden">
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

                            <div className="flex items-center mb-4 relative">
                                <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-amber-600 mr-4 rounded-full"></div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                    {existingBooking ? "Edit Your Session" : "Book Your Session"}
                                </h1>
                            </div>
                            <p className="text-gray-300 ml-5 italic relative">
                                {selectedPackage?.name ? `Selected Package: ${selectedPackage.name}` : "Create your perfect photoshoot"}
                            </p>

                            {/* Decorative elements */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500 rounded-full opacity-20 blur-md"></div>
                        </div>

                        {/* Form section */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 lg:p-12 space-y-8">
                            {/* Client info section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white text-lg font-bold mr-4 shadow-md">1</span>
                                    Client Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                {...register("fullName", { required: "Full Name is required" })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                readOnly
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                        </div>
                                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                {...register("email", {
                                                    required: "Email is required",
                                                    pattern: {
                                                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                                                        message: "Enter a valid email address",
                                                    }
                                                })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                readOnly
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                        </div>
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Telephone</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                {...register("telephone", { required: "Telephone is required" })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                placeholder="Enter your phone number"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                        </div>
                                        {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Session details section */}
                            <div className="mb-8 relative">
                                {/* Decorative camera shutter lines */}
                                <div className="absolute -right-20 -top-68 w-84 h-84 opacity-5 hidden lg:block">
                                    <svg viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" stroke="#000" strokeWidth="8" fill="none" />
                                        <circle cx="50" cy="50" r="20" stroke="#000" strokeWidth="4" fill="none" />
                                        <line x1="5" y1="50" x2="95" y2="50" stroke="#000" strokeWidth="2" />
                                        <line x1="50" y1="5" x2="50" y2="95" stroke="#000" strokeWidth="2" />
                                        <line x1="15" y1="15" x2="85" y2="85" stroke="#000" strokeWidth="2" />
                                        <line x1="15" y1="85" x2="85" y2="15" stroke="#000" strokeWidth="2" />
                                    </svg>
                                </div>

                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white text-lg font-bold mr-4 shadow-md">2</span>
                                    Session Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Package Type</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                {...register("packageType", { required: "Package Type is required" })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                readOnly
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                        </div>
                                        {errors.packageType && <p className="text-red-500 text-sm mt-1">{errors.packageType.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Location</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                {...register("location", { required: "Location is required" })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                placeholder="Where would you like your photoshoot?"
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                        </div>
                                        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Select Date</label>
                                        <div className="relative">
                                            <Controller
                                                name="date"
                                                control={control}
                                                rules={{ required: "Date is required" }}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        selected={field.value ? new Date(field.value) : null}
                                                        onChange={(date) => field.onChange(date)}
                                                        dateFormat="dd/MM/yyyy"
                                                        className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition bg-transparent"
                                                        minDate={new Date()}
                                                        excludeDates={bookedDates}
                                                        showYearDropdown
                                                        scrollableYearDropdown
                                                        yearDropdownItemNumber={15}
                                                        placeholderText="Click to select a date"
                                                        autoComplete="off"
                                                        wrapperClassName="w-full"
                                                    />
                                                )}
                                            />
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Select Time</label>
                                        <div className="relative">
                                            <select
                                                {...register("time", { required: "Select a time" })}
                                                className="w-full border-b-2 border-gray-300 py-3 px-2 focus:outline-none focus:border-amber-500 transition appearance-none bg-transparent"
                                            >
                                                <option value="morning session">Morning Session (8AM - 12PM)</option>
                                                <option value="afternoon session">Afternoon Session (1PM - 4PM)</option>
                                                <option value="evening session">Evening Session (5PM - 8PM)</option>
                                            </select>
                                            <div className="absolute bottom-0 left-0 w-0 group-focus-within:w-full h-0.5 bg-amber-500 transition-all duration-300"></div>
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Special requests section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white text-lg font-bold mr-4 shadow-md">3</span>
                                    Special Requests
                                </h2>
                                <div className="space-y-2 group">
                                    <label className="block text-gray-700 text-sm font-medium transition-all group-focus-within:text-amber-600">Add-ons</label>
                                    <div className="relative">
                                        <textarea
                                            {...register("addson")}
                                            className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-amber-500 transition bg-transparent h-32"
                                            placeholder="Additional services, special requests, or anything else we should know..."
                                        ></textarea>
                                        <div className="absolute bottom-0 left-0 right-0 h-0 group-focus-within:h-0.5 bg-amber-500 transition-all duration-300 rounded-b-lg"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Add a hidden input for packageId if needed */}
                            <input type="hidden" {...register("packageId")} />

                            {/* Submit button with enhanced styling */}
                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    className="px-12 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-lg shadow-xl hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transform transition hover:-translate-y-1 relative overflow-hidden group"
                                >
                                    <span className="relative z-10">
                                        {existingBooking ? "Update Session" : "Book Your Session"}
                                    </span>
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    <div className="absolute -inset-px border-2 border-white border-opacity-0 group-hover:border-opacity-20 rounded-lg transition-all"></div>
                                </button>
                            </div>
                        </form>

                        {/* Bottom decorative divider */}
                        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;