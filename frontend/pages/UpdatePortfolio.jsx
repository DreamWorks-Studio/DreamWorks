import { useState, useEffect } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify';



const UpdatePortfolio = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Filtering
  const [editingImage, setEditingImage] = useState(null); // Image being edited
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/portfolio/images");
        if (!response.ok) throw new Error("Failed to fetch images");

        const data = await response.json();
        setImages(data);

        // Extract unique categories dynamically
        const uniqueCategories = [...new Set(data.map((img) => img.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchImages();
  }, []);

  // Delete image
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5003/api/portfolio/delete/${id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to delete image");
  
      setImages(images.filter((img) => img._id !== id));
  
      // Success notification
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image.");
    }
  };
  
  

  // Enable edit mode
  const handleEdit = (image) => {
    setEditingImage(image._id);
    setUpdatedDescription(image.description);
    setUpdatedCategory(image.category);
  };

  // Update image
  const handleUpdate = async () => {
    if (!editingImage) return;
  
    try {
      const response = await fetch(`http://localhost:5003/api/portfolio/update/${editingImage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: updatedCategory, description: updatedDescription }),
      });
  
      if (!response.ok) throw new Error("Failed to update image");
  
      setImages(
        images.map((img) =>
          img._id === editingImage ? { ...img, category: updatedCategory, description: updatedDescription } : img
        )
      );
  
      setEditingImage(null);
  
      // Success notification
      toast.success("Image updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update image.");
    }
  };
  

  // Filter images based on category
  const filteredImages = selectedCategory ? images.filter((img) => img.category === selectedCategory) : images;

  return (
    <div className="p-6 w-full min-h-screen bg-gray-100">
      <h2 className="text-xl font-bold uppercase mb-6">Update Portfolio</h2>

      {/* Category Filter Dropdown */}
      <select
        className="border p-2 rounded mb-6"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Gallery Section */}
      <div className="flex flex-col gap-6">
        {filteredImages.length > 0 ? (
          filteredImages.map((img) => (
            <div key={img._id} className="flex items-start gap-4 bg-white shadow rounded-lg p-4">
              <img src={img.imageUrl} alt={img.description} className="w-64 h-64 border object-cover" />

              <div className="flex-1">
                {editingImage === img._id ? (
                  <>
                    {/* Editable fields */}
                    <textarea
                      className="border p-2 w-full mb-2"
                      value={updatedDescription}
                      onChange={(e) => setUpdatedDescription(e.target.value)}
                    />
                    <select
                      className="border p-2 rounded mb-2 w-full"
                      value={updatedCategory}
                      onChange={(e) => setUpdatedCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleUpdate}>
                      Save
                    </button>
                    <button className="px-4 py-2 ml-2 bg-gray-500 text-white rounded" onClick={() => setEditingImage(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {/* Display only */}
                    <p className="text-gray-600 mb-2">{img.description}</p>

                    <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={() => handleEdit(img)}>
                      Edit
                    </button>
                  </>
                )}
              </div>

              <IoTrashOutline
                className="text-2xl text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => handleDelete(img._id)}
              />
              </div>
          ))
        ) : (
          <p>No images found for this category.</p>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        <button>
          <IoIosArrowDown className="text-2xl cursor-pointer" />
        </button>
        <button>
          <AiOutlinePlus className="border p-2 rounded text-2xl cursor-pointer" />
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UpdatePortfolio;
