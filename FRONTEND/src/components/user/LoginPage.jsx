import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from '../../axios/userAxios';
import { addUser } from '../redux/Slices/userSlice';
import { addToken } from '../redux/Slices/tokenSlice';
import { toast,ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const validationErrors = {};

    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      validationErrors.password = 'Password is required';
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/login', { email, password });
      const { token, user } = response.data;

      dispatch(addToken(token));
      dispatch(addUser(user));

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = 'The password you entered is incorrect.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      try {
        const credential = jwtDecode(credentialResponse.credential);
        const { email, email_verified, given_name, family_name, sub } = credential;

        const response = await axios.post('/google-login', {
          email, email_verified, firstName: given_name, lastName: family_name, id: sub
        });

        const { token, user } = response.data;
        dispatch(addToken(token));
        dispatch(addUser(user));

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Google Login successful!');
        navigate('/');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google Login failed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl relative z-10">
        <h2 className="text-center text-4xl font-extrabold text-gray-900">Welcome</h2>
        <p className="text-center text-sm text-gray-600">Sign in to your Lush Aura account</p>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <ToastContainer/>

        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => toast.error('Google Login failed.')} />

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')} className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
