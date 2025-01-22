import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User } from 'lucide-react';
import { useSelector,useDispatch } from "react-redux";
import { removeUser } from "../redux/Slices/userSlice";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accountDropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  const dispatch=useDispatch()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(removeUser()); // Clear user from Redux store
    navigate("/login"); // Navigate to login page
  };

  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-3xl font-extrabold text-white tracking-tight hover:text-gray-200 cursor-pointer">
                LUSH AURA
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a
                onClick={() => navigate("/")}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300"
              >
                Home
              </a>
              <a
                onClick={() => navigate("/shop")}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300"
              >
                Shop
              </a>
              
              <a
                onClick={() => navigate("/about")}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300"
              >
                About Us
              </a>
              <a
                 onClick={() => navigate("/contact")}
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300"
              >
                Contact Us
              </a>
              {/* <a
                href="#"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer transition-colors duration-300"
              >
                Brands
              </a> */}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Enhanced Cart Button */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span> */}
            </button>

            {/* Enhanced Account Button and Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
              >
                <User className="h-5 w-5" />
              </button>
              
              {isAccountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform opacity-100 scale-100 transition-all duration-200 ease-out">
                  {user ? (
                    <>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Log Out
                      </button>
                      <button
                        onClick={() => navigate("/profile")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        My Account
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/login")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => navigate("/signup")}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Icon and Cart */}
          <div className="flex items-center sm:hidden space-x-2">
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span> */}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="#"
              className="bg-purple-50 border-purple-500 text-purple-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Makeup
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Skincare
            </a>
            <a
              href="#"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Best Sellers
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">Account</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => navigate("/login")}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
              >
                Register
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;