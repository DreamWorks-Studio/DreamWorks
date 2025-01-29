import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="min-h-screen w-full bg-black relative">
      <div className="absolute top-0 left-0 right-0 w-full z-10">
        <div className="container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px- w-full">
          <img src="src/assets/web_logo.png" alt="logo" className="w-24" />
          <ul className="hidden md:flex gap-7 text-white ">
            <NavLink to="/" className="flex flex-col items-center gap">
              <p>Home</p>
              <hr className="w-3/4 border-none h-[2.5px] bg-amber-600 hidden" />
            </NavLink>
            <NavLink to="/aboutUs" className="flex flex-col items-center gap-3">
              <p>About us</p>
              <hr className="w-3/4 border-none h-[2.5px] bg-amber-600 hidden" />
            </NavLink>
            <NavLink to="/gallery" className="flex flex-col items-center gap-3">
              <p>Gallery</p>
              <hr className="w-3/4 border-none h-[2.5px] bg-amber-600 hidden" />
            </NavLink>
            <NavLink to="/contact" className="flex flex-col items-center gap-3">
              <p>Contact Us</p>
              <hr className="w-3/4 border-none h-[2.5px] bg-amber-600 hidden" />
            </NavLink>
            <NavLink to="/shop" className="flex flex-col items-center gap-3">
              <p>Shop Now</p>
              <hr className="w-3/4 border-none h-[2.5px] bg-amber-600 hidden" />
            </NavLink>
          </ul>
          <button className="hidden md:block text-white bg-transparent border border-white px-5 py-2 rounded-full">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar