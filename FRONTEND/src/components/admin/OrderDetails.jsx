'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle } from 'lucide-react'
import Select from 'react-select'
import axios from '../../axios/adminAxios'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Action</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders')
        setOrders(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleStatusChange = (orderId, newStatus) => {
    setPendingStatusChange({ orderId, newStatus });
    setIsConfirmModalOpen(true);
  };

  const confirmStatusChange = async () => {
    setIsConfirmModalOpen(false);
    if (!pendingStatusChange) return;

    const { orderId, newStatus } = pendingStatusChange;
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await axios.put(`/editorder/${orderId}`, { orderStatus: newStatus });
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prevOrder => ({ ...prevOrder, orderStatus: newStatus }));
      }
      
      console.log("Order status changed successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      setUpdateError("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
      setPendingStatusChange(null);
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-pink-700">Order Management</h1>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-pink-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentStatus}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-pink-600 hover:text-pink-900 transition-colors duration-200"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(orders.length / ordersPerPage)}
              </span>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => paginate(Math.ceil(orders.length / ordersPerPage))}
                disabled={currentPage === Math.ceil(orders.length / ordersPerPage)}
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-4 text-pink-700">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                  <p><strong>User ID:</strong> {selectedOrder.userId._id}</p>
                  <p><strong>User Name:</strong> {`${selectedOrder.userId.firstName} ${selectedOrder.userId.lastName}`}</p>
                  <p><strong>User Email:</strong> {selectedOrder.userId.email}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Total Items:</strong> {selectedOrder.totalItems}</p>
                  <p><strong>Total Price:</strong> ₹{selectedOrder.totalPrice.toFixed(2)}</p>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Order Status</h3>
                <div className="flex items-center space-x-4">
                  <Select
                    value={{ label: selectedOrder.orderStatus, value: selectedOrder.orderStatus }}
                    onChange={(selectedOption) => handleStatusChange(selectedOrder._id, selectedOption.value)}
                    options={[
                      { label: 'Placed', value: 'Placed' },
                      { label: 'Processing', value: 'Processing' },
                      { label: 'Shipped', value: 'Shipped' },
                      { label: 'Delivered', value: 'Delivered' },
                      { label: 'Cancelled', value: 'Cancelled' },
                    ]}
                    className="w-64"
                    isDisabled={isUpdating}
                  />
                  {isUpdating && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-pink-500 mr-2"></div>
                      <span className="text-sm text-gray-700">Updating...</span>
                    </div>
                  )}
                  {updateError && (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm">{updateError}</span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.variance.size && <p>Size: {item.variance.size}</p>}
                          {item.variance.color && <p>Color: {item.variance.color}</p>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmStatusChange}
        message={`Are you sure you want to change the order status to ${pendingStatusChange?.newStatus}?`}
      />
    </div>
  )
}

export default OrderManagement

