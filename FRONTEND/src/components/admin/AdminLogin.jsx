import React, { useState,useEffect } from 'react';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import axios from '../../axios/adminAxios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToken } from '../redux/Slices/tokenSlice';
import { addUser } from '../redux/Slices/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  
  

  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
   
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true); 
      try {

        const response = await axios.post('/adminlogin', { email, password });

        const { token, user } = response.data;

        
        dispatch(addToken(token));
        dispatch(addUser(user));

        
        localStorage.setItem('id', user.id);

       
        toast.success('Login successful'); 

        
        navigate('/dashboard', { replace: true });
      } catch (error) {
        
        if (error.response && error.response.data) {
          
          toast.error(error.response.data.message || 'Login failed. Please try again.');
        } else {
          
          toast.error('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsLoading(false); 
      }
    } else {
      
      setErrors(formErrors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 via-pink-200 to-pink-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Admin Login</h2>
        <h3 className="text-xl font-medium text-center text-gray-600 mb-6">LUSH AURA</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm`}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <FaSpinner className="animate-spin h-5 w-5 mr-3" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        <ToastContainer /> 
      </div>
    </div>
  );
};

export default AdminLogin;
