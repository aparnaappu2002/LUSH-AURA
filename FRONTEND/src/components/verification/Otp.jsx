'use client'

import React, { useState, useEffect } from 'react'
import axios from '../../axios/userAxios'
import { useNavigate } from 'react-router-dom'

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(interval)
          setIsResendDisabled(false)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])

    if (element.nextSibling) {
      element.nextSibling.focus()
    }
  }

  const handleResend = async () => {
    try {
      setIsResendDisabled(true);
      setTimer(30); // Reset the timer
      
      const response = await axios.post(
        '/resendotp', // Endpoint for resending OTP
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            withCredentials: true,
          },
        }
      );
  
      // Handle response
      console.log('Resend OTP response:', response);
      
      if (response.data.success) {
        setMessage('OTP resent successfully!');
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
  
      setTimeout(() => {
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(
        err.response?.data?.message || 
        'An error occurred while resending the OTP. Please try again later.'
      );
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    console.log("Entered OTP:", enteredOtp);

    try {
        setMessage('');
        setError('');

        const response = await axios.post(
            '/otpverification',
            { otp: enteredOtp },
            {
                headers: {
                    'Content-Type': 'application/json',
                    withCredentials: true,
                },
            }
        );

        console.log('Response data:', response.data);

        if (response.data.success) {
            setMessage('OTP verified successfully! Redirecting...');
            setTimeout(() => {
                navigate('/login'); // Navigate to /login after a short delay
            }, 1000);
        } else {
            setError(response.data.message || 'Verification failed. Please try again.');
        }
    } catch (err) {
        console.error('Error during OTP verification:', err);

        setError(
            err.response?.data?.message || 
            'An error occurred while verifying the OTP. Please try again later.'
        );
    }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-center text-gray-900">Email Verification</h3>
          <p className="mt-1 text-sm text-center text-gray-500">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center space-x-2 mb-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Verify OTP
            </button>
          </form>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-2">
            {timer > 0 ? `Resend OTP in ${timer}s` : 'You can now resend OTP'}
          </div>
          <button
            onClick={handleResend}
            disabled={isResendDisabled}
            className={`w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 ${
              isResendDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Resend OTP
          </button>
          {message && (
            <div className="mt-4 text-sm text-green-600">{message}</div>
          )}
          {error && (
            <div className="mt-4 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
