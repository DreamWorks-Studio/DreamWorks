import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function AdminUser() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found!");

        const res = await fetch(`/api/user/getusers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("Users response:", data);

        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) setShowMore(false);
        } else {
          console.log("Error fetching users:", data.message);
        }
      } catch (error) {
        console.error("Fetch Users Error:", error.message);
      }
    };

    if (currentUser?.isAdmin) fetchUsers();
  }, [currentUser?._id]);

  const handleDeleteUser = async () => {
    try {
        const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok) {
            setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
            setShowModal(false);
        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.log(error.message);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600">Manage and view users</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {currentUser?.isAdmin && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Date Created</th>
                  <th className="py-3 px-4 text-left">User Image</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Admin</th>
                  <th className="py-3 px-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4 border-b">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 border-b">
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4 border-b">{user.username}</td>
                    <td className="py-3 px-4 border-b">{user.email}</td>
                    <td className="py-3 px-4 border-b">
                      {user.isAdmin ? (
                        <FaCheck className="text-green-600 text-lg" />
                      ) : (
                        <FaTimes className="text-red-600 text-lg" />
                      )}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <button
                        onClick={() => {
                          setShowModal(true);
                          setUserIdToDelete(user._id);
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showMore && (
              <button
                className="mt-4 w-full text-blue-500 hover:underline"
                onClick={() => console.log("Load more users...")}
              >
                Show More
              </button>
            )}
          </div>
        ) : (
          <p className="p-4 text-center text-gray-600">No users found!</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <div className="flex justify-center mb-4">
              <HiOutlineExclamationCircle className="text-4xl text-red-500" />
            </div>
            <p className="text-center text-lg font-semibold">Are you sure you want to delete this user?</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded mr-2"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
