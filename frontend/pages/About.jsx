import React from 'react'
import { motion } from 'framer-motion'

const About = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Our <span className="text-amber-600">Story</span>
        </h1>
        <div className="w-24 h-1 bg-amber-600 mx-auto mt-6"></div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Studio Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2"
          >
            <img 
              src="/src/assets/web_logo.png" 
              alt="Studio Logo" 
              className="rounded-lg shadow-xl max-w-md mx-auto"
            />
          </motion.div>
          
          {/* About Text */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2 space-y-6"
          >
            <h2 className="text-3xl font-bold border-l-4 border-amber-600 pl-4">
              Capturing Moments, Creating Art
            </h2>
            
            <p className="text-gray-700 leading-relaxed">
              We're not just photographers. We're visual storytellers obsessed with freezing time 
              in its most authentic form. Since 2015, our lens has been focused on creating imagery 
              that speaks louder than words.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Every frame we capture is born from the perfect balance of technical precision and artistic 
              intuition. We don't follow trends—we set them, pushing boundaries to deliver visuals that 
              stand out in a saturated digital world.
            </p>
            
            <div className="pt-6">
              <button className="bg-amber-600 text-white font-bold py-3 px-8 rounded-full hover:bg-amber-700 transition-all duration-300 mr-4">
                Our Work
              </button>
              <button className="border-2 border-amber-600 text-amber-600 font-bold py-3 px-8 rounded-full hover:bg-amber-600/10 transition-all duration-300">
                Meet the Team
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 text-center">
          {[
            { number: "10+", label: "Years Experience" },
            { number: "1500+", label: "Photo Sessions" },
            { number: "27", label: "Industry Awards" },
            { number: "98%", label: "Client Satisfaction" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-black/80 rounded-xl shadow-md"
            >
              <h3 className="text-4xl font-bold text-amber-600">{stat.number}</h3>
              <p className="text-gray-100 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Philosophy Section */}
      <div className="bg-gray-50 py-20 mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Approach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Authenticity",
                description: "We believe in real moments. No forced poses, just genuine emotions captured in their purest form."
              },
              {
                title: "Innovation",
                description: "Using cutting-edge technology and creative techniques to push the boundaries of conventional photography."
              },
              {
                title: "Connection",
                description: "Building relationships that allow us to truly understand your vision and transform it into reality."
              }
            ].map((pillar, index) => (
                <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  boxShadow: "0 10px 25px rgba(251, 191, 36, 0.4)",
                  y: -5,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 15 
                  }
                }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-black/80 p-8 rounded-lg text-center shadow-md"
              >
                <h3 className="text-xl font-bold mb-4 text-amber-600">{pillar.title}</h3>
                <p className="text-gray-100">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default About