import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

const slides = [
    {
        image: "src/assets/slider-image.jpg",
    },
    {
        image: "src/assets/slider-image2.jpg",
    },
    {
        image: "src/assets/slider-image3.jpg",
    }
]

const Carousel = () => {

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

  return (
    <div className='relative w-full h-full'>
        <div className='absolute inset-0 overflow-hidden'>
            <AnimatePresence mode='await'>
                <motion.img key={currentIndex} src={slides[currentIndex].image} 
                alt='Slide'
                className='absolute inset-0 w-full h-full object-cover'
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ 
                    opacity: { duration: 1, ease: "easeInOut" },
                    scale: { duration: 1.2, ease: "easeInOut" },
                }}/>
            </AnimatePresence>
        </div>

        <div className='absolute inset-0 bg-black/70'></div>

        <div className='relative z-10 flex items-center justify-center min-h-screen text-white text-center'>
            <div className='container mx-auto px-6 md:px-20 lg:px-32'>
                <h2
                className='text-5xl sm:text-6xl md:text-[82px] font-semibold'>
                    DreamWorks Studio
                </h2>
                <p
                className='mt-4 text-lg sm:text-xl md:text-2xl text-gray-300'>
                    Experience the Magic of Visual Storytelling
                </p>
            </div>
        </div>

        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2'>
            {slides.map((_, index) => (
                <button key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 
                    ${currentIndex === index ? "bg-amber-500 scale-125" : "bg-gray-400"}`}
                ></button>
            ))}
        </div>
    </div>
  );
};

export default Carousel