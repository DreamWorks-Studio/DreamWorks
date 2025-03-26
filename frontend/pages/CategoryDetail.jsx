import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CategoryDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const photo = location.state?.photo;

  if (!photo) {
    return <div className="text-center text-red-500 py-10">No image data found!</div>;
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Navbar />
      
      {/* Main Content Section */}
      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto py-8">
          <div className="flex items-center">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="text-4xl p-2">
              &lt;
            </button>

            {/* Image and Details Container */}
            <div className="flex-grow flex justify-center px-4">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="w-120 h-84 flex items-center justify-center">
                  <img src={photo.imageUrl} alt={photo.description} className="w-full h-full object-cover" />
                </div>
                
                {/* Image Details */}
                <div className="md:ml-8 max-w-md mt-4 md:mt-0">
                  <div className="flex mb-2">
                    <span className="text-yellow-400 text-xl">★ ★ ★ ★ ☆</span>
                  </div>
                  <h2 className="text-3xl font-semibold">{photo.category}</h2>
                  <p className="text-lg mt-2">{photo.description}</p>
                </div>
              </div>
            </div>

            {/* Placeholder for next image navigation */}
            <button className="text-4xl p-2">
              &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoryDetail;
