import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingBag, FaUserEdit, FaRegHeart, FaChevronLeft, FaChevronRight,FaAddressBook } from "react-icons/fa";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-pink-200 text-pink-800' : 'text-gray-600 hover:bg-pink-100 hover:text-pink-700';
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} bg-white text-gray-800 transition-all duration-300 ease-in-out shadow-lg`}>
      <div className="flex items-center justify-between h-20 px-4 border-b border-pink-100">
        {!isCollapsed && <h1 className="text-2xl font-bold text-pink-600">Lush Aura</h1>}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      <nav className="flex-grow">
        <ul className="flex flex-col py-4">
          <li>
            <Link to="/profile" className={`flex items-center px-4 py-3 ${isActive('/profile')} transition-colors duration-200`}>
              <FaUserEdit className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>My Account</span>}
            </Link>
          </li>
          <li>
            <Link to="/address" className={`flex items-center px-4 py-3 ${isActive('/address')} transition-colors duration-200`}>
              <FaAddressBook className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>My Address</span>}
            </Link>
          </li>
          <li>
            <Link to="/orderlist" className={`flex items-center px-4 py-3 ${isActive('/orderlist')} transition-colors duration-200`}>
              <FaShoppingBag className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>Recent Orders</span>}
            </Link>
          </li>
          <li>
            <Link to="/wishlist" className={`flex items-center px-4 py-3 ${isActive('/wishlist')} transition-colors duration-200`}>
              <FaRegHeart className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>Wishlist</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-pink-100">
        {!isCollapsed && (
          <div className="text-sm text-gray-500 text-center">
            Discover your beauty with Lush Aura
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

