import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  // Effect to auto-close popup after 3 seconds
  useEffect(() => {
    let timer;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000); // 3 seconds timeout
    }
    return () => clearTimeout(timer);
  }, [showPopup]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        // Show success popup
        setPopupMessage('We received your inquiry. Our team will contact you soon!');
        setPopupType('success');
        setShowPopup(true);

        // Reset form
        setFormData({ name: '', email: '', message: '' });
        setStatus({ loading: false, success: '', error: '' });
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      // Show error popup
      setPopupMessage(error.message || 'Failed to send message. Please try again.');
      setPopupType('error');
      setShowPopup(true);
      setStatus({ loading: false, success: '', error: '' });
    }
  };
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      {/* Header */}
      <div className="container mx-auto px-4 pt-32 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Contact <span className="text-amber-500">Us</span>
        </h1>
        <div className="w-32 h-1 bg-amber-500 mx-auto mt-4"></div>
        <p className="text-gray-700 mt-4 max-w-lg mx-auto">
          We'd love to hear from you. Reach out for inquiries, bookings, or just to say hello.
        </p>
      </div>
      {/* Contact Form */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto bg-gray-50 rounded-xl shadow-md shadow-amber-200 p-6"
        >
          <form className="text-gray-800" onSubmit={handleSubmit}>
            <div className="flex flex-wrap gap-y-4">
              <div className="w-full md:w-1/2 md:pr-3">
                <label className="block text-gray-700 font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 focus:outline-none transition-colors duration-300"
                />
              </div>
              <div className="w-full md:w-1/2 md:pl-3">
                <label className="block text-gray-700 font-medium mb-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 focus:outline-none transition-colors duration-300"
                />
              </div>
              <div className="w-full mt-3">
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project or inquiry..."
                  required
                  className="w-full border border-gray-200 focus:border-amber-500 rounded-lg py-2 px-4 h-32 resize-none focus:outline-none transition-colors duration-300"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-amber-500 text-white font-bold py-2 px-8 rounded-full hover:bg-amber-600 transition-all duration-300"
                disabled={status.loading}
              >
                {status.loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Contact Info */}
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
                <div className="flex justify-center">{info.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-amber-500">{info.title}</h3>
                <p className="text-gray-100">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md mx-4 pointer-events-auto">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                {popupType === 'success' ? (
                  <svg
                    className="checkmark"
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                    viewBox="0 0 52 52"
                  >
                    <circle
                      className="checkmark__circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                    />
                    <path
                      className="checkmark__check"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="48"
                      strokeDashoffset="48"
                      d="M14.1 27.2l7.1 7.2 16.7-16.8"
                      style={{
                        animation: "dash 0.8s ease-in-out forwards",
                      }}
                    />
                  </svg>
                ) : (
                  <svg
                    className="crossmark"
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                    viewBox="0 0 52 52"
                  >
                    <circle
                      className="crossmark__circle"
                      cx="26"
                      cy="26"
                      r="25"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <path
                      className="crossmark__path"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeLinecap="round"
                      d="M16,16 L36,36 M36,16 L16,36"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-2xl text-center font-bold ${popupType === 'success' ? 'text-amber-500' : 'text-red-600'}`}>
                  {popupType === 'success' ? 'Success' : 'Error'}
                </h3>
                <p className="text-gray-600 text-center mb-5">{popupMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx="true">{`
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      <Footer />

      <Footer />
    </div>
  );
};

export default Contact;
