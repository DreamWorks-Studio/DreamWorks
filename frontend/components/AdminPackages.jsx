import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/package/viewPackages');
  
        if(!response.ok){
          throw new Error('Something went wrong');
        } 
  
        const data = await response.json();
        setPackages(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);
  
  const filteredPackages = packages.length > 0 
    ? packages.filter(pkg => 
        pkg.packagename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.packageDetails?.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

  // Update Package Handler
  const handleUpdatePackage = (packageId) => {
    navigate(`/update-package/${packageId}`);
  };

  // Delete Package Handler
  const handleDeletePackage = async (packageId) => {
    try {
      // Confirm deletion
      const confirmDelete = window.confirm('Are you sure you want to delete this package?');
      
      if (confirmDelete) {
        const response = await fetch(`http://localhost:5003/api/package/deletePackage/${packageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete package');
        }

        // Remove the package from the local state
        setPackages(packages.filter(pkg => pkg._id !== packageId));
        toast.success('Package deleted successfully!'); // Show success toast
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting package'); // Show error toast
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading packages...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl">Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="flex bg-cover bg-center min-h-screen" style={{ backgroundImage: "url('/images/background.jpg')" }}></div>
      
      
      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h2 className="font-bold text-lg mb-4">Promo Package</h2>
        <Link to="/package">
          <button className="bg-blue-200 px-4 py-2 rounded mb-4">+ add new package</button>
        </Link>
        <input 
          type="text" 
          placeholder="Search Packages" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-1/2 ml-3.5"
        />

        {/* Packages */}
        <div className="mt-6">
          {filteredPackages.length === 0 ? (
            <p className="text-gray-500 text-center">No packages found</p>
          ) : (
            filteredPackages.map((pkg) => (
              <div 
                key={pkg._id} 
                className="flex border p-4 rounded-lg mb-4"
              >
                <div className="w-20 h-20 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Image</span>
                </div>
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-bold">{pkg.packagename}</h3>
                  <p className="text-gray-600 text-sm">
                    {pkg.packageDetails}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-semibold">Price:</span> ${pkg.packagePrice}
                    <span className="ml-4 font-semibold">Validity:</span> {pkg.packagevalidity}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleUpdatePackage(pkg._id)}
                    className="bg-blue-200 p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-blue-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={() => handleDeletePackage(pkg._id)}
                    className="bg-red-200 p-2 rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default AdminPackages;
 