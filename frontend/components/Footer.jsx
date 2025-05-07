import React from 'react'
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaMobileAlt, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-8 px-4 md:px-20 lg:px-32 bg-black w-full overflow-hidden" id="Footer">
        <div className="max-w-7xl mx-auto">
            {/* Footer Top Section with Logo */}
            <div className="flex justify-center mb-8">
                <Link to="/" className="flex items-center gap-2">
                    <img src="src/assets/web_logo.png" alt="DreamWorks Photography" className="h-12 w-auto"/>
                </Link>
            </div>
            
            {/* Main Footer Content */}
            <div className='container mx-auto flex flex-col md:flex-row justify-between items-start gap-8'> 
                <div className='w-full md:w-1/3 mb-6 md:mb-0'>
                    <h3 className='text-white text-base font-semibold mb-4 relative'>
                        <span className="relative z-10">About Us</span>
                        <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500"></span>
                    </h3>
                    <p className="text-gray-300 pr-4 text-sm leading-relaxed">
                        DreamWork Studio captures life's precious moments with artistic vision and 
                        technical excellence. Our passion for photography transforms ordinary scenes 
                        into extraordinary memories that last a lifetime.
                    </p>
                    <div className="flex items-center space-x-3 mt-4">
                        <a href="#" className="bg-transparent text-amber-500 hover:text-white border border-amber-500 hover:bg-amber-500 p-1.5 rounded-full transition-colors duration-300">
                            <FaFacebook className="text-sm" />
                        </a>
                        <a href="#" className="bg-transparent text-amber-500 hover:text-white border border-amber-500 hover:bg-amber-500 p-1.5 rounded-full transition-colors duration-300">
                            <FaInstagram className="text-sm" />
                        </a>
                        <a href="#" className="bg-transparent text-amber-500 hover:text-white border border-amber-500 hover:bg-amber-500 p-1.5 rounded-full transition-colors duration-300">
                            <FaWhatsapp className="text-sm" />
                        </a>
                    </div>
                </div>
                
                <div className='w-full md:w-1/3 mb-6 md:mb-0'>
                    <h3 className='text-white text-base font-semibold mb-4 relative'>
                        <span className="relative z-10">Quick Links</span>
                        <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500"></span>
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <Link to="/" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>Home</Link>
                        <Link to="/about" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>About</Link>
                        <Link to="/gallery" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>Gallery</Link>
                        <Link to="/contact" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>Contact</Link>
                        <Link to="/packages" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>Packages</Link>
                        <Link to="/sign-in" className='text-gray-300 hover:text-amber-500 transition-colors duration-200'>Sign Up</Link>
                    </div>
                </div>
                
                <div className='w-full md:w-1/3'>
                    <h3 className='text-white text-base font-semibold mb-4 relative'>
                        <span className="relative z-10">Contact Info</span>
                        <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-amber-500"></span>
                    </h3>
                    <div className='text-gray-300 space-y-3 text-sm'>
                        <div className='flex items-start space-x-2'>
                            <FaMapMarkerAlt className='text-amber-500 mt-1 flex-shrink-0'/>
                            <p>DreamWork Studio, Yampanwatta, 2nd Lane, Badulla, Sri Lanka</p>
                        </div>
                        
                        <div className='flex items-start space-x-2'>
                            <FaMobileAlt className='text-amber-500 mt-1 flex-shrink-0'/>
                            <p>+94-72-190-8494<br/>+94-76-965-5970</p>
                        </div>
                        
                        <div className='flex items-start space-x-2'>
                            <FaEnvelope className='text-amber-500 mt-1 flex-shrink-0'/>
                            <p>info@dreamworkstudio.com</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer Bottom with Copyright */}
            <div className='border-t border-gray-900 py-4 mt-8 text-center text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center'>
                <p>© {currentYear} DreamWorks Photography Studio | All rights reserved</p>
                <p className="mt-1 md:mt-0">Capturing <span className="text-amber-500">moments</span> that last forever</p>
            </div>
        </div>
    </div>
  );
}

export default Footer