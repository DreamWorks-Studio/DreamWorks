import React, { useEffect, useState } from 'react' 
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom';

const slides = [
  {
    image: "src/assets/slider-image.jpg",
    title: "Timeless Moments",
    subtitle: "Captured with Precision & Artistry"
  },
  {
    image: "src/assets/slider-image2.jpg",
    title: "Visual Stories",
    subtitle: "That Speak Louder Than Words"
  },
  {
    image: "src/assets/slider-image3.jpg",
    title: "Creative Vision",
    subtitle: "Transforming Reality into Art"
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

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <img 
            src={slides[currentIndex].image}
            alt="Slide"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full text-white">
        <div className="container mx-auto px-4 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-extrabold tracking-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {slides[currentIndex].title} <span className="text-amber-600">.</span>
              </motion.h1>
              
              <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              
              <motion.p 
                className="text-xl md:text-2xl font-light max-w-2xl mx-auto text-gray-200"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {slides[currentIndex].subtitle}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="pt-8"
              >
                <Link to="/gallery" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-all duration-300 mr-4">
                  View Gallery
                </Link>
                <Link to="/packages" className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition-all duration-300">
                  Our Packages
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center space-x-6 z-20">
        <button 
          onClick={handlePrev}
          className="text-white hover:text-amber-600 transition-colors duration-300"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Indicators */}
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 ${
                currentIndex === index 
                  ? "w-12 h-2 bg-amber-600" 
                  : "w-2 h-2 bg-white/60 hover:bg-white"
              } rounded-full`}
            />
          ))}
        </div>
        
        <button 
          onClick={handleNext}
          className="text-white hover:text-amber-600 transition-colors duration-300"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Carousel