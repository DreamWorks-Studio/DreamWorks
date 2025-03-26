import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ViewPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
          try {
            const response = await fetch('http://localhost:5003/api/package/viewPackages');
            
            if (!response.ok) {
              throw new Error('Failed to fetch packages');
            }
    
            const data = await response.json();
            setPackages(data);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching packages:', error);
            toast.error('Failed to load packages');
            setLoading(false);
          }
        };
    
        fetchPackages();
      }, []);

      const handleBookNow = (packageItem) => {
        // Navigate to booking form with package details
        navigate('/booking', { 
          state: { 
            selectedPackage: {
              name: packageItem.packagename,
              price: packageItem.packagePrice,
              details: packageItem.packageDetails,
              validity: packageItem.packagevalidity
            } 
          } 
        });
      };  
    
      if (loading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
          </div>
        );
      }
    
      return (
        <div className='flex flex-col min-h-screen bg-gray-50'>
          <Navbar className="sticky top-0 z-50 shadow-md"/>
          <div className="container mx-auto px-4 py-8 flex-grow pt-32">
            <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800 tracking-tight">
              Our Packages
            </h1>
            
            {packages.length === 0 ? (
              <div className="text-center text-gray-600 text-xl">
                No packages available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((packageItem) => (
                  <div 
                    key={packageItem._id} 
                    className="bg-white shadow-lg rounded-xl overflow-hidden transform transition duration-300 hover:shadow-2xl hover:scale-105 border border-gray-200"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {packageItem.packagename}
                        </h2>
                        <div className="h-0.5 bg-amber-600 w-16 mb-4"></div>
                      </div>
                      
                      <div className="flex-grow space-y-3 mb-6">
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Package Details</p>
                          <p className="text-gray-800 font-medium">
                            {packageItem.packageDetails}
                          </p>
                        </div>
                        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                          <span className="text-sm text-gray-600">Price</span>
                          <span className="text-xl font-bold text-amber-600">
                            Rs.{packageItem.packagePrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                          <span className="text-sm text-gray-600">Validity</span>
                          <span className="text-gray-800 font-medium">
                            {new Date(packageItem.packagevalidity).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleBookNow(packageItem)}
                        className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition duration-300 ease-in-out transform hover:scale-101 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 font-semibold uppercase tracking-wider"
                      >
                        Book Now
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
          <Footer className="bg-gray-100 py-6 mt-8"/>
        </div>
      );  
}

export default ViewPackages