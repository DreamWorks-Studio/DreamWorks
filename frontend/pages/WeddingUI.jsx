import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const Home = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Promo Package</h1>
    <Link to="/wedding-photography">
      <div className="p-4 border rounded-lg shadow-md cursor-pointer">
        <h2 className="font-semibold text-lg">Wedding Photography</h2>
        <p>"Capture the magic of your special day with our wedding photography packages..."</p>
      </div>
    </Link>
  </div>
);

const WeddingPhotography = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Wedding Photography Package</h1>
    <img
      src="/wedding-photo.jpg"
      alt="Wedding Photography"
      className="w-full h-60 object-cover rounded-lg mb-4"
    />
    <p className="mb-4">
      "From candid moments to breathtaking portraits, our wedding photography packages are designed to create timeless memories."
    </p>

    {/* Customization Options */}
    <div className="space-y-4">
      <div>
        <label className="block font-medium">Number of Hours</label>
        <input type="number" className="w-full p-2 border rounded-md" />
      </div>

      <div>
        <label className="block font-medium">Number of Cameras</label>
        <input type="number" className="w-full p-2 border rounded-md" />
      </div>

      <div>
        <label className="block font-medium">Extra Services</label>
        <select className="w-full p-2 border rounded-md">
          <option value="drone">Drone Shot</option>
          <option value="booth">360 Booth</option>
          <option value="both">Both Services</option>
        </select>
      </div>

      <button className="w-full py-2 bg-blue-600 text-white rounded-md">Confirm Package</button>
    </div>
  </div>
);

const Pack = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wedding-photography" element={<WeddingPhotography />} />
      </Routes>
    </Router>
  );
};

export default Pack;
