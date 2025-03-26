import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Pack = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get the package ID from URL

  // Initial state for form
  const [formData, setFormData] = useState({
    packagename: '',
    packageDetails: '',
    packagePrice: '',
    packagevalidity: ''
  });

  // Fetch package details for editing
  useEffect(() => {
    // Check if we're in edit mode (id exists in URL)
    const fetchPackageDetails = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5003/api/package/getPackage/${id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch package details');
          }

          const packageData = await response.json();
          
          // Update form data with fetched package details
          setFormData({
            packagename: packageData.packagename,
            packageDetails: packageData.packageDetails,
            packagePrice: packageData.packagePrice,
            packagevalidity: packageData.packagevalidity
          });

          setLoading(false);
        } catch (error) {
          console.error('Error fetching package details:', error);
          toast.error('Failed to load package details');
          setLoading(false);
        }
      }
    };

    fetchPackageDetails();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Specific handling for price to trim
    if (id === 'packagePrice') {
      setFormData({ 
        ...formData, 
        [id]: value.trim() 
      });
    } else {
      // Normal handling for other fields
      setFormData({ 
        ...formData, 
        [id]: value 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields are filled
    if (!formData.packagename || !formData.packageDetails || !formData.packagePrice || !formData.packagevalidity) {
      return setErrorMessage('Please fill out all fields');
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Determine URL and method based on whether ID exists
      const url = id 
        ? `http://localhost:5003/api/package/updatePackage/${id}`
        : 'http://localhost:5003/api/package/addPackage';
      
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        return setErrorMessage(data.message);
      }

      setLoading(false);

      if (res.ok) {
        const successMessage = id 
          ? 'Package updated successfully!' 
          : 'Package added successfully!';
        
        toast.success(successMessage);
        
        setTimeout(() => {
          navigate('/admin');
        }, 3000);  // Delay to allow the toast to be visible
      }

    } catch (error) {
      console.error("Network error:", error);
      toast.error("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">
        {id ? 'Edit Package' : 'Add New Promo Package'}
      </h2>
      
      {loading ? (
        <div>Loading package details...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="packagename" className="block mb-2">Package Name</label>
            <input
              type="text"
              id="packagename"
              value={formData.packagename}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter package name"
            />
          </div>

          <div>
            <label htmlFor="packageDetails" className="block mb-2">Package Details</label>
            <textarea
              id="packageDetails"
              value={formData.packageDetails}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter package details"
            />
          </div>

          <div>
            <label htmlFor="packagePrice" className="block mb-2">Package Price</label>
            <input
              type="text"
              id="packagePrice"
              value={formData.packagePrice}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter package price"
            />
          </div>

          <div>
            <label htmlFor="packagevalidity" className="block mb-2">Package Validity</label>
            <input
              type="date"
              id="packagevalidity"
              value={formData.packagevalidity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Enter package validity"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Processing...' : (id ? 'Update Package' : 'Create Package')}
          </button>

          {errorMessage && (
            <div className="text-red-500 mt-4">
              {errorMessage}
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Pack;