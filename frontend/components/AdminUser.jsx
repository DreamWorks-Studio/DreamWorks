import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineUserCircle,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineShieldExclamation,
  HiOutlineTrendingUp,
  HiOutlineClock
} from "react-icons/hi";
import { FaCheck, FaTimes, FaCrown } from "react-icons/fa";

const UserStatistics = ({ users }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter(user => user.isAdmin && !user.isSuperAdmin).length,
    totalSuperAdmins: users.filter(user => user.isSuperAdmin).length,
    newThisMonth: users.filter(user => {
      const created = new Date(user.createdAt);
      return created.getMonth() === currentMonth &&
        created.getFullYear() === currentYear;
    }).length,
    activeUsers: users.filter(user => {
      const lastActive = user.lastActive ? new Date(user.lastActive) : new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActive > thirtyDaysAgo;
    }).length
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Total Users */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-full bg-purple-100 text-purple-600">
            <HiOutlineUsers className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold">{stats.totalUsers}</p>
          </div>
        </div>
      </motion.div>

      {/* Admins */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-full bg-blue-100 text-blue-600">
            <HiOutlineShieldCheck className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Administrators</p>
            <p className="text-2xl font-semibold">{stats.totalAdmins}</p>
          </div>
        </div>
      </motion.div>

      {/* Super Admins */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-full bg-indigo-100 text-indigo-600">
            <FaCrown className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Super Admins</p>
            <p className="text-2xl font-semibold">{stats.totalSuperAdmins}</p>
          </div>
        </div>
      </motion.div>

      {/* Active Users */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-full bg-orange-100 text-orange-600">
            <HiOutlineClock className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-2xl font-semibold">
              {stats.activeUsers}
              <span className="text-sm font-normal text-gray-500 ml-1">
                ({Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* New Users This Month */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-full bg-green-100 text-green-600">
            <HiOutlineTrendingUp className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">New This Month</p>
            <p className="text-2xl font-semibold">{stats.newThisMonth}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Function to check if a user is currently online (active within last 5 minutes)
const isOnline = (lastActive) => {
  if (!lastActive) return false;
  const diff = (Date.now() - new Date(lastActive).getTime()) / 6000000;
  return diff < 60;
};

export default function AdminUser() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("delete"); // delete or status
  const [selectedUserId, setSelectedUserId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.isAdmin || currentUser?.isSuperAdmin) {
      fetchUsers();
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchUsers, 3000000);
      return () => clearInterval(interval);
    }
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
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/delete/${selectedUserId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const updated = users.filter((user) => user._id !== selectedUserId);
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

  const toggleAdminStatus = async (id, isAdmin, isSuperAdmin) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`/api/user/toggle-admin/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle admin status");
      }
  
      const data = await res.json();
  
      // Update state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, isAdmin: data.user.isAdmin } : user
        )
      );
      
      setSuccessMessage(data.message || (isAdmin ? "Admin status removed" : "Admin status added"));
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage(error.message);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const toggleUserStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`/api/user/toggle-status/${id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}` 
        },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle user status");
      }
  
      const data = await res.json();
  
      // Update state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user
        )
      );
      
      setShowModal(false);
      setSuccessMessage(data.message || "User status updated successfully");
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage(error.message);
    } finally {
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const generateCSV = () => {
    const headers = ["Username", "Email", "Role", "Status", "Date Created", "Last Active"];
    const rows = filteredUsers.map((user) => [
      user.username,
      user.email,
      user.isSuperAdmin ? "Super Admin" : user.isAdmin ? "Admin" : "User",
      user.status || "active",
      new Date(user.createdAt).toLocaleDateString(),
      user.lastActive ? new Date(user.lastActive).toLocaleString() : "N/A",
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
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-orange-600">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all user accounts</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-300"
            />
            <HiOutlineSearch className="absolute top-3 left-3.5 text-gray-400" />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full text-sm shadow-md hover:bg-orange-700 transition-all duration-300"
          >
            <HiOutlineDownload className="text-lg" />
            Export Users
          </motion.button>
        </div>
      </div>

      <UserStatistics users={users} />

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaCheck className="text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-700"></div>
          </div>
        ) : (currentUser?.isAdmin || currentUser?.isSuperAdmin) && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-orange-700 text-white">
                  <th className="py-4 px-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <HiOutlineCalendar className="text-lg" /> 
                      Date
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center font-medium">
                    User
                  </th>
                  <th className="py-4 px-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <HiOutlineUserCircle className="text-lg" /> 
                      Username
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <HiOutlineMail className="text-lg" /> 
                      Email
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-medium">Status</th>
                  <th className="py-4 px-6 text-left font-medium">
                    <div className="flex items-center gap-2">
                      <HiOutlineShieldCheck className="text-lg" /> 
                      Role
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-medium">
                    Permissions
                  </th>
                  <th className="py-4 px-6 text-center font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredUsers.map((user, index) => {
                  const online = isOnline(user.lastActive);
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-4 px-6 border-b border-gray-100">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <div className="relative inline-block">
                          <div className="inline-block overflow-hidden rounded-full w-10 h-10 bg-gray-100">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {online && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 font-medium">
                        {user.username}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-gray-600">
                        {user.email}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "inactive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.status === "inactive" ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        {user.isSuperAdmin ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            <FaCrown className="mr-1 text-indigo-500" />
                            Super Admin
                          </span>
                        ) : user.isAdmin ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheck className="mr-1 text-green-500" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <FaTimes className="mr-1 text-gray-500" />
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        {currentUser.isSuperAdmin && !user.isSuperAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin, user.isSuperAdmin)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              user.isAdmin 
                                ? "bg-red-500 text-white" 
                                : "bg-purple-600 text-white"
                            }`}
                          >
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </motion.button>
                        )}
                        {user.isSuperAdmin && (
                          <span className="inline-block px-4 py-2 text-sm text-gray-500">
                            Super Admin
                          </span>
                        )}
                        {!currentUser.isSuperAdmin && user.isAdmin && (
                          <span className="inline-block px-4 py-2 text-sm text-gray-500">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100 text-center">
                        <div className="flex justify-center space-x-2">
                          {/* Status Toggle Button */}
                          {!user.isSuperAdmin && (currentUser.isSuperAdmin || currentUser.isAdmin) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setModalType("status");
                                setShowModal(true);
                                setSelectedUserId(user._id);
                              }}
                              className={`p-2 rounded-full ${
                                user.status === "inactive" ? "text-green-500 hover:bg-green-50" : "text-yellow-500 hover:bg-yellow-50"
                              } transition-colors duration-300`}
                              aria-label={user.status === "inactive" ? "Activate user" : "Deactivate user"}
                              title={user.status === "inactive" ? "Activate" : "Deactivate"}
                            >
                              <HiOutlineShieldExclamation className="text-lg" />
                            </motion.button>
                          )}
                          
                          {/* Delete Button */}
                          {!user.isSuperAdmin && (currentUser.isSuperAdmin || (currentUser.isAdmin && !user.isAdmin)) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setModalType("delete");
                                setShowModal(true);
                                setSelectedUserId(user._id);
                              }}
                              className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors duration-300"
                              aria-label="Delete user"
                              title="Delete"
                            >
                              <HiOutlineTrash className="text-lg" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <HiOutlineExclamationCircle className="text-gray-400 text-5xl mb-3" />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Modal - Either Delete or Status Toggle */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full"
            >
              <div className="flex flex-col items-center text-center">
                {modalType === "delete" ? (
                  <>
                    <div className="p-3 bg-red-100 rounded-full mb-4">
                      <HiOutlineExclamationCircle className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteUser}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-full font-medium transition-all duration-300"
                      >
                        Delete User
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-yellow-100 rounded-full mb-4">
                      <HiOutlineShieldExclamation className="text-yellow-500 text-4xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Change User Status</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to change this user's status? This will affect their ability to log in.
                    </p>
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleUserStatus(selectedUserId)}
                        className="flex-1 py-2.5 bg-yellow-500 text-white rounded-full font-medium transition-all duration-300"
                      >
                        Change Status
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-full font-medium transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}