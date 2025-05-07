import { Mail, Settings, LogOut, Edit, Camera, Upload, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../src/firebase'; // Make sure this path is correct for your project
import CustomPopup from '../components/CustomPopup';

export default function AdminProfile({ userData, onClose, onUpdate }) {
  // Destructure user data from props with defaults
  const {
    id,
    name = "Admin User",
    email = "admin@example.com",
    role = "Administrator",
    joinDate = "Jan 1, 2024",
    avatar = "https://cdn.vectorstock.com/i/2000v/95/56/user-profile-icon-avatar-or-person-vector-45089556.avif"
  } = userData || {};

  const [isEditing, setIsEditing] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const [formData, setFormData] = useState({
    username: name,
    email: email,
    avatar: avatar
  });

  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const fileInputRef = useRef(null);
  const avatarMenuRef = useRef(null);

  // Close avatar options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setShowAvatarOptions(false);
      }
    };

    if (showAvatarOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAvatarOptions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/sign-in";
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setShowAvatarOptions(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatarOptions(!showAvatarOptions);
    }
  };

  // Firebase file upload handler (from UserProfile)
  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Replace alert with CustomPopup
        setPopupMessage("File is too large. Please select an image under 2MB.");
        setPopupType('error');
        setShowPopup(true);
        return;
      }
      handleFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation (optional)
    if (!formData.username || !formData.email) {
      setPopupMessage("Username and email are required");
      setPopupType('error');
      setShowPopup(true);
      return;
    }

    try {
      if (!id) {
        console.error('User ID is missing');
        return;
      }

      // Prepare form data (similar to UserProfile)
      const updateData = {
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar
      };

      const response = await fetch(`/api/user/update/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Format the user data properly
        const formattedUser = {
          _id: id,
          username: formData.username,
          email: formData.email,
          avatar: formData.avatar
        };

        // Set editing to false
        setIsEditing(false);

        // Call onUpdate with both the user data and the message
        if (typeof onUpdate === 'function') {
          onUpdate(formattedUser, "Profile updated successfully!");
        } else {
          // Only show popup directly if onUpdate is not available
          setPopupMessage("Profile updated successfully!");
          setPopupType('success');
          setShowPopup(true);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);

        // Show error with CustomPopup instead of alert
        setPopupMessage(errorData.message || "Failed to update profile");
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);

      // Show error with CustomPopup instead of alert
      setPopupMessage("An error occurred while updating your profile");
      setPopupType('error');
      setShowPopup(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header section with modern design */}
      <div className="w-full h-40 bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '15px 15px'
          }}></div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white opacity-5 -m-24"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black opacity-5 -m-16"></div>
        <div className="absolute top-4 left-4 flex items-center">
          <Camera size={28} className="text-white opacity-80" />
          <span className="text-white text-lg font-medium ml-2 opacity-90">Studio Admin</span>
        </div>
      </div>

      {/* Profile content */}
      <div className="w-full px-8 py-6 -mt-20 flex flex-col items-center relative z-10">
        {/* Avatar with border */}
        <div className="relative" ref={avatarMenuRef}>
          <div
            className="group w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100"
            onClick={handleAvatarClick}
          >
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Profile"
                className={`w-full h-full object-cover transition-all duration-300 ${isEditing ? 'group-hover:opacity-80' : ''}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <User size={64} className="text-gray-400" />
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={36} className="text-white" />
              </div>
            )}
          </div>

          {/* Upload progress indicator */}
          {filePerc > 0 && filePerc < 100 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 rounded-lg p-2 text-white text-sm">
              {filePerc}%
            </div>
          )}

          {isEditing && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
              <button
                className="bg-amber-500 p-2 rounded-full hover:bg-amber-600 transition-colors"
                onClick={handleEditToggle}
              >
                <Edit size={18} className="text-white" />
              </button>
            </div>
          )}
          {showAvatarOptions && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white py-2 rounded-xl shadow-xl z-10 w-56 border border-gray-100">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
                Change Photo
              </div>
              <button
                onClick={triggerFileInput}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Upload size={18} className="mr-3 text-amber-500" />
                Upload New Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        {/* File upload error */}
        {fileUploadError && (
          <p className="text-red-500 text-sm mt-2">Error uploading image (max 2MB)</p>
        )}

        {/* User info or edit form */}
        {isEditing ? (
          <div className="w-full mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-5">
              <label className="text-gray-700 text-sm font-medium mb-1 block">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="mb-6">
              <label className="text-gray-700 text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleEditToggle}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 rounded-2xl text-white font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center bg-white rounded-xl p-6 w-full shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            <div className="flex items-center justify-center mt-2 text-gray-600">
              <Mail size={16} className="mr-1" />
              <span>{email}</span>
            </div>
            <div className="mt-3 flex items-center justify-center">
              <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                {role}
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <div className="text-xs text-gray-500">Member since {joinDate}</div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-center text-sm">
              <div className="flex gap-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-800 hover:bg-gray-900 rounded-2xl text-white transition-colors shadow-sm font-medium"
                  onClick={handleEditToggle}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
                <button
                  className="flex items-center justify-center px-3 py-2 bg-amber-500 hover:bg-amber-600 rounded-2xl text-white transition-colors shadow-sm font-medium"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer section */}
      <div className="w-full px-6 py-4 mt-6 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500">
          © 2025 DreamWorks Studio • <a href="#" className="text-amber-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
      <CustomPopup
        show={showPopup}
        message={popupMessage}
        type={popupType}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
}