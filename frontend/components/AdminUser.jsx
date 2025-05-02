import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes, FaDownload, FaSearch } from "react-icons/fa";

export default function AdminUser() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found!");

        const res = await fetch(`/api/user/getusers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setFilteredUsers(data.users);
          if (data.users.length < 9) setShowMore(false);
        } else {
          console.error("Error fetching users:", data.message);
        }
      } catch (error) {
        console.error("Fetch Users Error:", error.message);
      }
    };

    if (currentUser?.isAdmin) fetchUsers();
  }, [currentUser?._id]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        const updated = users.filter((user) => user._id !== userIdToDelete);
        setUsers(updated);
        setFilteredUsers(updated);
        setShowModal(false);
        setSuccessMessage("User deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/toggle-status/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, status: data.user.status } : user
          )
        );
        setFilteredUsers((prevFiltered) =>
          prevFiltered.map((user) =>
            user._id === id ? { ...user, status: data.user.status } : user
          )
        );
        setSuccessMessage(`User status updated to ${data.user.status}`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Toggle Status Error:", error.message);
    }
  };

  const generateCSV = () => {
    const headers = ["Username", "Email", "Admin", "Date Created", "Status"];
    const rows = filteredUsers.map((user) => [
      user.username,
      user.email,
      user.isAdmin ? "Yes" : "No",
      new Date(user.createdAt).toLocaleDateString(),
      user.status,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "user_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
          <p className="text-gray-500">Manage registered users below.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
          </div>
          <button
            onClick={generateCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 px-4 py-3 bg-green-100 text-green-800 border border-green-400 rounded shadow">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {currentUser?.isAdmin && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-900 text-white text-left">
                <tr>
                  <th className="py-3 px-6">Date Created</th>
                  <th className="py-3 px-6">User Image</th>
                  <th className="py-3 px-6">Username</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Admin</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-4 px-6 border-b">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 border-b">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                      />
                    </td>
                    <td className="py-4 px-6 border-b">{user.username}</td>
                    <td className="py-4 px-6 border-b">{user.email}</td>
                    <td className="py-4 px-6 border-b">
                      {user.isAdmin ? (
                        <FaCheck className="text-green-600 text-lg" />
                      ) : (
                        <FaTimes className="text-red-500 text-lg" />
                      )}
                    </td>
                    <td className="py-4 px-6 border-b">
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`px-4 py-1 rounded ${
                          user.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td className="py-4 px-6 border-b text-center">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-gray-500">No users found.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <HiOutlineExclamationCircle className="text-red-500 text-5xl mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm Deletion</h2>
            <p className="text-gray-600 mb-5">Are you sure you want to delete this user?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
