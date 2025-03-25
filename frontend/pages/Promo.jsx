import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Promo = () => {

  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);  
  const [error, setError] = useState(null);

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
      <div className="w-1/4 bg-gray-200 p-4 min-h-screen">
      <Link to = '/Standard'>
        <button className="w-full bg-gray-300 p-3 rounded mb-4">Standard Package</button></Link>
        <button className="w-full bg-gray-300 p-3 rounded">Promo Package</button>
      </div>
      
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
            className="border p-2 rounded w-1/2"
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
                
                <div className="flex items-center">
                  <Link to={`/Promoadd/${pkg._id}`}>
                    <button className="bg-green-200 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-green-800 font-bold">+</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Promo;