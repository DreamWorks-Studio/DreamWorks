import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ScrollUp from '../components/ScrollUp'
import About from '../pages/About'
import Contact from '../pages/Contact'
import signUp from '../pages/signUp'

  


const App = () => {
  return (
   <Router>
   <div className='w-full overflow-hidden'>
      <Header/>
  
      <Routes>
      <Route path="/signUp" element={<signUp />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer/>
      <ScrollUp/>
    </div>
    </Router>
  )
}

export default App;