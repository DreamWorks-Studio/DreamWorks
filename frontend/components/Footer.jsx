import React from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-950 px-4 md:px-16 lg:px-28 py-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
        <img 
            src="/src/assets/web_logo.png" 
            alt="DreamWorks Studio Logo" 
            className="w-42 h-auto"
          />
        </div>
        <div>
        <h2 className="text-lg font-bold mb-4">Contact Us</h2>
        <p className="text-gray-300">
            <strong>Address:</strong>  DreamWork Studio,Yampanwatta, 2nd Lane, Badulla
            <br />
            <strong>Hotline:</strong> +94721908494, +94769655970
          </p>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-4">Connect with Us</h2>
          <ol className="space-y-4">
            <li className="flex items-center space-x-2">
              <FaFacebook className="text-white-500 text-xl" />
              <a href="#" className="hover:underline text-gray-300">Facebook</a>
            </li>
            <li className="flex items-center space-x-2">
              <FaInstagram className="text-white-500 text-xl" />
              <a href="#" className="hover:underline text-gray-300">Instagram</a>
            </li>
            <li className="flex items-center space-x-2">
              <FaWhatsapp className="text-white-500 text-xl" />
              <a href="#" className="hover:underline text-gray-300">Whatsapp</a>
            </li>
          </ol>
        </div>
      </div>
      <div className="border-gray-600 border-t p-4 text-gray-300 text-center">
        <p>© 2025 DreamWorks Photography Studio. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
