import React, { useState } from 'react';
import { FaAlignRight, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false); // State to handle dropdown visibility

    const location = useLocation();

    console.log("Nav bar ->", currentUser);

    const navbarColor = location.pathname === '/' ? 'bg-transparent' : 'bg-black';

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown); // Toggle dropdown visibility
    };

    return (
        <div className={`absolute top-0 left-0 w-full z-20 ${navbarColor}`}>
            <div className="container mx-auto flex justify-between items-center px-2 md:px-2 lg:px-32">
                <img src="src/assets/web_logo.png" alt="logo" className="w-24" />
                <ul className="hidden md:flex gap-7 text-white">
                    <Link to="/" className="text-white hover:text-amber-500">Home</Link>
                    <Link to="/gallery" className="text-white hover:text-amber-500">Gallery</Link>
                    <Link to="/Contact" className="text-white hover:text-amber-500">Contact</Link>
                </ul>

                <div className="relative">
                    {/* Profile Icon with Dropdown */}
                    <div
                        onClick={handleDropdownToggle} // Toggle dropdown on icon click
                        className="cursor-pointer"
                    >
                        {currentUser ? (
                            <img
                                className="rounded-full h-7 w-7 object-cover"
                                src={currentUser.avatar || "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif"}
                                alt="profile"
                            />
                        ) : (
                            <li className="hidden md:block bg-transparent text-amber-500 hover:text-white px-5 py-2 border-2 border-amber-500 hover:border-white rounded-full">
                                Sign Up
                            </li>
                        )}
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 bg-black text-white rounded-lg shadow-lg w-48 py-2 transform transition-all ease-in-out duration-300 opacity-100">
                            <Link
                                to="/profile"
                                onClick={() => setShowDropdown(false)}
                                className="block px-4 py-2 text-sm hover:bg-amber-600 rounded-md transition-all"
                            >
                                User Profile
                            </Link>

                            <Link
                                to="/payment"
                                onClick={() => setShowDropdown(false)}
                                className="block px-4 py-2 text-sm hover:bg-amber-600 rounded-md transition-all"
                            >
                                Payment
                            </Link>
                            <Link
                                to="/packages"
                                onClick={() => setShowDropdown(false)}
                                className="block px-4 py-2 text-sm hover:bg-amber-600 rounded-md transition-all"
                            >
                                Packages
                            </Link>
                            <Link
                                to="/bookings"
                                onClick={() => setShowDropdown(false)}
                                className="block px-4 py-2 text-sm hover:bg-amber-600 rounded-md transition-all"
                            >
                                Bookings
                            </Link>
                        </div>
                    )}
                </div>

                <FaAlignRight
                    onClick={() => setShowMobileMenu(true)}
                    className="md:hidden h-10 w-10 cursor-pointer text-white fixed top-11 right-10 p-2 rounded-2xl bg-amber-600 shadow-lg transition-transform duration-300 ease-in-out hover:bg-gray-100 hover:text-amber-600 hover:scale-110"
                />
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden fixed right-0 top-0 bottom-0 overflow-hidden bg-neutral-800 transition-all duration-450 ease-in-out
        ${showMobileMenu ? 'opacity-100' : 'opacity-0'} ${showMobileMenu ? 'w-full' : 'w-0'}`}
            >
                <div className="flex justify-end p-6">
                    <FaTimes
                        onClick={() => setShowMobileMenu(false)}
                        className={`md:hidden h-6 w-12 mt-7 mr-3 cursor-pointer text-amber-600 
               transition-transform duration-300 ease-in-out ${showMobileMenu ? 'rotate-0' : 'rotate-270 opacity-0'}`}
                    />
                </div>
                <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
                    <Link onClick={() => setShowMobileMenu(false)} to="/" className="px-4 py-2 text-white rounded-full inline-block">Home</Link>
                    <Link onClick={() => setShowMobileMenu(false)} to="/about" className="px-4 py-2 text-white rounded-full inline-block">About</Link>
                    <Link onClick={() => setShowMobileMenu(false)} to="/gallery" className="px-4 py-2 text-white rounded-full inline-block">Gallery</Link>
                    <Link onClick={() => setShowMobileMenu(false)} to="/contact" className="px-4 py-2 text-white rounded-full inline-block">Contact</Link>
                </ul>
            </div>
        </div>
    );
};

export default Navbar;
