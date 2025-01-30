import React from 'react'

const Contact = () => {
  return (
    <div className='text-center p-6 py-20 lg:px-32 w-full overflow-hidden bg-black' id='Contact'>
        <h1 className='text-2xl sm:text-4xl font-bold mb-2 text-center text-amber-600'>Contact 
            <span className='underline underline-offset-4 decoration-2 under font-light'> Us</span></h1>
            <p className='text-center text-gray-300 mb-12 max-w-80 mx-auto'>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit 
            </p>

            <form className='max-w-2xl mx-auto text-gray-200 pt-8'>
                <div className='flex flex-wrap'>
                    <div className='w-full md:w-1/2 text-left'>
                        Your Name
                        <input className='w-full border border-amber-600 rounded py-2 px-4 mt-2' type="text" 
                        name="Name" id="" placeholder='Your Name' required/>
                    </div>
                    <div className='w-full md:w-1/2 text-left md:pl-4'>
                        Your Email
                        <input className='w-full border border-amber-600 rounded py-2 px-4 mt-2' type="email" 
                        name="Email" id="" placeholder='Your Email' required/>
                    </div>
                </div>
                <div className='my-6 text-left'>
                    Message
                    <textarea className='w-full border border-amber-600 rounded py-3 px-4 mt-2 h-40 resize-none'
                    name="Message" id="" placeholder='Message' required></textarea>
                </div>
                <button className='cursor-pointer bg-transparent text-amber-600 hover:text-white px-5 py-2
                border-2 border-amber-600 hover:border-white rounded-full'>Send</button>
            </form>
    </div>
  )
}

export default Contact