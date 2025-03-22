import React from 'react';
import { Link } from 'react-router-dom';

const Pack = () => {
  return (
    
    <div className="min-h-screen bg-gray-100 flex flex-col" >
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-lg font-bold">Website</div>
        <div className="space-x-4">
          <button className="px-4 py-2 border rounded-md">Sign up</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Sign in</button>
        </div>
      </nav>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-1/5 bg-gray-200 p-4">
        
          <button className="w-full py-2 mb-2 bg-white rounded-md shadow cursor-alias">Standard Package</button>
        
          <button className="w-full py-2 bg-white rounded-md shadow">Promo Package</button>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-gray-300 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Promo Package</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-medium">Package Name</label>
                <input type="text" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block font-medium">Package Details</label>
                <textarea className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div>
                <label className="block font-medium">Package Price</label>
                <input type="text" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block font-medium">Package Validity</label>
                <input type="date" className="w-full p-2 border rounded-md" />
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-md">Create Package</button>
            </form>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow p-4 mt-auto">
        <div className="text-center text-sm">&copy; 2024 Website. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Pack;