import React from 'react'
import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Contact = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar/>
      
      {/* Header Section - Increased text size and reduced padding */}
      <div className="container mx-auto px-4 pt-32 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Contact <span className="text-amber-500">Us</span>
        </h1>
        <div className="w-32 h-1 bg-amber-500 mx-auto mt-4"></div>
        <p className="text-gray-700 mt-4 max-w-lg mx-auto">
          We'd love to hear from you. Reach out for inquiries, bookings, or just to say hello.
        </p>
      </div>
      
      {/* Contact Form Section - Reduced padding and brightened colors */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-md shadow-amber-200 p-6"
        >
          <form className="text-gray-800">
            <div className="flex flex-wrap gap-y-4">
              <div className="w-full md:w-1/2 md:pr-3">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="name">Your Name</label>
                <input 
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 focus:outline-none transition-colors duration-300" 
                  type="text"
                  name="Name" 
                  placeholder="Your Name" 
                  required 
                />
              </div>
              <div className="w-full md:w-1/2 md:pl-3">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="email">Your Email</label>
                <input 
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 focus:outline-none transition-colors duration-300" 
                  type="email"
                  name="Email" 
                  placeholder="Your Email" 
                  required 
                />
              </div>
              <div className="w-full mt-3">
                <label className="block text-gray-700 font-medium mb-1" htmlFor="message">Message</label>
                <textarea 
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 h-32 resize-none focus:outline-none transition-colors duration-300"
                  name="Message" 
                  placeholder="Tell us about your project or inquiry..." 
                  required
                ></textarea>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button 
                className="bg-amber-500 text-white font-bold py-2 px-8 rounded-full hover:bg-amber-600 transition-all duration-300"
                type="submit"
              >
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      
      {/* Contact Information with Icons */}
      <div className="bg-gray-50 py-12 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-10">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaMapMarkerAlt className="text-amber-500 text-3xl mb-4" />,
                title: "Visit Us",
                description: "DreamWork Studio, Yampanwatta, 2nd Lane, Badulla, Sri Lanka"
              },
              {
                icon: <FaEnvelope className="text-amber-500 text-3xl mb-4" />,
                title: "Email Us",
                description: "info@dreamworkstudio.com"
              },
              {
                icon: <FaPhoneAlt className="text-amber-500 text-3xl mb-4" />,
                title: "Call Us",
                description: "+94-72-190-8494"
              }
            ].map((info, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-black/90 p-6 rounded-lg text-center shadow-sm hover:shadow-md transition-all duration-300 border-t-2 border-amber-500"
              >
                <div className="flex justify-center">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-500">{info.title}</h3>
                <p className="text-gray-100">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  )
}

export default Contact