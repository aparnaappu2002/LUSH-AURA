'use client'

import React, { useState, useEffect } from 'react'
//import { useRouter } from 'next/navigation'
import axios from '../../../axios/userAxios'
import { useSelector } from 'react-redux'
import Navbar from '../../shared/Navbar'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800'
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'Shipped':
        return 'bg-purple-100 text-purple-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

const PaymentStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  )
}

const OrderListPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(2)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)

  const user = useSelector(state => state.user.user)
  //const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userId = user?.id || user?._id
        if (!userId) {
          console.error("User ID not found")
          setError("User ID not found")
          setLoading(false)
          return
        }

        const token = localStorage.getItem('token')
        if (!token) {
          console.error("Token not found")
          setError("Token not found")
          setLoading(false)
          return
        }

        console.log("User ID:", userId)

        const response = await axios.get(`/orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log("Response:", response)
        setOrders(response.data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId)
    setIsModalOpen(true)
  }

  const cancelOrder = async () => {
    if (!orderToCancel) return

    try {
      const token = localStorage.getItem('token')
      await axios.post(`/cancelorder/${orderToCancel}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // Update the order status in the local state
      setOrders(orders.map(order => 
        order._id === orderToCancel ? { ...order, orderStatus: 'Cancelled' } : order
      ))
      setIsModalOpen(false)
      setOrderToCancel(null)
    } catch (err) {
      console.error('Error cancelling order:', err)
      alert('Failed to cancel order')
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
          <p className="text-gray-500 text-center">No orders found.</p>
        </div>
      </div>
    )
  }

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {currentOrders.map((order) => (
              <li key={order?._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Order #{order?._id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <OrderStatusBadge status={order?.orderStatus} />
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className="truncate">{order?.totalItems ?? 0} items</span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className="truncate">₹{(order?.totalPrice ?? 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        <time dateTime={order?.orderDate}>
                          {new Date(order?.orderDate).toLocaleDateString()}
                        </time>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:flex sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Payment Method: {order?.paymentMethod}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Payment Status: <PaymentStatusBadge status={order?.paymentStatus} />
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      {order?.orderStatus !== 'Cancelled' && order?.orderStatus !== 'Delivered' && (
                        <button
                          onClick={() => openCancelModal(order?._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items:</h4>
                  <ul className="divide-y divide-gray-200">
                    {order?.items?.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full" src={item?.variance?.varianceImage?.[0]} alt={item?.productName} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item?.productName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item?.variance?.size && `Size: ${item.variance.size}`}
                              {item?.variance?.size && item?.variance?.color && ' | '}
                              {item?.variance?.color && `Color: ${item.variance.color}`}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">
                            {item?.quantity ?? 0} x ₹{(item?.price ?? 0).toFixed(2)}
                          </div>
                          <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                            ₹{(item?.subtotal ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Cancel Order
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={cancelOrder}
                    >
                      Yes, Cancel Order
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsModalOpen(false)}
                    >
                      No, Keep Order
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default OrderListPage

