import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminPortfolio = ({ activePage }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = ["Birthday", "UI/UX", "Graphic Design", "Photography", "3D Modeling", "Branding"];
  const navigate = useNavigate();

  const validateFields = () => {
    let errors = {};
    if (!imageFile) errors.imageFile = "Image is required.";
    else if (!imageFile.type.startsWith("image/")) errors.imageFile = "Only image files are allowed.";
    else if (imageFile.size > 5 * 1024 * 1024) errors.imageFile = "File size must be less than 5MB.";
    
    if (!selectedCategory) errors.selectedCategory = "Category is required.";
    if (!description.trim()) errors.description = "Description is required.";
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) setImageFile(file);
  };

  const handleUpload = async () => {
    if (!validateFields()) return;
  
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("category", selectedCategory);
    formData.append("description", description);
  
    try {
      const response = await fetch("http://localhost:5003/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });
  
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          setUploadError(true);
          setUploadSuccess(false);
        } else {
          const errorText = await response.text();
          console.error('Server returned non-JSON error:', errorText);
          setUploadError(true);
          setUploadSuccess(false);
        }
        return;
      }
      
      const data = await response.json();
      console.log("Upload Response:", data);
      
      setUploadSuccess(true);
      setUploadError(false);
      setImageFile(null);
      setSelectedCategory("");
      setDescription("");
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(true);
      setUploadSuccess(false);
    }
  };
  

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Portfolio</h1>
        <button onClick={() => navigate("/viewGallery")} className="bg-black text-white px-8 py-2 hover:bg-gray-800 transition-colors">
          VIEW
        </button>
      </div>

      {uploadSuccess && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">Successfully uploaded!</div>}
      {uploadError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">Upload failed. Please try again!</div>}

      <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-md transition-all">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <input type="file" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
            {errors.imageFile && <p className="text-red-500 text-sm mt-1">{errors.imageFile}</p>}
          </div>

          <div className="w-full md:w-2/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded-md p-2 w-full">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.selectedCategory && <p className="text-red-500 text-sm mt-1">{errors.selectedCategory}</p>}

            <label className="block text-sm font-medium text-gray-700 mt-4">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-300 rounded-md p-2 w-full h-24" placeholder="Enter project description here..."></textarea>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleUpload} className="bg-black text-white px-8 py-2 hover:bg-gray-800 transition-colors">
            DONE
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminPortfolio;
