import React from 'react'
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaMobileAlt, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="pt-4 px-4 md:px-20 lg:px-32 bg-black w-full overflow-hidden"id="Footer">
        <div className="max-w-7xl mx-auto border-t border-gray-500 pt-8">
            <div className='container mx-auto flex flex-col md:flex-row justify-between items-start ml-4 md:ml-14'> 
                <div className='w-full md:w-1/4 mb-8 md:mb-0'>
                    <img src="src/assets/web_logo.png" alt="" className='w-52'/>
                </div>
                <div className='w-full md:w-3/4 flex flex-row justify-center'>
                    <div className='w-full md:w-1/3 mb-8 md:mb-0'>
                        <h3 className='text-gray-400 text-lg font-bold mb-4 underline underline-offset-8 decoration-amber-600'>Contact Us</h3>
                        <div className='text-gray-400 text-sm ml-4'>
                            <div className='flex items-center space-x-2.5 mt-4 text-sm'>
                                <FaMapMarkerAlt className='mb-1 mt-1 mr-1 text-amber-600'/><strong>Address:</strong>
                            </div>
                            <p className='ml-4'>DreamWork Studio <br/>
                                   Yampanwatta, <br/>2nd Lane, Badulla, <br/>
                                   Sri Lanka
                            </p>
                            <div className='flex items-center space-x-2.5 mt-4 text-sm'>
                                <FaMobileAlt className='mb-1 mt-1 mr-1 text-amber-600'/><strong>Mobile:</strong>
                            </div>
                                <p className='ml-4'>+94-72-190-8494/<br/>
                                +94-76-965-5970</p>
                            
                        </div>
                    </div>
                    <div className='w-full md:w-1/3 mb-8 md:mb-0 md:pl-4'>
                        <h3 className='text-gray-400 text-lg font-bold mb-4 underline underline-offset-8 decoration-amber-600'>Quick Links</h3>
                        <ul className='list-[square] flex flex-col gap-2.5 text-gray-400 marker:text-amber-600 ml-6'>
                            <li><a href="#Header" className='hover:text-amber-600'>Home</a></li>
                            <li><a href="#About" className='hover:text-amber-600'>About</a></li>
                            <li><a href="#" className='hover:text-amber-600'>Gallery</a></li>
                        </ul>
                    </div>
                    <div className='w-full md:w-1/3'>
                        <h3 className='text-gray-400 text-lg font-bold mb-4 underline underline-offset-8 decoration-amber-600'>Connect with Us</h3>
                        <ul className='flex flex-col gap-4 mb-4 max-w-80'>
                            <li className='flex items-center space-x-2.5'>
                                <FaFacebook className='text-gray-400 text-2xl' />
                                <a href="#" className='text-gray-400 hover:text-amber-600'>Facebook</a>
                            </li>
                            <li className='flex items-center space-x-2.5'>
                                <FaInstagram className='text-gray-400 text-2xl' />
                                <a href="#" className='text-gray-400 hover:text-amber-600'>Instagram</a>
                            </li>
                            <li className='flex items-center space-x-2.5'>
                                <FaWhatsapp className='text-gray-400 text-2xl' />
                                <a href="#" className='text-gray-400 hover:text-amber-600'>WhatsApp</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='border-t border-gray-500 py-3 mt-10 text-center text-sm text-gray-400'>
                Copyrights <span className='text-amber-600'>© </span>DreamWorks Photography Studio.2025 | All rights reserved.
            </div>
        </div>
    </div>
  );
}

export default Footer