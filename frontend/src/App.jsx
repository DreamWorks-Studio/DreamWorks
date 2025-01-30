import React from 'react'
import Header from './components/Header'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollUp from './components/ScrollUp'

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