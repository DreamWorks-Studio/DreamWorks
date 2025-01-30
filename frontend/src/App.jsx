import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'
import About from '../pages/About'
import Contact from '../pages/Contact'

const App = () => {
  return (
    <div className='w-full overflow-hidden'>
      <Header/>
      <About/>
      <Contact/>
      <Footer/>
      <ScrollUp/>
    </div>
  )
}

export default App