import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";

const UserProfile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const fileRef = useRef(null);

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

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-3xl font-semibold text-center m-7">User Profile</h1>

            <form className="flex flex-col gap-4">
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
                    Update
                </button>
            </form>

            {/* Delete & Sign Out Options */}
            <div className="flex justify-between mt-5">
                <span className="text-amber-700 cursor-pointer">Delete Account</span>
                <span className="text-amber-700 cursor-pointer">Sign Out</span>
            </div>
        </div>
    );
};

export default UserProfile;
