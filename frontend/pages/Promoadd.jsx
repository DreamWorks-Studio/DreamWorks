import React, { useState } from 'react';

const WeddingPackageEditor = () => {
  const [packageDetails, setPackageDetails] = useState({
    name: "Wedding Photography Premium",
    basePrice: 1200,
    duration: 6,
    photos: 300,
    addons: [
      { id: 1, name: "Extra Hour", price: 150, selected: false },
      { id: 2, name: "360° Photoshoot", price: 350, selected: false },
      { id: 3, name: "Second Photographer", price: 400, selected: false },
      { id: 4, name: "Same-Day Edit Highlights", price: 300, selected: false },
      { id: 5, name: "Premium Photo Album", price: 250, selected: false }
    ]
  });

  const [totalPrice, setTotalPrice] = useState(packageDetails.basePrice);

  const handleAddonToggle = (id) => {
    const updatedAddons = packageDetails.addons.map(addon => {
      if (addon.id === id) {
        return { ...addon, selected: !addon.selected };
      }
      return addon;
    });

    const newPackageDetails = { ...packageDetails, addons: updatedAddons };
    setPackageDetails(newPackageDetails);

    // Recalculate total price
    const newTotal = newPackageDetails.basePrice + 
      newPackageDetails.addons
        .filter(addon => addon.selected)
        .reduce((sum, addon) => sum + addon.price, 0);
    
    setTotalPrice(newTotal);
  };

  const handleSavePackage = () => {
    // Here you would typically make an API call to save the package
    console.log("Saving package:", packageDetails);
    alert("Package saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6">
            <h1 className="text-2xl font-bold text-white">Customize Your  Package</h1>
            <p className="text-blue-100 mt-2">
              Tailor your photography package to perfectly capture your special day
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Base Package Info */}
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Base Package Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-500 text-sm">Package Name</p>
                  <p className="font-medium">{packageDetails.name}</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-500 text-sm">Duration</p>
                  <p className="font-medium">{packageDetails.duration} hours</p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-gray-500 text-sm">Digital Photos</p>
                  <p className="font-medium">{packageDetails.photos} edited photos</p>
                </div>
              </div>
            </div>
            
            {/* Add-ons */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Customize with Add-ons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packageDetails.addons.map((addon) => (
                  <div 
                    key={addon.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      addon.selected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleAddonToggle(addon.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{addon.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {addon.name === "Extra Hour" && "Add additional coverage time"}
                          {addon.name === "360° Photoshoot" && "Immersive venue and decoration shots"}
                          {addon.name === "Second Photographer" && "Capture more angles and moments"}
                          {addon.name === "Same-Day Edit Highlights" && "Share moments with guests at reception"}
                          {addon.name === "Premium Photo Album" && "High-quality printed keepsake"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-blue-600">${addon.price}</span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mt-2 ${
                          addon.selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`}>
                          {addon.selected && <span className="text-white text-sm">✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Package Price</h3>
                  <p className="text-gray-500 text-sm">All prices include taxes and fees</p>
                </div>
                <div className="text-2xl font-bold text-blue-600">${totalPrice}</div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Package Summary</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex justify-between">
                    <span>Base Package ({packageDetails.duration}h)</span>
                    <span>${packageDetails.basePrice}</span>
                  </li>
                  {packageDetails.addons.filter(addon => addon.selected).map(addon => (
                    <li key={addon.id} className="flex justify-between">
                      <span>{addon.name}</span>
                      <span>${addon.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <button 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={handleSavePackage}
              >
                Save Package
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingPackageEditor;