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
  HiOutlineClock,
  HiOutlinePhotograph
} from "react-icons/hi";
import { FaCheck, FaTimes, FaCrown, FaCamera } from "react-icons/fa";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Total Users */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-xl bg-gradient-to-r from-purple-100 to-purple-50 text-purple-600 shadow-inner">
            <HiOutlineUsers className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalUsers}</p>
          </div>
        </div>
      </motion.div>

      {/* Admins */}
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 shadow-inner">
            <HiOutlineShieldCheck className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Administrators</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalAdmins}</p>
          </div>
        </div>
      </motion.div>

      {/* Super Admins */}
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-xl bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-600 shadow-inner">
            <FaCrown className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Super Admins</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalSuperAdmins}</p>
          </div>
        </div>
      </motion.div>

      {/* Active Users */}
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-xl bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 shadow-inner">
            <HiOutlineClock className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-2xl font-semibold text-gray-800">
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
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center">
          <div className="p-3 mr-4 rounded-xl bg-gradient-to-r from-green-100 to-green-50 text-green-600 shadow-inner">
            <HiOutlineTrendingUp className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">New This Month</p>
            <p className="text-2xl font-semibold text-gray-800">{stats.newThisMonth}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

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
  const [modalType, setModalType] = useState("delete");
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
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <FaCamera className="text-3xl text-amber-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
              Studio User Management
            </h1>
          </motion.div>
          <p className="text-gray-600 mt-2">Manage all studio accounts and permissions</p>
        </div>

        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all duration-300 bg-white"
            />
            <HiOutlineSearch className="absolute top-3 left-3.5 text-gray-400" />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-300"
          >
            <HiOutlineDownload className="text-lg" />
            Export Users
          </motion.button>
        </div>
      </div>

      <UserStatistics users={users} />

      {/* Success Message */}
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

      {/* Main Table */}
      <div className="rounded-xl overflow-hidden bg-white shadow-lg border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-12 w-12 rounded-full border-4 border-amber-500 border-t-transparent"
            />
          </div>
        ) : (currentUser?.isAdmin || currentUser?.isSuperAdmin) && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
                  <th className="py-4 px-6 text-left font-medium rounded-tl-xl">
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
                  <th className="py-4 px-6 text-center font-medium rounded-tr-xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => {
                  const online = isOnline(user.lastActive);
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}
                      className="transition-colors duration-200"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-700 font-medium">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="relative inline-block">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="inline-block overflow-hidden rounded-xl w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner"
                          >
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                          {online && (
                            <motion.span 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {user.username}
                          {user.isSuperAdmin && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 px-2 py-1 rounded-full">
                              Studio Owner
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-gray-600">{user.email}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === "inactive" 
                              ? "bg-gradient-to-br from-red-100 to-red-50 text-red-800" 
                              : "bg-gradient-to-br from-green-100 to-green-50 text-green-800"
                          }`}
                        >
                          {user.status === "inactive" ? "Inactive" : "Active"}
                        </motion.span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {user.isSuperAdmin ? (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-800"
                          >
                            <FaCrown className="mr-1 text-indigo-500" />
                            Super Admin
                          </motion.span>
                        ) : user.isAdmin ? (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-br from-green-100 to-green-50 text-green-800"
                          >
                            <FaCheck className="mr-1 text-green-500" />
                            Admin
                          </motion.span>
                        ) : (
                          <motion.span 
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-br from-gray-100 to-gray-50 text-gray-800"
                          >
                            <FaTimes className="mr-1 text-gray-500" />
                            User
                          </motion.span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {currentUser.isSuperAdmin && !user.isSuperAdmin && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleAdminStatus(user._id, user.isAdmin, user.isSuperAdmin)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-sm ${
                              user.isAdmin 
                                ? "bg-gradient-to-br from-red-500 to-red-600 text-white" 
                                : "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                            }`}
                          >
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </motion.button>
                        )}
                        {user.isSuperAdmin && (
                          <span className="inline-block px-4 py-2 text-sm text-gray-500">
                            Full Access
                          </span>
                        )}
                        {!currentUser.isSuperAdmin && user.isAdmin && (
                          <span className="inline-block px-4 py-2 text-sm text-gray-500">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-center">
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
                              className={`p-2 rounded-xl ${
                                user.status === "inactive" 
                                  ? "text-green-500 bg-green-50 hover:bg-green-100" 
                                  : "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              } transition-colors duration-300 shadow-sm`}
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
                              className="p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors duration-300 shadow-sm"
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-white rounded-xl"
          >
            <HiOutlinePhotograph className="text-gray-300 text-5xl mb-3" />
            <p className="text-gray-500 text-lg font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>

      {/* Modal - Either Delete or Status Toggle */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                {modalType === "delete" ? (
                  <>
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6 }}
                      className="p-4 bg-red-100 rounded-2xl mb-6"
                    >
                      <HiOutlineExclamationCircle className="text-red-500 text-5xl" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Confirm Deletion</h2>
                    <p className="text-gray-600 mb-8">
                      Are you sure you want to delete this user account? This will permanently remove all associated data.
                    </p>
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDeleteUser}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-all duration-300 shadow-md"
                      >
                        Delete Account
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 shadow-md"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="p-4 bg-amber-100 rounded-2xl mb-6"
                    >
                      <HiOutlineShieldExclamation className="text-amber-500 text-5xl" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Change User Status</h2>
                    <p className="text-gray-600 mb-8">
                      This will {filteredUsers.find(u => u._id === selectedUserId)?.status === "active" ? "deactivate" : "activate"} the user's account, {filteredUsers.find(u => u._id === selectedUserId)?.status === "active" ? "preventing" : "allowing"} them to access the studio system.
                    </p>
                    <div className="flex gap-4 w-full">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleUserStatus(selectedUserId)}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium transition-all duration-300 shadow-md"
                      >
                        Confirm Change
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-300 shadow-md"
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