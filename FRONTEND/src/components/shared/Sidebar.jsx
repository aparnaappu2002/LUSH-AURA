// Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome, FaBox, FaUsers, FaListUl, FaGift, FaTicketAlt,
  FaUserFriends, FaStar, FaImage, FaBars, FaTimes,
  FaShoppingCart
} from 'react-icons/fa';

const SidebarItem = ({ icon, text, to, isOpen }) => (
  <Link to={to} className={`flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-pink-100 hover:text-pink-600 rounded-lg transition-all duration-200 ${isOpen ? '' : 'justify-center'}`}>
    {icon}
    {isOpen && <span>{text}</span>}
  </Link>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} min-h-screen relative`}>
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1 bg-pink-600 text-white p-1 rounded-full shadow-lg"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <div className="p-4">
        <h2 className={`text-2xl font-bold text-pink-600 transition-all duration-300 ${isOpen ? '' : 'scale-0 h-0'}`}>
          LUSH AURA
        </h2>
      </div>
      <nav className="mt-6">
        <SidebarItem icon={<FaHome className="w-5 h-5" />} text="Dashboard" to="/dashboard" isOpen={isOpen} />
        <SidebarItem icon={<FaBox className="w-5 h-5" />} text="Products" to="/productlist" isOpen={isOpen} />
        <SidebarItem icon={<FaUsers className="w-5 h-5" />} text="Users" to="/users" isOpen={isOpen} />
        <SidebarItem icon={<FaListUl className="w-5 h-5" />} text="Categories" to="/categorymanagement" isOpen={isOpen} />
        <SidebarItem icon={<FaGift className="w-5 h-5" />} text="Offers" to="/offers" isOpen={isOpen} />
        <SidebarItem icon={<FaTicketAlt className="w-5 h-5" />} text="Coupons" to="/coupons" isOpen={isOpen} />
        <SidebarItem icon={<FaShoppingCart className="w-5 h-5" />} text="Orders" to="/orders" isOpen={isOpen} />
        <SidebarItem icon={<FaStar className="w-5 h-5" />} text="Reviews" to="/reviews" isOpen={isOpen} />
        <SidebarItem icon={<FaImage className="w-5 h-5" />} text="Banners" to="/banners" isOpen={isOpen} />
      </nav>
    </div>
  );
};

export default Sidebar;
