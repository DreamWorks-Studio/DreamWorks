import React from 'react';
import './App.css'
import { Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';

function App() {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <Navbar/>
      <Routes>

      </Routes>
    </div> 
  );
}

export default App
