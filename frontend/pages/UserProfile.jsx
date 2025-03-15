import React from 'react'
import { useSelector } from 'react-redux'
import { useRef } from 'react'

const UserProfile = () => {

    const {currentUser} = useSelector((state) => state.user)
    const fileRef = useRef(null)
  return (
  
    <div className='p-4 max-w-lg mx-auto'>
        <h1 className='text-3xl font-semibold text-center m-7'>User Profile</h1>
        <from className ='flex flex-col gap-4'>
            <input type='file' ref={fileRef} hidden accept='image/*'/>
          <img onClick={() =>fileRef.current.click()}  src={currentUser.avatar || "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif"} alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
                    />

          <input type='text' placeholder='User Name' className='border p-3 rounded-lg ' id ='username' /> 
          <input type='text' placeholder='Email' className='border p-3 rounded-lg ' id ='email' />
          <input type='text' placeholder='Password' className='border p-3 rounded-lg ' id ='password' />  

          <button className='bg-amber-600 text-white rounded-lg p-3 uppercase hover:bg-amber-700'>Update</button>                 
        </from>

        <div className="flex justify-between mt-5">
            <span className='text-amber-700 cursor-pointer'>Delete Account</span>
            <span className='text-amber-700 cursor-pointer'>Sign Out</span>
        </div>
    </div>

  )
}

export default UserProfile