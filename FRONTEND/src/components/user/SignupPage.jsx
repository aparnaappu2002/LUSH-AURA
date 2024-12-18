import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios/userAxios';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // Import eye icons
import { useDispatch } from 'react-redux';
import { addToken } from '../redux/Slices/tokenSlice';
import { addUser } from '../redux/Slices/userSlice';
const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch= useDispatch()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  
  // State to toggle password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === 'password') {
      validatePassword(value);
    }

    if (name === 'confirmPassword') {
      validateConfirmPassword(value);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(password)) {
      setPasswordError(
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      );
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure there are no validation errors
    if (passwordError || confirmPasswordError) {
      console.log('Form has errors. Please correct them.');
      return;
    }

    try {
      // Make the API call to your backend
      const response = await axios.post('/signup', formData);
      //console.log('Response:', response.data);

      // Navigate to the login page upon successful registration
      navigate('/otpverification');
    } catch (error) {
      console.error('Error during signup:', error.response?.data || error.message);
      setSubmissionError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      try {
        const credential = jwtDecode(credentialResponse.credential); 
        const { email, email_verified, given_name, family_name, sub } = credential;
        const response = await axios.post('/google-login', { email, email_verified, firstName: given_name, lastName: family_name, id: sub });
        const { token, user } = response.data;
        // console.log("Hello:",response.data)
        dispatch(addToken(response.data.token))
                
            
        dispatch(addUser(response.data.user))
        // Save token and user info to local storage (for example)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">Join Lush Aura</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Discover your perfect beauty routine</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* First Name and Last Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="first-name" className="sr-only">First Name</label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">Last Name</label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email and Phone Number Fields */}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone-number" className="sr-only">Phone Number</label>
              <input
                id="phone-number"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            {/* Password Field with Eye Icon for visibility */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span 
                  onClick={() => setPasswordVisible(!passwordVisible)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  {passwordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
              </div>
              {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
            </div>

            {/* Confirm Password Field with Eye Icon for visibility */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={confirmPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span 
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  {confirmPasswordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
              </div>
              {confirmPasswordError && <p className="mt-2 text-sm text-red-600">{confirmPasswordError}</p>}
            </div>

          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
            >
              Sign up
            </button>
          </div>
          {submissionError && <p className="mt-2 text-sm text-red-600">{submissionError}</p>}
        </form>

        {/* Google Signup */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign up with</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => toast.error('Google Signup failed.')}
            />
          </div>
        </div>

        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a onClick={() => navigate('/login')} className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
