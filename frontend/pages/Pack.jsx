import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package, X, Calendar, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Pack = ({ isModal = false, packageId = null, onClose = null }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id: routeId } = useParams(); // Get the package ID from URL

  // Use packageId prop if in modal mode, otherwise use the route param
  const id = isModal ? packageId : routeId;

  const packageTypes = ["Wedding", "Portrait", "Event", "Preshoot", "Graduation", "Others"];

  const customizationOptions = [
    {
      id: 'prints',
      name: 'Additional Prints',
      price: 1500,
      description: 'High-quality prints',
      hasQuantity: true,
      unit: 'set',
      minQuantity: 1,
      maxQuantity: 5,
      unitDescription: 'Each set contains 5 prints'
    },
    {
      id: 'album',
      name: 'Premium Photo Album',
      price: 3000,
      description: 'Leather-bound premium album',
      hasQuantity: false
    },
    {
      id: 'retouching',
      name: 'Advanced Retouching',
      price: 2000,
      description: 'Professional skin & color enhancement',
      hasQuantity: false
    },
    {
      id: 'extraHour',
      name: 'Extra Hour',
      price: 2500,
      description: 'Additional photography time',
      hasQuantity: true,
      unit: 'hour',
      minQuantity: 1,
      maxQuantity: 8,
      unitDescription: 'Extends your session time'
    },
    {
      id: 'videography',
      name: 'Video Coverage',
      price: 5000,
      description: 'Professional video recording & editing',
      hasQuantity: true,
      unit: 'hour',
      minQuantity: 1,
      maxQuantity: 4,
      unitDescription: 'Duration of video coverage'
    },
    {
      id: 'drone',
      name: 'Drone Photography',
      price: 4000,
      description: 'Aerial shots with professional drone',
      hasQuantity: true,
      unit: 'session',
      minQuantity: 1,
      maxQuantity: 3,
      unitDescription: 'Each session is 30 minutes'
    }
  ];

  // Initial state for form
  const [formData, setFormData] = useState({
    packagename: '',
    packageDetails: '',
    packagePrice: '',
    packagevalidity: '',
    packageType: 'Others',
    includedCustomizations: []
  });

  const [customizationQuantities, setCustomizationQuantities] = useState({});

  const handleCustomizationToggle = (customizationId) => {
    const option = customizationOptions.find(opt => opt.id === customizationId);
    if (!option) return;

    setFormData(prev => {
      const isIncluded = prev.includedCustomizations.some(c => c.id === customizationId);

      if (isIncluded) {
        return {
          ...prev,
          includedCustomizations: prev.includedCustomizations.filter(c => c.id !== customizationId)
        };
      } else {
        const newCustomization = {
          ...option,
          quantity: option.hasQuantity ? (customizationQuantities[customizationId] || option.minQuantity) : undefined
        };

        return {
          ...prev,
          includedCustomizations: [...prev.includedCustomizations, newCustomization]
        };
      }
    });
  };

  const handleQuantityChange = (customizationId, newQuantity) => {
    setCustomizationQuantities(prev => ({
      ...prev,
      [customizationId]: newQuantity
    }));

    setFormData(prev => {
      const updatedCustomizations = prev.includedCustomizations.map(c => {
        if (c.id === customizationId) {
          return { ...c, quantity: newQuantity };
        }
        return c;
      });

      if (!prev.includedCustomizations.some(c => c.id === customizationId)) {
        const option = customizationOptions.find(opt => opt.id === customizationId);
        if (option) {
          updatedCustomizations.push({
            ...option,
            quantity: newQuantity
          });
        }
      }

      return {
        ...prev,
        includedCustomizations: updatedCustomizations
      };
    });
  };

  // Fetch package details for editing
  useEffect(() => {
    // Check if we're in edit mode (id exists)
    const fetchPackageDetails = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5003/api/package/getPackage/${id}`);

          if (!response.ok) {
            throw new Error('Failed to fetch package details');
          }

          const packageData = await response.json();

          const quantities = {};
          if (packageData.includedCustomizations && packageData.includedCustomizations.length > 0) {
            packageData.includedCustomizations.forEach(customization => {
              if (customization.hasQuantity) {
                quantities[customization.id] = customization.quantity || customization.minQuantity || 1;
              }
            });
          }

          // Update form data with fetched package details
          setFormData({
            packagename: packageData.packagename,
            packageDetails: packageData.packageDetails,
            packagePrice: packageData.packagePrice,
            packagevalidity: packageData.packagevalidity,
            packageType: packageData.packageType || 'Others',
            includedCustomizations: packageData.includedCustomizations || []
          });

          setCustomizationQuantities(quantities);
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
        setLoading(false);
        return setErrorMessage(data.message);
      }

      setLoading(false);

      if (res.ok) {
        const successMessage = id
          ? 'Package updated successfully!'
          : 'Package added successfully!';

        toast.success(successMessage);

        // Different behavior based on modal mode
        if (isModal && onClose) {
          // If in modal mode, just close the modal
          onClose();
        } else {
          // Otherwise navigate away
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        }
      }

    } catch (error) {
      console.error("Network error:", error);
      toast.error("Failed to connect to the server.");
      setLoading(false);
    }
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const datePickerCustomStyles = `
        .react-datepicker {
            font-family: 'Inter', sans-serif;
            border-radius: 1rem;
            border: none;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transform: scale(0.95);
            transform-origin: top center;
            margin-top: 4px;
        }
        .react-datepicker__header {
            background: linear-gradient(to right, #000000, #333333);
            border-bottom: none;
            padding: 1rem 0 0.75rem;
            position: relative;
        }
        .react-datepicker__header:after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, #d97706, #f59e0b, #d97706);
        }
        .react-datepicker__current-month {
            color: white !important;
            font-weight: 600;
            margin-bottom: 0.5rem;
            letter-spacing: 0.5px;
        }
        .react-datepicker__day-name {
            color: rgba(255, 255, 255, 0.85) !important;
            font-weight: 500;
            width: 2rem;
            margin: 0.2rem;
        }
        .react-datepicker__day {
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            margin: 0.2rem;
            border-radius: 50%;
            transition: all 0.2s ease;
        }
        .react-datepicker__day--selected {
            background: linear-gradient(135deg, #d97706, #f59e0b) !important;
            font-weight: 600;
            color: white;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
        }
        .react-datepicker__day:hover {
            background-color: rgba(217, 119, 6, 0.15) !important;
            border-radius: 50%;
        }
        .react-datepicker__day--disabled {
            color: #ccc;
            cursor: not-allowed;
            text-decoration: line-through;
        }
        .react-datepicker__day--today {
            position: relative;
            font-weight: bold;
        }
        .react-datepicker__day--today:after {
            content: "";
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #f59e0b;
        }
        .react-datepicker__navigation {
            top: 1rem;
        }
        .react-datepicker__navigation-icon::before {
            border-color: #fff;
        }
        .react-datepicker__year-dropdown {
            background-color: #222;
            border: 1px solid #444;
            border-radius: 0.5rem;
        }
        .react-datepicker__year-option {
            color: white;
            padding: 0.5rem;
        }
        .react-datepicker__year-option:hover {
            background-color: #333;
        }
    `;

  // Conditional rendering based on modal mode
  if (isModal) {
    return (
      <div className="w-full overflow-auto">
        <style>{datePickerCustomStyles}</style>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            <p className="ml-3 text-gray-600">Loading package details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="packageType" className="block mb-2 text-sm font-medium text-gray-700">Package Type</label>
              <select
                id="packageType"
                value={formData.packageType}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                {packageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="packagename" className="block mb-2 text-sm font-medium text-gray-700">Package Name</label>
              <input
                type="text"
                id="packagename"
                value={formData.packagename}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter package name"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Included Customizations</label>
              <div className="border border-gray-200 rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto">
                {customizationOptions.map(option => {
                  const isIncluded = formData.includedCustomizations.some(c => c.id === option.id);
                  
                  return (
                    <div key={option.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`custom-${option.id}`}
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => handleCustomizationToggle(option.id)}
                            className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                          />
                        </div>
                        <label htmlFor={`custom-${option.id}`} className="ml-2 text-sm font-medium text-gray-700">
                          {option.name} {option.price && <span className="text-amber-600">(Rs.{option.price})</span>}
                        </label>
                      </div>
                      
                      <p className="ml-6 text-xs text-gray-500 mt-1">{option.description}</p>
                      
                      {option.hasQuantity && isIncluded && (
                        <div className="ml-6 mt-2 flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const currentQuantity = customizationQuantities[option.id] || option.minQuantity;
                              if (currentQuantity > option.minQuantity) {
                                handleQuantityChange(option.id, currentQuantity - 1);
                              }
                            }}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus size={14} className="text-gray-600" />
                          </button>
                          
                          <span className="mx-2 text-sm font-medium">
                            {customizationQuantities[option.id] || option.minQuantity} {option.unit}
                            {(customizationQuantities[option.id] || option.minQuantity) > 1 ? 's' : ''}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const currentQuantity = customizationQuantities[option.id] || option.minQuantity;
                              if (currentQuantity < option.maxQuantity) {
                                handleQuantityChange(option.id, currentQuantity + 1);
                              }
                            }}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus size={14} className="text-gray-600" />
                          </button>
                          
                          <span className="ml-3 text-xs text-gray-500">{option.unitDescription}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="packageDetails" className="block mb-2 text-sm font-medium text-gray-700">Package Details</label>
              <textarea
                id="packageDetails"
                value={formData.packageDetails}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter package details"
                rows="4"
              />
            </div>

            <div>
              <label htmlFor="packagePrice" className="block mb-2 text-sm font-medium text-gray-700">Package Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500">Rs.</span>
                <input
                  type="text"
                  id="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleChange}
                  className="w-full pl-8 p-2.5 border border-gray-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter package price"
                />
              </div>
            </div>

            <div>
              <label htmlFor="packagevalidity" className="block mb-2 text-sm font-medium text-gray-700">Package Validity</label>
              <style>{datePickerCustomStyles}</style>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={18} className="text-amber-500" strokeWidth={2} />
                </div>
                <DatePicker
                  id="packagevalidity"
                  selected={formData.packagevalidity && isValidDate(formData.packagevalidity) ? new Date(formData.packagevalidity) : null}
                  onChange={(date) => setFormData({ ...formData, packagevalidity: date ? date.toISOString().split('T')[0] : '' })}
                  className="w-full p-2.5 pl-10 border border-gray-200 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholderText="Select validity date"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 bg-gray-200 text-gray-800 p-2.5 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-amber-500 text-white p-2.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>{id ? 'Update Package' : 'Create Package'}</>
                )}
              </button>
            </div>

            {errorMessage && (
              <motion.div
                className="text-white bg-red-500 p-3 rounded-lg mt-4 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <X size={16} className="mr-2" />
                {errorMessage}
              </motion.div>
            )}
          </form>
        )}
      </div>
    );
  }

  // Original non-modal rendering (keeping all existing functionality)
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
            <label htmlFor="packageType" className="block mb-2">Package Type</label>
            <select
              id="packageType"
              value={formData.packageType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              {packageTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
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

          <div>
            <label className="block mb-2">Included Customizations</label>
            <div className="border rounded p-3 space-y-3 max-h-64 overflow-y-auto">
              {customizationOptions.map(option => {
                const isIncluded = formData.includedCustomizations.some(c => c.id === option.id);
                
                return (
                  <div key={option.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={`custom-standalone-${option.id}`}
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => handleCustomizationToggle(option.id)}
                          className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                        />
                      </div>
                      <label htmlFor={`custom-standalone-${option.id}`} className="ml-2 text-sm font-medium text-gray-700">
                        {option.name} {option.price && <span className="text-amber-600">(${option.price})</span>}
                      </label>
                    </div>
                    
                    <p className="ml-6 text-xs text-gray-500 mt-1">{option.description}</p>
                    
                    {option.hasQuantity && isIncluded && (
                      <div className="ml-6 mt-2 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const currentQuantity = customizationQuantities[option.id] || option.minQuantity;
                            if (currentQuantity > option.minQuantity) {
                              handleQuantityChange(option.id, currentQuantity - 1);
                            }
                          }}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </button>
                        
                        <span className="mx-2 text-sm font-medium">
                          {customizationQuantities[option.id] || option.minQuantity} {option.unit}
                          {(customizationQuantities[option.id] || option.minQuantity) > 1 ? 's' : ''}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const currentQuantity = customizationQuantities[option.id] || option.minQuantity;
                            if (currentQuantity < option.maxQuantity) {
                              handleQuantityChange(option.id, currentQuantity + 1);
                            }
                          }}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </button>
                        
                        <span className="ml-3 text-xs text-gray-500">{option.unitDescription}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600"
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