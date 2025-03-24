import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState('Web Design');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageOrientation, setImageOrientation] = useState({});

  const navigate = useNavigate();

  // Fetch categories from your database
  const categories = ["Birthday", "Graduation", "Preshoots", "Wedding", "ModelShoots", "Events"];

  const handleImageLoad = (event, id) => {
    const { naturalWidth, naturalHeight } = event.target;
    setImageOrientation(prevState => ({
      ...prevState,
      [id]: naturalWidth > naturalHeight ? 'landscape' : 'portrait'
    }));
  };
  

  // Fetch portfolio items
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5003/api/portfolio/images');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setPortfolioItems(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch portfolio items:", error);
        setError("Failed to load images. Please try again later.");
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // Handle navigation to photo detail
  const handlePhotoClick = (photo) => {
    navigate(`/portfolio/${photo._id}`, { state: { photo } });
  };
  

  // Filter portfolio items by active category
  const filteredItems = portfolioItems.filter(item => 
    item.category === activeCategory
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      {/* Header */}
      <header className="bg-black">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-3xl font-bold mt-10 text-orange-500" style={{ fontFamily: "'Poppins', serif" }}>Dream Works Studio</div>
          <div className="flex justify-between items-center">
            <nav className="border border-black-400 p-2">
              <ul className="flex space-x-8">
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Category Navigation */}
      <nav className="py-6 bg-gray-950">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center space-x-12">
            {categories.map((category) => (
              <li key={category}>
                <button
                  className={`text-gray-400 hover:text-orange-700 ${activeCategory === category ? 'font-bold text-orange-400' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Gallery */}
      <main className="flex-grow py-8 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-10">
              <p>Loading gallery...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-10">
              <p>No items found in the {activeCategory} category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePhotoClick(item)}
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      onLoad={(event) => handleImageLoad(event, item._id)}
                      className={`object-cover transition-transform hover:scale-105 ${imageOrientation[item._id] === 'landscape' ? 'w-[400px] h-[300px]' : 'w-[300px] h-[400px]'
                        }`}
                    />

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Portfolio;