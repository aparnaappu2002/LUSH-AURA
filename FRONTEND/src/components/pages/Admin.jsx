// Admin.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AdminLogin from "../admin/AdminLogin";
import DashboardLayout from "../admin/Dashboard";
import UsersList from "../admin/UserList";
import CategoryManagement from "../admin/CategoryManagement";
 import Layout from "../shared/Layout";
import ProductList from "../product/ProductList";
import AddProduct from "../product/AddProduct";


const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  if (location.pathname === "/" || location.pathname === "/adminlogin" || location.pathname === "/shop" || location.pathname === "/productdetails" ) {
    return children; // Login page without sidebar
  }
  return <Layout>{children}</Layout>;
};
import ProtectRoute from "../../protectroute/Protectroute";
import OrderDetails from "../admin/OrderDetails";

function Admin() {
  return (
      <Routes>
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route element={<LayoutWrapper/>}>
        <Route path="/dashboard" element={<ProtectRoute> <DashboardLayout /> </ProtectRoute> } />
        <Route path="/users" element={<ProtectRoute><UsersList /> </ProtectRoute>} />
        <Route path="/categorymanagement" element={<ProtectRoute><CategoryManagement /> </ProtectRoute>} />
        <Route path="/productlist" element={<ProtectRoute> <ProductList /> </ProtectRoute> } />
        <Route path="/addproduct" element={<ProtectRoute>  <AddProduct /> </ProtectRoute>}/>
        <Route path="/orders" element={<ProtectRoute>  <OrderDetails/> </ProtectRoute>}/>
      </Route>
      </Routes>
    
  );
}

export default Admin;