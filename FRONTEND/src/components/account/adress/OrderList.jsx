import React, { useState, useEffect } from "react";
import axios from "../../../axios/userAxios";
import { useSelector } from "react-redux";
import Navbar from "../../shared/Navbar";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Placed":
        return "bg-blue-100 text-blue-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const PaymentStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const ReturnModal = ({ isOpen, onClose, onSubmit, orderId, productId }) => {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = () => {
    onSubmit(orderId, productId, reason === "Other" ? otherReason : reason);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-pink-50 p-6 text-left align-middle shadow-xl transition-all border border-pink-200">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="text-pink-400 hover:text-pink-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-pink-700 mb-4 flex items-center"
                >
                  <span role="img" aria-label="flower" className="mr-2">
                    🌸
                  </span>
                  Return Product
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Please select a reason for returning this product:
                  </p>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 bg-white text-gray-700"
                  >
                    <option value="">Select a reason</option>
                    <option value="Defective">Product is defective</option>
                    <option value="WrongItem">Received wrong item</option>
                    <option value="Unsatisfied">
                      Not satisfied with the product
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  {reason === "Other" && (
                    <textarea
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      placeholder="Please specify the reason"
                      className="mt-2 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50 bg-white text-gray-700"
                      rows="3"
                    />
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-pink-100 px-4 py-2 text-sm font-medium text-pink-900 hover:bg-pink-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    onClick={handleSubmit}
                  >
                    Submit Return Request
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [itemToReturn, setItemToReturn] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherCancelReason, setOtherCancelReason] = useState("");

  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const userId = user?.id || user?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userId = user?.id || user?._id;
        if (!userId) {
          console.error("User ID not found");
          setError("User ID not found");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found");
          setError("Token not found");
          setLoading(false);
          return;
        }

        console.log("User ID:", userId);

        const response = await axios.get(`/orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Orders:", response);

        console.log("Response:", response);
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const openProductCancelModal = (orderId, productId) => {
    setOrderToCancel({ orderId, productId });
    setIsModalOpen(true);
  };

  const openReturnModal = (orderId, productId) => {
    setItemToReturn({ orderId, productId });
    setIsReturnModalOpen(true);
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;

    console.log("orderTocancel", orderToCancel);

    try {
      const token = localStorage.getItem("token");

      // Send cancellation request
      await axios.post(
        `/cancelproduct/${orderToCancel.orderId}`,
        { productId: orderToCancel.productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch orders to reflect updates
      const userId = user?.id || user?._id;
      const response = await axios.get(`/orders/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedOrders = response.data.filter(
        (orders) => orders.items.length > 0
      );

      setOrders(updatedOrders); // Update orders state with the new data
      setIsModalOpen(false);
      setOrderToCancel(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel product");
    }
  };

  const handleReturnRequest = async (orderId, variance, reason) => {
    try {
      setLoading(true); // Set loading state

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      // Request body
      const requestBody = {
        reason,
        userId: user?.id || user?._id,
        variance, // Use consistent keys with the backend
      };

      console.log("Body:", requestBody);

      // Make the return request
      const response = await axios.post(
        `/returnorder/${orderId}`,
        requestBody,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle successful response
      if (response.status === 200) {
        // Fetch updated orders
        const userId = user?.id || user?._id;
        const refreshedOrders = await axios.get(`/orders/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(refreshedOrders.data);
        setIsReturnModalOpen(false);
        setItemToReturn(null);
        alert("Return request submitted successfully.");
      }
    } catch (err) {
      console.error("Error in return request:", {
        message: err.message,
        response: err.response,
      });
      alert(
        err.response?.data?.message ||
          "Failed to submit return request. Please try again later."
      );
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleOrderSubmit = async (e, retryOrderDetails = null) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    
    try {
      if (retryOrderDetails) {
        const razorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: retryOrderDetails.totalPrice * 100, // Convert to paise
          currency: "INR",
          name: "LUSH AURA",
          description: "Order Payment Retry",
          handler: async (paymentResponse) => {
            try {
              // Single API call to handle payment verification and order update
              const { data } = await axios.post(`/retryorder/${retryOrderDetails.orderId}`, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              });

              if (data.success) {
                toast.success("Payment completed successfully!");
                // Update the local state instead of reloading the page
                setOrders(prevOrders => 
                  prevOrders.map(order => 
                    order._id === retryOrderDetails.orderId 
                      ? { ...order, paymentStatus: "Completed" } 
                      : order
                  )
                );
              } else {
                toast.error("Payment verification failed");
              }
            } catch (error) {
              console.error("Error verifying payment:", error);
              toast.error("Payment verification failed");
            }
          },
          modal: {
            ondismiss: async () => {
              toast.error("Payment cancelled");
            }
          },
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: retryOrderDetails.shippingAddress?.phone || ""
          },
          theme: { color: "#EC4899" }
        };

        const razorpay = new Razorpay(razorpayOptions);
        razorpay.open();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };


  const isReturnEligible = (orderDate) => {
    const currentDate = new Date();
    const orderDateObj = new Date(orderDate);
    const diffTime = Math.abs(currentDate - orderDateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    return diffDays <= 7;
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to view your orders
          </h1>
          <button
            onClick={() => navigate("/login")}
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
          <p className="text-gray-500 text-center">No orders found.</p>
        </div>
      </div>
    );
  }

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbar />
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
                        <span className="truncate">
                          {order?.totalItems ?? 0} items
                        </span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className="truncate">
                          ₹{(order?.totalPrice ?? 0).toFixed(2)}
                        </span>
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
                        Payment Status:{" "}
                        <PaymentStatusBadge status={order?.paymentStatus} />
                      </p>
                      {order?.paymentStatus === "Failed" && order?.paymentMethod === "UPI" && (
                        <button
                          onClick={() => handleOrderSubmit(null, {
                            orderId: order._id,
                            totalPrice: order.totalPrice,
                            shippingAddress: order.shippingAddress,
                          })}
                          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                          Retry Payment
                        </button>
                      )}


                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Order Items:
                  </h4>
                  <ul className="divide-y divide-gray-200">
                    {order?.items?.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={item?.variance?.varianceImage?.[0]}
                              alt={item?.productName}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item?.productName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item?.variance?.size && `Size: ${item.variance.size}`}
                              {item?.variance?.size && item?.variance?.color && " | "}
                              {item?.variance?.color && `Color: ${item.variance.color}`}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-sm text-gray-500">
                            {item?.quantity ?? 0} x ₹{(item?.price ?? 0).toFixed(2)}
                          </div>
                          <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                            ₹{(item?.subtotal ?? 0).toFixed(2)}
                          </div>
                          <div>
                            {item?.productStatus === "Returned" ? (
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-green-100 text-green-800">
                                Returned
                              </span>
                            ) : item?.productStatus === "Return Failed" ? (
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-800">
                                Return Failed
                              </span>
                            ) : item?.status !== "Cancelled" && (
                              <button
                                onClick={() =>
                                  order.orderStatus === "Delivered" &&
                                  isReturnEligible(order.orderDate)
                                    ? openReturnModal(order?._id, item?._id)
                                    : openProductCancelModal(order?._id, item?._id)
                                }
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                {order.orderStatus === "Delivered" &&
                                  isReturnEligible(order.orderDate)
                                  ? "Return"
                                  : "Cancel Product"}
                              </button>
                            )}
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
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {Array.from({
              length: Math.ceil(orders.length / ordersPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === index + 1
                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
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
                    <p className="text-sm text-gray-500 mb-4">
                      Please select a reason for cancelling this order:
                    </p>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a reason</option>
                      <option value="ChangeOfMind">Change of mind</option>
                      <option value="DeliveryTooLong">Delivery time too long</option>
                      <option value="FoundBetterDeal">Found a better deal elsewhere</option>
                      <option value="OrderedByMistake">Ordered by mistake</option>
                      <option value="Other">Other</option>
                    </select>
                    {cancelReason === "Other" && (
                      <textarea
                        value={otherCancelReason}
                        onChange={(e) => setOtherCancelReason(e.target.value)}
                        placeholder="Please specify the reason"
                        className="mt-2 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        rows="3"
                      />
                    )}
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

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleReturnRequest}
        orderId={itemToReturn?.orderId}
        productId={itemToReturn?.productId}
      />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          // Default options for specific types
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: "red",
              secondary: "black",
            },
          },
        }}
      />
    </>
  );
};

export default OrderListPage;

