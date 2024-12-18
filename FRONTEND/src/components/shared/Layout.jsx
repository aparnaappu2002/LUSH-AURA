// Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1  bg-gray-100">
        {children}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
