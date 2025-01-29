import React from 'react';
import './App.css'
import { Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-Width Navbar */}
      <Navbar className="w-full bg-gray-900" />
      
      {/* Main Content Wrapper */}
      <main className="flex-grow px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <Routes>
          {/* Add your routes here */}
        </Routes>
      </main>

      {/* Full-Width Footer */}
      <Footer className="w-full bg-black" />
    </div>
  );
}

export default App;



