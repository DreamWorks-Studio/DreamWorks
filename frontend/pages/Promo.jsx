import React from 'react';
import { Link } from 'react-router-dom';

const Promo = () => {
  return (
    <div className="flex">
     %


      {/* Sidebar */}
      <div className="flex bg-cover bg-center min-h-screen" style={{ backgroundImage: "url('/images/backgroun')" }}></div>
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
          className="border p-2 rounded ml-4"
        />

        {/* Packages */}
        <div className="mt-6">
          <div className="flex border p-4 rounded-lg mb-4">
            <div className="w-20 h-20 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Image</span>
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-bold">Wedding Photography</h3>
              <p className="text-gray-600 text-sm">
                "Capture the magic of your special day with our wedding photography packages. From candid moments to breathtaking portraits..."
              </p>
            </div>
            <div className="flex items-center">
              <Link to = '/Promoadd'>
              <button className="bg-green-200 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                <span className="text-green-800 font-bold">+</span>
              </button>
              </Link>
            </div>
          </div>

          <div className="flex border p-4 rounded-lg">
            <div className="w-20 h-20 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Image</span>
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-bold">Event Day Photography</h3>
              <p className="text-gray-600 text-sm">
                "From corporate events to private celebrations, our event photography services ensure every special moment is beautifully captured..."
              </p>
            </div>
            <div className="flex items-center">
              <Link to = '/Promoadd'>
              <button className="bg-green-200 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                <span className="text-green-800 font-bold">+</span>
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promo;