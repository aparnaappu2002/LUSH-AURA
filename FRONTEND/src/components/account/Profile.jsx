import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link,useParams } from 'react-router-dom';
import { addUser } from '../redux/Slices/userSlice';
import axios from '../../axios/userAxios';
import { toast } from 'react-toastify';
import { FaCamera, FaEdit, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaHome } from 'react-icons/fa';
import profileIcon from "../../assets/images/profile-icon-design-free-vector.jpg"
import Navbar from '../shared/Navbar';


const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const { id } = useParams(); 
  console.log("User in Profile:", user);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {

      try {
        const response = await axios.get(`/profile/${user.id}`);
        console.log("Response:",response)
        addUser(response.data.user);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phoneNumber,
          email: response.data.email,
        });
        toast.success('User details fetched successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching user details');
      }
    };
    fetchUserDetails();
  }, [id]);
  


  


  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) {
    return (
      <>
      <Navbar/>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md w-full"
        >
          <div className="mb-6">
            <FaUser className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view and manage your profile.
          </p>
          <Link
            to="/login"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Log In Now
          </Link>
        </motion.div>
      </div>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("form:",formData)
    try {
      const response = await axios.put(`/changeUserInfo/${user.id}`, formData);
      console.log("Response:", response.data);

      toast.success(response.data.message);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user information');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    console.log('Payload:', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    
    try {
      const response = await axios.patch(`/changePassword/${user.id}`, {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword:passwordData.confirmPassword
      });
      toast.success(response.data.message);
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Banner and Profile Photo */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-pink-400 to-pink-600 rounded-t-lg">
            <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
              {/* <FaCamera className="w-5 h-5 text-gray-600" /> */}
            </button>
          </div>
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="relative">
              <img
                src={user.profileImage || profileIcon}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white"
              />
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                <FaCamera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-b-lg shadow-sm pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h1>
              {/* <p className="text-gray-600">{user.bio || 'No bio added yet'}</p> */}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <FaLock className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {isChangingPassword && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handlePasswordSubmit}
              className="mb-8 p-6 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Update Password
                </button>
              </div>
            </motion.form>
          )}

          {isEditing ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaEnvelope className="w-5 h-5" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaPhone className="w-5 h-5" />
                    <span>{formData.phone || 'No phone number added'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaHome className="w-5 h-5" />
                    <div>
                      <p>{user.address || 'No address added'}</p>
                      <p>{user.pincode && `Pincode: ${user.pincode}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapMarkerAlt className="w-5 h-5" />
                    <span>{user.location || 'No location added'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Account Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold">0</div>
                    <div className="text-sm text-gray-600">Orders</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-semibold">0</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {isOpen && (
        <EmailVerification
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          formData={formData}
          userId={user._id}
        />
      )}
    </div>
    </>
  );
};

export default Profile;

