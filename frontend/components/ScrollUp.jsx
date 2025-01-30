import React, { useEffect, useState } from 'react'
import { FaAngleDoubleUp } from 'react-icons/fa'

const ScrollUp = () => {

    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if(window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility)
        };
    }, []);

    return (
        <button onClick={scrollToTop} className={`hidden md:flex fixed bottom-6 right-6 lg:bottom-8 lg:right-8
             bg-amber-600 hover:bg-black text-white hover:text-amber-600 howp-2 p-4 lg:p-3 rounded-full
            shadow-lg transition-all duration-300 z-50 scale-90 md:scale-100 hover:scale-105 active:scale-95 
            transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} 
            aria-label='Scroll to top'>
            <FaAngleDoubleUp className='text-xl lg:text-2xl'/>
        </button>
    )
}

export default ScrollUp