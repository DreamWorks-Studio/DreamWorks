import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserStart, updateUserSuucess, updateUserFailure, deleteUserStart, deleteUserSuucess, deleteUserFailure, signOut } from "../src/redux/user/userSlice";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../src/firebase'; // ✅ Ensure Firebase app is imported

const UserProfile = () => {
    const dispatch = useDispatch();
    const { currentUser, error, loading } = useSelector((state) => state.user);
    const fileRef = useRef(null);
    const [updateSucess, setupdateSucess] = useState(false);
    const [image, setImage] = useState(null); // ✅ Changed from 0 to null
    const [imageError, setImageError] = useState(false);
    const [imagePercent, setImagePercent] = useState(0); // ✅ Added missing state
    
    useEffect(() => {
        if (image) {
            handleFileUpload(image);
        }
    }, [image]); // ✅ Ensures image upload triggers properly

    const handleFileUpload = async (image) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + image.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
    
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImagePercent(Math.round(progress));
            },
            (error) => {
                setImageError(true);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
                    setFormData((prevState) => ({ ...prevState, avatar: downloadURL })) // ✅ Used functional state update
                );
            }
        );
    };

    const [formData, setFormData] = useState({
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        password: "",
        avatar: currentUser?.avatar || "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif",
    });
    const handleSignOut = async () => {
        try {
          await fetch('/api/auth/signout');
          dispatch(signOut())
        } catch (error) {
          console.log(error);
        }
      };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    const handleDeleteAccount = async () => {
        try {
          dispatch(deleteUserStart());
          const res = await fetch(`/api/user/delete/${currentUser._id}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success === false) {
            dispatch(deleteUserFailure(data));
            return;
          }
          dispatch(deleteUserSuccess(data));
        } catch (error) {
          dispatch(deleteUserFailure(error));
        }
      };
    
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // ✅ Now correctly setting the image file
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prevState) => ({ ...prevState, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser?._id) {
            console.error("User ID is missing!");
            return;
        }
        try {
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST', // ✅ Ensure API method is correct
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(updateUserFailure(data.message || "Update failed"));
                return;
            }
            dispatch(updateUserSuucess(data));
            setupdateSucess(true);
        } catch (error) {
            dispatch(updateUserFailure(error.message));
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold text-center m-7">User Profile</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleFileChange} />
                <img
                    onClick={() => fileRef.current.click()}
                    src={formData.avatar}
                    alt="profile"
                    className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
                />
                <p className='text-sm self-center'>
                    {imageError ? (
                        <span className='text-red-700'>Error uploading image (file size must be less than 2 MB)</span>
                    ) : imagePercent > 0 && imagePercent < 100 ? (
                        <span className='text-slate-700'>{`Uploading: ${imagePercent} %`}</span>
                    ) : imagePercent === 100 ? (
                        <span className='text-green-700'>Image uploaded successfully</span>
                    ) : (
                        ''
                    )}
                </p>
                <input type="text" placeholder="User Name" className="border p-3 rounded-lg" id="username" value={formData.username} onChange={handleChange} />
                <input type="text" placeholder="Email" className="border p-3 rounded-lg" id="email" value={formData.email} onChange={handleChange} />
                <input type="password" placeholder="Password" className="border p-3 rounded-lg" id="password" value={formData.password} onChange={handleChange} />
                <button className="bg-amber-600 text-white rounded-lg p-3 uppercase hover:bg-amber-700">
                    {loading ? 'Loading...' : 'Update'}
                </button>
            </form>

            <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteAccount}
          className='text-red-700 cursor-pointer'
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
            <p className="text-red-500 mt-5">{error && `Something went wrong: ${error}`}</p>
            <p className="text-green-500 mt-5">{updateSucess && "User is Updated"}</p>
        </div>
    );
};

export default UserProfile;
