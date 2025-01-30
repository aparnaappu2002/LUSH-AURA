import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from '../../axios/adminAxios'
import { useDispatch } from 'react-redux';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, userName }) => {
  if (!isOpen) return null;
  const dispatch = useDispatch();


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
        <p className="mb-6">Are you sure you want to {action} user {userName}?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [change, setChange] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 9;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/userlist');
        setUsers(response.data.users);
      } catch (error) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleToggleBlock = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const confirmToggleBlock = async () => {
    try {
      const userStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
      setChange(!change);
      const response = await axios.patch(`/useredit/${selectedUser._id}`, { status: userStatus });
      console.log(response.data.message);
      setUsers((prevUsers) => prevUsers.map((u) => u._id === selectedUser._id ? { ...u, status: userStatus } : u));
      if (userStatus === 'inactive' && selectedUser._id === localStorage.getItem('userId')) {
        dispatch(removeUser());
        localStorage.removeItem('userId'); // Optional: Remove userId from local storage
      }
  
    } catch (error) {
      console.log('Error in editing the user status', error.message);
    } finally {
      setModalOpen(false);
      setSelectedUser(null);
    }
  };

  const startIndex = indexOfFirstUser + 1;
  const endIndex = Math.min(indexOfLastUser, filteredUsers.length);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-black border-l-4 border-purple-500 pl-4">
            User Management
          </h2>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 text-sm bg-white border-2 border-gray-200 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                         text-black placeholder-gray-400 transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-500 text-white">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Last Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <FaUserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-sm sm:text-base font-medium text-black">
                              {user.firstName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm sm:text-base text-gray-700">
                          {user.lastName}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`
                            px-3 py-1 inline-flex text-xs sm:text-sm font-medium rounded-full
                            ${user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm sm:text-base text-gray-700">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`
                            px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium
                            ${user.status === 'active'
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                            }
                            transition-all duration-200 shadow-sm hover:shadow-md
                          `}
                        >
                          {user.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex}</span> to{' '}
                  <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium
                      ${currentPage === 1
                        ? 'bg-pink-300 text-black-400 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-800'
                      } transition-colors`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium
                      ${currentPage === totalPages
                        ? 'bg-pink-300 text-black-400 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-800'
                      } transition-colors`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmToggleBlock}
        action={selectedUser?.status === 'active' ? 'block' : 'unblock'}
        userName={selectedUser?.firstName}
      />
    </div>
  );
};

export default UsersList;

