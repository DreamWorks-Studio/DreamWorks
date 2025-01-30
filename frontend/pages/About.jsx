import React from 'react'

const About = () => {
  return (
    <div className='flex flex-col items-center justify-center container
    mx-auto p-14 md:px-20 lg:px-32 w-full overflow-hidden' id='About'>
        <h1 className='text-2xl sm:text-4xl font-bold mb-5 pb-5'>About 
            <span className='underline underline-offset-4 decoration-1 under font-light'> Us</span></h1>
        <div className='flex flex-col md:flex-row items-center md:items-start md:gap-20'>
            <img src="src/assets/web_logo.png" alt="" className='w-full sm:w-1/2 max-w-sm'/>
            <div className='flex flex-col items-center md:items-start mt-10 text-gray-600'>
                <div className='grid grid-cols-2 gap-6 md:gap-10 w-full 2xl:pr-28'>
                    <div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem, expedita suscipit fugiat corporis minima possimus laudantium beatae odio distinctio facilis qui numquam accusantium. Ipsam consequatur voluptatem reiciendis veritatis! Error, nam.</p>
                    </div>
                </div>
                <p className='my-7 max-w-lg'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Distinctio illum fugiat iusto eligendi dicta</p>
                <button className='bg-transparent border-2 border-amber-600 text-amber-600 font-bold px-5 py-2 rounded-2xl cursor-pointer'>See More..</button>
            </div>
        </div>
    </div>
  )
}

export default About