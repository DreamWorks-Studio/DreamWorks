import React from 'react';
import { Link } from 'react-router-dom';
const Pack = () => {
  const packages = [
    {
      id: 1,
      name: "Platinum",
      type: "Standard Package",
      description: "Capture the magic of your special day with our wedding photography packages. From candid moments to breathtaking portraits, we ensure every detail is beautifully preserved. Offering customized packages, high-resolution images, albums, and more. Let us turn your love story into timeless memories. Book your wedding shoot today"
    },
    {
      id: 2,
      name: "Gold",
      type: "Promo Package",
      description: "From corporate events to private celebrations, our event photography services ensure every special moment is beautifully captured. With high-quality images, candid shots, and professional editing, we bring your event to life through stunning visuals. Book us today to document your unforgettable moments"
    },
    {
      id: 3,
      name: "Silver",
      type: "Standard Package",
      description: "From corporate events to private celebrations, our event photography services ensure every special moment is beautifully captured. With high-quality images, candid shots, and professional editing, we bring your event to life through stunning visuals. Book us today to document your unforgettable moments"
    }
  ];

  return (
    <div className="bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">Standard Packages</h2>
      <div className="border border-gray-300 p-4 rounded-md">
        {/* Left sidebar */}
        <div className="flex">
          <div className="w-64 pr-4">
            <div className="space-y-2">
              <div className="bg-gray-100 p-4 rounded">
                <span className="text-gray-700">Standard Package</span>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <Link to = "/promo">
                <span className="text-gray-700">Promo Package</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="border border-gray-300 rounded p-4">
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      {/* Placeholder for image */}
                      <div className="w-full h-full border border-gray-400 flex items-center justify-center">
                        <span className="text-gray-400 text-4xl">×</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{pkg.name}</h3>
                          <p className="text-gray-700 mt-1">"{pkg.description}"</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pack;