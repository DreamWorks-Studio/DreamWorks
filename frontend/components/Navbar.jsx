import React, { useEffect, useState } from 'react'
import { FaAlignRight, FaTimes } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // State to handle dropdown visibility
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };

  // Handle Sign Up button click
  const handleSignUpClick = () => {
    navigate('/sign-in'); // Navigate to the signup page
  };

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showMobileMenu])

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  
  const isHome = location.pathname === '/'
  const navbarBackground = isHome && !scrolled 
    ? 'bg-transparent' 
    : 'bg-white bg-opacity-95 shadow-md backdrop-blur-sm'
  
  const textColor = isHome && !scrolled ? 'text-white' : 'text-gray-800'
  const hoverColor = 'hover:text-amber-500'
  const activeLinkClass = 'text-amber-500'

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navbarBackground}`}>
      <div className='container mx-auto flex justify-between items-center py-3 px-6 md:px-20 lg:px-32'>
        <Link to="/" className="flex items-center gap-2">
          <img src="src/assets/web_logo.png" alt="logo" className='h-12 w-auto'/>
        </Link>
        <ul className='hidden md:flex gap-8 font-medium'>
          <Link to="/" className={`${textColor} ${hoverColor} transition-colors duration-200 ${location.pathname === '/' ? activeLinkClass : ''}`}>Home</Link>
          <Link to='/gallery' className={`${textColor} ${hoverColor} transition-colors duration-200 ${location.pathname === '/gallery' ? activeLinkClass : ''}`}>Gallery</Link>
          <Link to="/contact" className={`${textColor} ${hoverColor} transition-colors duration-200 ${location.pathname === '/contact' ? activeLinkClass : ''}`}>Contact</Link>
          <Link to="/packages" className={`${textColor} ${hoverColor} transition-colors duration-200 ${location.pathname === '/packages' ? activeLinkClass : ''}`}>Packages</Link>
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
              // Display Sign Up button if user is not logged in
              <li
                onClick={handleSignUpClick} // Navigate to /signup on click
                className="hidden md:block bg-transparent text-amber-500 hover:text-white px-5 py-2
          border-2 border-amber-500 hover:bg-amber-500 transition-colors duration-300 rounded-full"
              >
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
          className={`md:hidden h-10 w-10 cursor-pointer ${textColor} fixed top-6 right-6 p-2 rounded-full bg-amber-500
          shadow-lg transition-all duration-300 hover:bg-amber-600 hover:text-white hover:scale-105`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed right-0 top-0 bottom-0 overflow-hidden bg-white text-gray-800 shadow-2xl transition-all duration-450 ease-in-out
        ${showMobileMenu ? 'opacity-100' : 'opacity-0'} ${showMobileMenu ? 'w-full' : 'w-0'}`}
      >
        <div className='flex justify-end p-6'>
          <FaTimes
            onClick={() => setShowMobileMenu(false)}
            className={`md:hidden h-6 w-12 mt-7 mr-3 cursor-pointer text-amber-500 
            transition-transform duration-300 ease-in-out ${showMobileMenu ? 'rotate-0' : 'rotate-270 opacity-0'}`}
          />
        </div>
        
        <div className="flex justify-center mt-6 mb-10">
          <img src="src/assets/web_logo.png" alt="logo" className='h-16 w-auto' />
        </div>

        <ul className="flex flex-col items-center gap-4 mt-4 px-5 text-lg font-medium">
          <Link onClick={() => setShowMobileMenu(false)} to="/" className="px-6 py-3 text-gray-800 hover:text-amber-500 transition-colors duration-200 rounded-full inline-block">Home</Link>
          <Link onClick={() => setShowMobileMenu(false)} to="/about" className="px-6 py-3 text-gray-800 hover:text-amber-500 transition-colors duration-200 rounded-full inline-block">About</Link>
          <Link onClick={() => setShowMobileMenu(false)} to="/gallery" className="px-6 py-3 text-gray-800 hover:text-amber-500 transition-colors duration-200 rounded-full inline-block">Gallery</Link>
          <Link onClick={() => setShowMobileMenu(false)} to="/contact" className="px-6 py-3 text-gray-800 hover:text-amber-500 transition-colors duration-200 rounded-full inline-block">Contact</Link>
        </ul>

        <div className="absolute bottom-10 w-full text-center text-gray-500">
          <p className="text-sm">© 2025 Dreamwork Studio</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
