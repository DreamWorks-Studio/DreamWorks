import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MessageSquare, Search, Trash2, ChevronRight, Mail, User, Calendar, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
const AdminContact = () => {
  const [contactMessages, setContactMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5003/api/contact/messages');
      if (!response.ok) {
        throw new Error('Something went wrong');
      }
      const data = await response.json();
      setContactMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContactMessages();
  }, []);
  const filteredMessages = contactMessages.length > 0
    ? contactMessages.filter(msg =>
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  // View message details
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowDetails(true);
  };
  // Delete message handler
  const handleDeleteMessage = (messageId) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteMessage = async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/contact/messages/${messageToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete message');
      }
      // Remove the message from the local state
      setContactMessages(contactMessages.filter(msg => msg._id !== messageToDelete));
      toast.success('Message deleted successfully!');
      setDeleteDialogOpen(false);
      if (selectedMessage && selectedMessage._id === messageToDelete) {
        setShowDetails(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting message');
      setDeleteDialogOpen(false);
    }
  };
  // Animation variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    out: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0, 0.71, 0.2, 1.01]
      }
    })
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="ml-4 text-amber-600">Loading contact messages...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="bg-red-50 border border-red-200 rounded-xl text-red-700 p-6 max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Error Loading Contact Messages</h3>
          </div>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="p-6 max-w-7xl mx-auto bg-white min-h-screenp-6"
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
      >
        <div className="mb-8">
          <motion.div
            className="flex justify-between items-center"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <MessageSquare size={28} className="text-amber-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800">Contact Messages</h1>
            </div>
          </motion.div>
          {/* Breadcrumb navigation */}
          <motion.div
            className="flex items-center text-sm text-gray-500 mt-2"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <motion.button
              onClick={() => navigate("/admin")}
              className="hover:text-amber-600 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              Dashboard
            </motion.button>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-amber-600 font-medium">Contact Messages</span>
          </motion.div>
        </div>
        {/* Search Bar */}
        <motion.div
          className="mb-6"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <div className="flex items-center rounded-full bg-white shadow-md border border-gray-100 px-4 py-2 w-full max-w-md">
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Search by name, email or message content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none ml-2 focus:outline-none w-full text-sm"
            />
          </div>
        </motion.div>
        {/* Messages */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          {filteredMessages.length === 0 ? (
            <motion.div
              className="bg-amber-50 rounded-xl p-8 text-center border border-amber-100"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <Mail size={48} className="text-amber-300 mx-auto mb-4" />
              <p className="text-gray-600">No contact messages found.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index + 3}
                  whileHover={{ y: -4 }}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Mail size={20} className="text-amber-500" />
                        </div>
                        <h3 className="ml-3 text-lg font-bold text-gray-800 truncate">{message.name}</h3>
                      </div>
                    </div>
                    
                    {/* Email Badge */}
                    <div className="flex items-center mb-3">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-700 font-medium truncate max-w-full">
                        {message.email}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-100 my-3"></div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {message.message}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="p-1.5 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100 transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {/* Message Details Modal */}
        {showDetails && selectedMessage && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Message Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="text-amber-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="text-amber-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedMessage.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="text-amber-500" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Date Received</p>
                    <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Message</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDeleteDialogOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteMessage}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
export default AdminContact;