import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
    updateUserStart, 
    updateUserSuccess,
    updateUserFailure, 
    deleteUserStart, 
    deleteUserSuucess, 
    deleteUserFailure, 
    signOut 
} from "../src/redux/user/userSlice";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../src/firebase'; 
import Navbar from "../components/Navbar";

const UserProfile = () => {

    const dispatch = useDispatch();
    const fileRef = useRef(null);
    const [image, setImage] = useState(undefined);
    const [imagePercent, setImagePercent] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const { currentUser, loading, error } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        password: "",
        avatar: currentUser?.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
    });

   

    useEffect(() => {
        if (image) {
            handleFileUpload(image);
        }
    }, [image]);

    const handleFileUpload = async (image) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + image.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setImagePercent(Math.round(progress));
          },
          (error) => {
            setImageError(true);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
              setFormData({ ...formData, profilePicture: downloadURL })
            );
          }
        );
      };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        dispatch(updateUserStart());
        const res = await fetch(`/api/user/update/${currentUser._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success === false) {
          dispatch(updateUserFailure(data));
          return;
        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);
      } catch (error) {
        dispatch(updateUserFailure(error));
      }
    };
  
    const handleDeleteAccount = async () => {
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to delete user");
            }

            dispatch(deleteUserSuucess(data));
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout');
            dispatch(signOut());
        } catch (error) {
            console.log(error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            if (file.size > 2 * 1024 * 1024) { 
                setImageError(true);
                return;
            }
            setImage(file);
        }
    };

    return (
        <>
            <Navbar />
            <div className='text-center p-6 py-20 lg:px-32 w-full overflow-hidden bg-black'>
                <div className="p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-lg shadow-lg mt-20">
                    <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
                    
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleFileChange} />

                        <div className="flex flex-col items-center">
                        <img
          src={formData.profilePicture || currentUser.profilePicture}
          alt='profile'
          className='h-24 w-24 self-center cursor-pointer rounded-full object-cover mt-2'
          onClick={() => fileRef.current.click()}
        />
                            <p className="text-sm mt-2 text-gray-400 cursor-pointer hover:text-amber-500" onClick={() => fileRef.current.click()}>
                                Change Profile Picture
                            </p>
                        </div>

                        {imageError && <p className="text-red-500 text-center">Image size must be less than 2MB</p>}
                        {imagePercent > 0 && imagePercent < 100 && <p className="text-gray-400 text-center">{`Uploading: ${imagePercent}%`}</p>}
                        {imagePercent === 100 && <p className="text-green-400 text-center">Image uploaded successfully!</p>}

                        <input  className="bg-gray-800 rounded-lg p-3 text-white border border-gray-700 focus:border-amber-500 focus:outline-none" onChange={handleChange} defaultValue={currentUser.username}
                        type="text" 
                        id="username" 
                        placeholder="Username" 
                         />

                        <input type="email" id="email" placeholder="Email" className="bg-gray-800 rounded-lg p-3 text-white border border-gray-700 focus:border-amber-500 focus:outline-none" onChange={handleChange} defaultValue={currentUser.email} />

                        <input type="password" id="password" placeholder="Password" className="bg-gray-800 rounded-lg p-3 text-white border border-gray-700 focus:border-amber-500 focus:outline-none" onChange={handleChange} />

                        <button className="bg-amber-600 text-white rounded-lg p-3 uppercase hover:bg-amber-700 transition duration-300">{loading ? 'Loading...' : 'Update'}</button>
                    </form>
                    <div className="flex justify-between mt-6 text-sm">
                    <span onClick={handleDeleteAccount} className="text-red-500 cursor-pointer hover:underline">
                        Delete Account
                    </span>
                    <span onClick={handleSignOut} className="text-gray-400 cursor-pointer hover:text-red-500">
                        Sign out
                    </span>
                </div>
                     
                <p className='text-red-700 mt-5'>{error && 'Something went wrong!'}</p>
                <p className='text-green-700 mt-5'>
                            {updateSuccess && 'User is updated successfully!'}
               </p>

                </div>
            </div>
               
            
                
        </>
    );
};

export default UserProfile;
