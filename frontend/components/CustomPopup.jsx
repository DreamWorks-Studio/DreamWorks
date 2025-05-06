import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle } from 'lucide-react';

const CustomPopup = ({ show, message, type = 'success', onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                    <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center max-w-md mx-4 pointer-events-auto">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            {type === 'success' ? (
                                <svg
                                    className="checkmark"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="60"
                                    height="60"
                                    viewBox="0 0 52 52"
                                >
                                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            ) : (
                                <XCircle size={40} className="text-red-500" />
                            )}
                        </div>
                        <div>
                            <h3 className={`text-2xl text-center font-bold ${type === 'success' ? 'text-amber-500' : 'text-red-600'}`}>
                                {type === 'success' ? 'Success' : 'Error'}
                            </h3>
                            <p className="text-gray-600 text-center mb-5">{message}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomPopup;