import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateUserStart, updateUserSuucess, updateUserFailure ,deleteUserStart, deleteUserSuucess, deleteUserFailure, signOut } from "../src/redux/user/userSlice";

const UserProfile = () => {

    const dispatch = useDispatch();
    const { currentUser, error, loading } = useSelector((state) => state.user);
    const fileRef = useRef(null);
    const [updateSucess, setupdateSucess] = useState(false);

    // 🟢 Add state for form inputs
    const [formData, setFormData] = useState({
        username: currentUser?.username || "",
        email: currentUser?.email || "",
        password: "",
        avatar: currentUser?.avatar || "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif",
    });

    // 🟢 Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    console.log(formData);
    
    // 🟢 Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // 🟢 Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!currentUser?._id) {
            console.error("User ID is missing!");
            return;
        }

        try {
          dispatch(updateUserStart());
          const res = await fetch(`/api/user/update/${currentUser._id}`, {
            method: 'PATCH',  // 🔹 Changed from POST to PATCH
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (!res.ok) {  // 🔹 Better API response checking
            dispatch(updateUserFailure(data.message || "Update failed"));
            return;
          }
          dispatch(updateUserSuucess(data));  // Keeping original variable name
          setupdateSucess(true);

        } catch (error) {
          dispatch(updateUserFailure(error.message));
        }
    };

    // 🟢 Handle account deletion
    const handleDeleteAccount = async () => {

        if (!currentUser?._id) {
            console.error("User ID is missing!");
            return;
        }

        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
              method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
              dispatch(deleteUserFailure(data.message || "Delete failed"));
              return;
            }
            dispatch(deleteUserSuucess(data));  // Keeping original variable name
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    // 🟢 Handle user sign out
    const handleSignOut = async () => {
        try {
            await fetch("/api/user/signout");
            dispatch(signOut());
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold text-center m-7">User Profile</h1>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Profile Picture */}
                <img
                    onClick={() => fileRef.current.click()}
                    src={formData.avatar}
                    alt="profile"
                    className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
                />

                {/* Input Fields */}
                <input
                    type="text"
                    placeholder="User Name"
                    className="border p-3 rounded-lg"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    placeholder="Email"
                    className="border p-3 rounded-lg"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-3 rounded-lg"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                {/* Update Button */}
                <button className="bg-amber-600 text-white rounded-lg p-3 uppercase hover:bg-amber-700">
                    {loading ? 'Loading...' : 'Update'}
                </button>
            </form>

            {/* Delete & Sign Out Options */}
            <div className="flex justify-between mt-5">
                <span onClick={handleDeleteAccount} className="text-amber-700 cursor-pointer">Delete Account</span>
                <span onClick={handleSignOut} className="text-amber-700 cursor-pointer">Sign Out</span>
            </div>

            <p className="text-red-500 mt-5">{error && `Something went wrong: ${error}`}</p>
            <p className="text-green-500 mt-5">{updateSucess && "User is Updated"}</p>
        </div>
    );
};

export default UserProfile;
