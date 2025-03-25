import React, { useState } from 'react';
import {Link , useNavigate} from 'react-router-dom'


const Pack = () => {

    
//   const[errorMessage,setErrorMessage] = useState(null);
//   const[loading,setLoading] = useState(false);
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     packagename: '',
//     packageDetails: '',
//     packagePrice: '',
//     packagevalidity: ''
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if(!formData.packagename || !formData.packageDetails || !formData.packagePrice || !formData.packagevalidity){
//       return setErrorMessage('Please fill out all fields')
//     }

//     try {
//       setLoading(true);
//       setErrorMessage(null);
//       const res = await fetch('/backend/auth/promo', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if(data.success == false){
//         return setErrorMessage(data.message);
//       }

//       setLoading(false);
//       if(res.ok){
//         navigate('/Editpromo')
//       }                         

//     } catch (error) {
//       console.error("Network error:", error);
//       alert("Failed to connect to the server.");
//     }
//   };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-lg font-bold">Website</div>
        <div className="space-x-4">
          <button className="px-4 py-2 border rounded-md">Sign up</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Sign in</button>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="w-1/5 bg-gray-200 p-4">
          <button className="w-full py-2 mb-2 bg-white rounded-md shadow cursor-alias">Standard Package</button>
          <button className="w-full py-2 bg-white rounded-md shadow">Promo Package</button>
        </aside>

        <main className="flex-1 p-6">
          <div className="bg-gray-300 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Edit the Package</h2>
            <form className="space-y-4" >
              <div>
                <label className="block font-medium">Package Name</label>
                <input
                  type="text"
                  id='packagename'
                  className="w-full p-2 border rounded-md"
                  
                />
              </div>
              <div>
                <label className="block font-medium">Package Details</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  id='packageDetails'
                  
                ></textarea>
              </div>
              <div>
                <label className="block font-medium">Package Price</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  id='packagePrice'
                  
                />
              </div>
              <div>
                <label className="block font-medium">Package Validity</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                  id='packagevalidity'
                  
                />
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-md">
                Edit the Package
              </button>
            </form>
            {/* <div >
              {errorMessage && (
                <Alert classsName='mt-5' color='failure'>
                  {errorMessage}
                </Alert>
              )}


            </div> */}
          </div>
        </main>
      </div>

      <footer className="bg-white shadow p-4 mt-auto">
        <div className="text-center text-sm">&copy; 2024 Website. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Pack;
