import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserStart,
    deleteUserSuucess,
    deleteUserFailure,
    signOut
} from "../src/redux/user/userSlice";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../src/firebase';
import UserBooking from '../components/UserBookings'
import UserPayment from '../components/UserPayment'
import CustomPopup from "../components/CustomPopup";

const UserProfile = () => {
    const dispatch = useDispatch();
    const fileRef = useRef(null);
    const [image, setImage] = useState(undefined);
    const [imagePercent, setImagePercent] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const { currentUser, loading, error } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
    const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });


    // Using UserProfile's formData initialization
    const [formData, setFormData] = useState({
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        password: "",
        avatar: currentUser?.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
    });

    // For file upload
    const [filePerc, setFilePerc] = useState(0);
    const [fileUploadError, setFileUploadError] = useState(false);
    // UserProfile1 specific state
    const [bookings, setBookings] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [payments, setPayments] = useState({});
    const [savedCards, setSavedCards] = useState([]);
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCard, setNewCard] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cvc: ''
    });
    // UserProfile's image effect
    useEffect(() => {
        if (image) {
            handleFileUpload(image);
        }
    }, [image]);
    // Keep UserProfile1's data fetching effect
    useEffect(() => {
        if (currentUser && currentUser._id) {
            const fetchUserData = async () => {
                try {
                    // Fetch bookings
                    try {
                        const bookingsResponse = await fetch(`/api/booking/user-bookings/${currentUser._id}`);
                        if (bookingsResponse.ok) {
                            const bookingsData = await bookingsResponse.json();
                            setBookings(bookingsData);
                            // Fetch payments for each booking
                            const paymentData = {};
                            for (const booking of bookingsData) {
                                try {
                                    const paymentResponse = await fetch(`/api/payments/getPayment?bookingId=${booking._id}`);
                                    if (paymentResponse.ok) {
                                        const paymentResult = await paymentResponse.json();
                                        paymentData[booking._id] = paymentResult;
                                    } else {
                                        paymentData[booking._id] = [];
                                    }
                                } catch (error) {
                                    console.error(`Error fetching payment for booking ${booking._id}:`, error);
                                    paymentData[booking._id] = [];
                                }
                            }
                            setPayments(paymentData);
                        }
                    } catch (error) {
                        console.error('Error fetching bookings:', error);
                    }
                    // Fetch saved cards
                    try {
                        const cardsResponse = await fetch(`/api/cards/user/${currentUser._id}`);
                        if (cardsResponse.ok) {
                            const cardsData = await cardsResponse.json();
                            setSavedCards(cardsData.cards || []);
                        }
                    } catch (error) {
                        console.error('Error fetching cards:', error);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [currentUser]);
    // From UserProfile - exact copy
    const handleFileUpload = (file) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFilePerc(Math.round(progress));
            },
            (error) => {
                setFileUploadError(true);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
                    setFormData({ ...formData, avatar: downloadURL })
                );
            }
        );
    };
    // From UserProfile - exact copy
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    // From UserProfile - exact copy
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create a new FormData object from the form element
        const form = e.target;
        const newFormData = {
            username: form.username.value || currentUser.username,
            email: form.email.value || currentUser.email,
            avatar: formData.avatar // Keep this from state
        };

        // Only add password if it has a value
        if (form.password.value && form.password.value.trim() !== '') {
            newFormData.password = form.password.value;
        }

        try {
            const btnElement = e.target.querySelector('button[type="submit"]');
            if (btnElement) btnElement.textContent = 'Saving...';

            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newFormData),
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(updateUserFailure(data));
                return;
            }
            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
            setShowEditProfile(false);
            setSuccessPopup({ show: true, message: 'Profile updated successfully!' });
        } catch (error) {
            dispatch(updateUserFailure(error));
            setErrorPopup({ show: true, message: error.message || 'Error updating profile' });
        }
    };
    // From UserProfile - exact copy
    const handleDeleteAccount = () => {
        setShowDeleteConfirmation(true);
    };

    const [toastMessage, setToastMessage] = useState({
        type: 'success',
        title: '',
        message: ''
    });

    const confirmDeleteAccount = async () => {
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to delete user");
            }
            dispatch(deleteUserSuucess(data));
            setShowDeleteConfirmation(false);

            setSuccessPopup({ show: true, message: 'Account deleted successfully' });

            setTimeout(() => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('role');
                navigate('/');
            }, 2500);
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
            setErrorPopup({ show: true, message: error.message || 'Failed to delete account' });
        }
    };
    // From UserProfile - exact copy
    const handleSignOut = async () => {
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('role');

            dispatch(signOut());
            await fetch('/api/auth/signout');

            navigate('/');
        } catch (error) {
            console.log(error);
        }


        // Redirect to home after sign out
        navigate('/');
    };
    // From UserProfile - exact copy
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setImageError(true);
                return;
            }
            setImage(file);
        }
    };
    // Keep UserProfile1 specific functions
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return "Rs. 0";
        return `Rs. ${Number(value).toLocaleString()}`;
    };
    const getPaymentInfo = (booking) => {
        // Existing getPaymentInfo function
        if (!booking || !booking._id) {
            return {
                totalPaid: 0,
                totalAmount: 0,
                remainingAmount: 0,
                packagePrice: 0,
                isPartiallyPaid: false,
                isFullyPaid: false,
                lastPaymentType: null,
                lastPaymentStatus: null,
                lastPaymentMethod: null
            };
        }

        const bookingPayments = payments[booking._id] || [];
        let totalPaid = 0;
        let lastPaymentType = null;
        let lastPaymentStatus = null;
        let lastPaymentMethod = null;
        let totalAmount = 0;
        let packagePrice = Number(booking.packagePrice) || 0;

        // Process payment data
        if (Array.isArray(bookingPayments) && bookingPayments.length > 0) {
            // Get the total amount from the first payment (original amount)
            const firstPayment = bookingPayments[0];
            if (firstPayment && firstPayment.totalAmount) {
                totalAmount = Number(firstPayment.totalAmount);
            }

            // Now process all payments to get the total paid amount
            bookingPayments.forEach(payment => {
                totalPaid += Number(payment.amountPaid) || 0;

                if (Number(payment.packagePrice) > 0) {
                    packagePrice = Number(payment.packagePrice);
                }

                lastPaymentType = payment.paymentType;
                lastPaymentStatus = payment.paymentStatus;
                lastPaymentMethod = payment.paymentMethod;
            });
        } else if (bookingPayments.payments && Array.isArray(bookingPayments.payments)) {
            if (bookingPayments.payments.length > 0) {
                // Get the total amount from the first payment
                const firstPayment = bookingPayments.payments[0];
                if (firstPayment && firstPayment.totalAmount) {
                    totalAmount = Number(firstPayment.totalAmount);
                }
            }

            bookingPayments.payments.forEach(payment => {
                totalPaid += Number(payment.amountPaid) || 0;

                if (Number(payment.packagePrice) > 0) {
                    packagePrice = Number(payment.packagePrice);
                }

                lastPaymentType = payment.paymentType;
                lastPaymentStatus = payment.paymentStatus;
                lastPaymentMethod = payment.paymentMethod;
            });
        }

        // If we didn't get a totalAmount from payments, calculate it
        if (totalAmount === 0) {
            totalAmount = packagePrice * 1.05 + 1000;
        }

        const remainingAmount = Math.max(0, totalAmount - totalPaid);

        return {
            totalPaid,
            totalAmount,
            remainingAmount,
            packagePrice,
            isPartiallyPaid: remainingAmount > 0 && totalPaid > 0,
            isFullyPaid: remainingAmount <= 0,
            lastPaymentType,
            lastPaymentStatus,
            lastPaymentMethod
        };
    };
    const toggleBookingDetails = (id) => {
        if (expandedBookingId === id) {
            setExpandedBookingId(null);
        } else {
            setExpandedBookingId(id);
        }
    };
    const handleRemainingPayment = (booking) => {
        if (!currentUser || !currentUser._id) return;

        const paymentInfo = getPaymentInfo(booking);
        const defaultCard = savedCards.find(card => card.isDefault);

        const packagePrice = paymentInfo.packagePrice || booking.packagePrice;

        navigate('/gateway', {
            state: {
                bookingId: booking._id,
                bookingDetails: {
                    _id: booking._id,
                    packageId: booking.packageId,
                    packageType: booking.packageType,
                    date: booking.date,
                    package: {
                        price: packagePrice,
                        id: booking.packageId,
                        name: booking.packageType
                    },
                    user: {
                        id: currentUser._id
                    },
                    totalAmount: paymentInfo.totalAmount
                },
                packageId: booking.packageId,
                packagePrice: packagePrice,
                packageType: booking.packageType,
                user: {
                    id: currentUser._id
                },
                totalAmount: paymentInfo.remainingAmount,
                userId: currentUser._id,
                paymentMethod: "card",
                defaultCard: defaultCard || null,
                isRemainingPayment: true,
                originalTotalAmount: paymentInfo.totalAmount
            }
        });
    };
    // Keep all the existing helper functions for UserPayment
    const handleNewCardChange = (e) => {
        const { name, value } = e.target;
        setNewCard(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser._id) return;

        if (!newCard.cardNumber || !newCard.expiryDate) {
            setErrorPopup({
                show: true,
                message: 'Please enter all required card information'
            });
            return;
        }

        try {
            const response = await fetch('/api/cards/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser._id,
                    cardNumber: newCard.cardNumber,
                    expiryDate: newCard.expiryDate
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Add the new card to the saved cards list
                setSavedCards(prev => [result.card, ...prev]);

                // Reset the form
                setNewCard({
                    cardNumber: '',
                    cardholderName: '',
                    expiryDate: '',
                    cvc: ''
                });

                // Hide the add card form
                setShowAddCard(false);

                // Show toast notification
                setSuccessPopup({
                    show: true,
                    message: 'Your new card has been added successfully.'
                });
            } else {
                const errorData = await response.json();
                setErrorPopup({
                    show: true,
                    message: `Failed to save card: ${errorData.message}`
                });
            }
        } catch (error) {
            console.error('Error saving card:', error);
            setErrorPopup({
                show: true,
                message: 'Failed to save card. Please try again.'
            });
        }
    };

    const [showDeleteCardConfirmation, setShowDeleteCardConfirmation] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const handleDeleteCard = (cardId) => {
        setCardToDelete(cardId);
        setShowDeleteCardConfirmation(true);
    };
    const confirmDeleteCard = async () => {
        try {
            if (!cardToDelete) return;

            const response = await fetch(`/api/cards/${cardToDelete}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Update the cards list after deletion
                setSavedCards(savedCards.filter(card => card._id !== cardToDelete));

                setSuccessPopup({
                    show: true,
                    message: 'Your card has been removed successfully.'
                });
            } else {
                throw new Error('Failed to delete card');
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            setErrorPopup({
                show: true,
                message: 'Failed to delete card. Please try again.'
            });
        } finally {
            setShowDeleteCardConfirmation(false);
            setCardToDelete(null);
        }
    };

    const handleSetDefaultCard = async (cardId) => {
        if (!cardId) {
            console.error('Card ID is undefined');
            return;
        }
        try {
            const response = await fetch(`/api/cards/${cardId}/default`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser._id
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            setSavedCards(prev => prev.map(card => ({
                ...card,
                isDefault: card._id === cardId
            })));

            setSuccessPopup({
                show: true,
                message: 'Your default payment card has been updated successfully.'
            });

        } catch (error) {
            console.error('Error setting default card:', error);
            setErrorPopup({
                show: true,
                message: 'Failed to set default card. Please try again.'
            });
        }
    };

    const handleEditCard = (card) => {
        setNewCard({
            cardId: card._id,
            cardNumber: card.cardNumber,
            cardholderName: '',
            expiryDate: card.expiryDate,
            cvc: ''
        });

        setShowAddCard(true);
    };

    const handleUpdateCard = async (e) => {
        e.preventDefault();

        if (!newCard.expiryDate) {
            setErrorPopup({
                show: true,
                message: 'Please enter the expiry date'
            });
            return;
        }

        try {
            const response = await fetch(`/api/cards/${newCard.cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    expiryDate: newCard.expiryDate
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Update the card in the saved cards list
                setSavedCards(prev => prev.map(card =>
                    card._id === newCard.cardId ? result.card : card
                ));

                // Reset the form
                setNewCard({
                    cardNumber: '',
                    cardholderName: '',
                    expiryDate: '',
                    cvc: ''
                });

                // Hide the add card form
                setShowAddCard(false);

                setSuccessPopup({
                    show: true,
                    message: 'Your card details have been updated successfully.'
                });
            } else {
                const errorData = await response.json();
                setErrorPopup({
                    show: true,
                    message: `Failed to update card: ${errorData.message}`
                });
            }
        } catch (error) {
            console.error('Error updating card:', error);
            setErrorPopup({
                show: true,
                message: 'Failed to update card. Please try again.'
            });
        }
    };

    const handleCardFormSubmit = (e) => {
        if (newCard.cardId) {
            // If cardId exists, we're editing an existing card
            handleUpdateCard(e);
        } else {
            // Otherwise, we're adding a new card
            handleAddCard(e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-amber-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>
                <p className="mt-6 text-amber-700 font-medium text-xl">Loading Your Memories</p>
                <p className="text-gray-500 mt-2">Please wait while we prepare your profile</p>
            </div>
        );
    }

    // Show error state - updated to match loading state design
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-white">
                <div className="bg-white shadow-xl rounded-2xl max-w-md w-full text-center p-8 border-t-4 border-amber-500">
                    <div className="text-amber-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">
                        {typeof error === 'object' ?
                            (error.message || JSON.stringify(error)) :
                            error?.toString() || "An unknown error occurred"}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-300 shadow-md w-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black/80">
            {/* Navbar with Home and Sign Out - Frosted Glass Effect */}
            <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-amber-100">
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-24">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-gray-800 bg-clip-text text-transparent">My Profile</h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 text-gray-900 hover:text-amber-600 transition-colors flex items-center text-lg font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-12 h-11 bg-amber-500 hover:bg-amber-50 text-white hover:text-amber-500 rounded-full shadow-sm transition flex items-center justify-center"
                            aria-label="Return to Homepage"
                            title="Return to Homepage"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* User Profile Card - Modern Glass Card */}
                <div className="bg-white backdrop-blur-md rounded-3xl shadow-lg mb-8 overflow-hidden border border-amber-50">
                    <div className="relative h-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    </div>
                    <div className="px-8 py-8 pb-10 relative">
                        {/* Avatar Upload - Enhanced Design */}
                        <div
                            onClick={() => fileRef.current.click()}
                            className="absolute -top-20 left-8 cursor-pointer group"
                        >
                            <input
                                type="file"
                                ref={fileRef}
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {/* User Avatar - Improved styling */}
                            {formData.avatar ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-y-amber-500 border-x-white shadow-xl group-hover:shadow-amber-200 transition-all duration-300">
                                    <img
                                        src={formData.avatar}
                                        alt="profile"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-amber-400 to-amber-600 w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-xl group-hover:shadow-amber-200 transition-all duration-300">
                                    {(currentUser?.username || 'User')
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                            {/* Upload progress overlay */}
                            {filePerc > 0 && filePerc < 100 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                    <div className="text-white font-bold">{filePerc}%</div>
                                </div>
                            )}

                            {/* Hover overlay - Improved styling */}
                            <div className="absolute inset-0  rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* User Info and Actions - Enhanced */}
                        <div className="mt-16 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
                                    {(currentUser?.username || 'User')}
                                </h2>
                                <p className="text-amber-600 text-xl mt-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {currentUser?.email || 'N/A'}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowEditProfile(!showEditProfile);
                                        setUpdateSuccess(false);
                                    }}
                                    className="px-4 py-3 border border-gray-200 rounded-full text-gray-800 hover:text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-colors text-sm font-medium flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-3 border border-red-200 rounded-full text-red-600 hover:text-red-600 hover:bg-red-50 hover:border-red-600 transition-colors text-sm font-medium flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Profile Form - When expanded */}
                {showEditProfile && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
                        <div className="w-160 bg-white backdrop-blur-md rounded-3xl shadow-lg mb-8 overflow-hidden border border-amber-100 p-8 animate-fadeIn mx-auto">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">Edit Your Profile</h2>
                        <form onSubmit={handleSubmit} className="space-y-6 ml-10">
                            <div>
                                <label className="block text-lg font-medium text-gray-600 mb-2">Username</label>
                                <input
                                    className="w-96 rounded-lg p-3 text-gray-800 border border-gray-700 hover:border-2 hover:border-amber-500 focus:border-amber-500 focus:outline-none"
                                    onChange={handleChange}
                                    defaultValue={currentUser.username}
                                    type="text"
                                    id="username"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    className="w-96 rounded-lg p-3 text-gray-800 border border-gray-700 hover:border-2 hover:border-amber-500 focus:border-amber-500 focus:outline-none"
                                    onChange={handleChange}
                                    defaultValue={currentUser.email}
                                />
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-600 mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    onChange={handleChange} className="w-96 rounded-lg p-3 text-gray-800 border border-gray-700 hover:border-2 hover:border-amber-500 focus:border-amber-500 focus:outline-none" />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditProfile(false)}
                                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition font-medium focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            {updateSuccess && (
                                <div className="mt-4 py-3 px-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Profile updated successfully!
                                </div>
                            )}
                        </form>
                    </div>
                    </div>
                )}

                {/* Booking and Payment Cards - Grid Layout */}
                <div className="grid gap-8 md:grid-cols-2 mb-8">
                    <UserBooking
                        bookings={bookings}
                        expandedBookingId={expandedBookingId}
                        toggleBookingDetails={toggleBookingDetails}
                        getPaymentInfo={getPaymentInfo}
                        formatCurrency={formatCurrency}
                        handleRemainingPayment={handleRemainingPayment}
                        navigate={navigate}
                        payments={payments}
                    />

                    <UserPayment
                        savedCards={savedCards}
                        setSavedCards={setSavedCards}
                        showAddCard={showAddCard}
                        setShowAddCard={setShowAddCard}
                        newCard={newCard}
                        setNewCard={setNewCard}
                        handleNewCardChange={handleNewCardChange}
                        handleCardFormSubmit={handleCardFormSubmit}
                        handleEditCard={handleEditCard}
                        handleDeleteCard={handleDeleteCard}
                        handleSetDefaultCard={handleSetDefaultCard}
                        currentUser={currentUser}
                        handleUpdateCard={handleUpdateCard}
                        handleAddCard={handleAddCard}
                        setSuccessPopup={setSuccessPopup}
                        setErrorPopup={setErrorPopup}
                    />
                </div>
            </div>
            {/* Delete Account Confirmation Dialog */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white bg-opacity-80 rounded-3xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn backdrop-filter backdrop-blur border border-gray-100"><div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Delete Your Account?</h2>
                        <p className="text-gray-600 mt-2">
                            This action cannot be undone. All your data, including bookings and payment information, will be permanently removed.
                        </p>
                    </div>
                        <div className="flex space-x-3 justify-center">
                            <button
                                onClick={() => setShowDeleteConfirmation(false)}
                                className="px-6 py-3 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteAccount}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-colors flex-1"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteCardConfirmation && (
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white bg-opacity-80 rounded-3xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn backdrop-filter backdrop-blur border border-gray-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Card</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this card? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3 justify-center">
                                <button
                                    onClick={() => setShowDeleteCardConfirmation(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteCard}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-colors flex-1"
                                >
                                    Delete Card
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <CustomPopup
                show={successPopup.show}
                message={successPopup.message}
                type="success"
                onClose={() => setSuccessPopup({ show: false, message: '' })}
            />
            <CustomPopup
                show={errorPopup.show}
                message={errorPopup.message}
                type="error"
                onClose={() => setErrorPopup({ show: false, message: '' })}
            />
        </div>
    );
};

export default UserProfile;