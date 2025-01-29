import React from 'react';
import './App.css'
import { Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';

function App() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar className='w-full bg-black'/>
      <Routes>

      </Routes>
    </div> 
  );
}

export default App
