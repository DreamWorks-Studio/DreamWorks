import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";


const ResetPassword = () => {
  const { id, token } = useParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const userValid = async () => {
  try {
      const res = await fetch(`/api/user/resetpassword/${id}/${token}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          }
      });

      if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.status === 201) {
          console.log("User is valid");
      } else {
          setError("Invalid user or token.");
          console.error("Invalid user or token.");
      }
  } catch (error) {
      console.error("An error occurred while checking user validity:", error);
      setError("An error occurred while checking user validity. Please try again later.");
  }
};

  useEffect(() => {
      userValid();
  }, []);

  const handleChange = (e) => {
      setPassword(e.target.value);
  };

  const handleSubmit = async (event) => {
      event.preventDefault();

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{5,}$/;
      
      if (!passwordRegex.test(password)) {
          setError("Password must contain at least one uppercase letter, one number, one symbol, and be at least 5 characters long.");
          return;
      }

      try {
          const res = await fetch(`/api/user/updateResetPassword/${id}/${token}`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ password })
          });

          const data = await res.json();

          if (data.status === 201) {
              setPassword("");
              setMessage("Password updated successfully.");
          } else {
              setError("Token expired. Please generate a new link.");
          }
      } catch (error) {
          console.error("An error occurred while updating password:", error);
          setError("An error occurred while updating password.");
      }
  
    }
  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  }
  return (
    <div className="min-h-screen " style={{
      backgroundImage: `url('https://img.freepik.com/premium-photo/loft-style-house-with-armchair-accessories-room-3d-rendering_41470-3877.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: '',
      backgroundRepeat: 'no-repeat',
  }}>
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-20">
          <div className="flex-1 mt-48">
              <Link to="/" className="text-5xl font-bold dark:text-white font-tangerine">
                  <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via purple-500 to-pink-500 text-white rounded-lg size-10/12">Furniture</span>Shop
              </Link>
              <p className="text-sm mt-5 font-cinzel font-gray font-semibold">Join with us to get quality Furnitues which suits for you</p>
          </div>
          <div className="flex-1 mt-24">
              <p className="text-center text-2xl font-cinzel font-semibold">Enter New Password</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5">
               <div>
                  <Label value="Enter New password"/>
                      <div className="relative">
                          <TextInput type={showPassword ? "text" : "password"} placeholder="Password" id="password" onChange={handleChange}/>
                              <button type="button" className="absolute top-2 right-3 focus:outline-none" onClick={togglePasswordVisibility}>
                                  {showPassword ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.818 8.818a4 4 0 0 1 0 6.364M5.636 8.818a4 4 0 0 1 0 6.364M11.998 5.996v.01" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.1V12a3.999 3.999 0 0 1 3.999-4 3.999 3.999 0 0 1 3.999 4v6.1c0 2.21-1.791 4-3.999 4a3.999 3.999 0 0 1-3.999-4z" />
                                      </svg>
                                  ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15a7 7 0 01-7-7M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                  )}
                              </button>

                      </div>
                  </div>
                  <Button gradientDuoTone="purpleToBlue" type="submit">
                      Submit
                  </Button>
              </form>
              {error && <p className="text-red-600 mt-3">{error}</p>}
              {message && <p className="text-green-600 mt-3">{message}</p>}
          </div>
      </div>
  </div>
);
};

export default ResetPassword;