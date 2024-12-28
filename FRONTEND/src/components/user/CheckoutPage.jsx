import React, { useState, useCallback, useEffect } from 'react';
import { PlusIcon, CreditCardIcon, TruckIcon, CheckCircleIcon, MapPinIcon } from 'lucide-react';
import axios from '../../axios/userAxios';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
  animation: 'fadeIn 0.5s ease-in-out',
};

const shimmer = {
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' },
  },
  animation: 'shimmer 2s infinite linear',
  background: 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)',
  backgroundSize: '1000px 100%',
};

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const navigate= useNavigate()
  const user = useSelector((state) => state.user.user);
  const userId = user.id || user._id;

  const fetchAddresses = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/showAddress/${userId}`);
        setAddresses(data.addresses || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    }
  }, [userId]);

  const fetchCartItems = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/cart/${userId}`);
        console.log("cart:", data);
  
        if (data.cart && Array.isArray(data.cart.items)) {
          setItems(data.cart.items);
          setTotalItems(data.cart.totalItems);
          setTotalPrice(data.cart.totalPrice);
        } else {
          console.warn('Cart items are not in the expected format:', data.cart);
          setItems([]);
          setTotalItems(0);
          setTotalPrice(0);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
      }
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
    fetchCartItems();
  }, [fetchAddresses, fetchCartItems]);

  const handleAddressChange = (id) => setSelectedAddress(id);
  const handlePaymentMethodChange = (e) => setPaymentMethod(e.target.value);

  const addNewAddress = async (newAddress) => {
    try {
      const response = await axios.post('/address', { ...newAddress, userId });
      console.log('Address added:', response.data);
      setAddresses(prevAddresses => [...prevAddresses, response.data]);
      setNewAddressModalOpen(false);
      // Fetch addresses again to ensure we have the latest data
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAddress || !paymentMethod) {
        alert('Please select an address and payment method.');
        return;
    }

    const orderDetails = {
        userId,
        items,
        shippingAddress: selectedAddress,
        paymentMethod,
        totalItems,
        totalPrice,
    };

    setIsLoading(true);

    try {
        const response = await axios.post('/addOrder', orderDetails);
        console.log('Order placed:', response.data);
        setOrderPlaced(true);

        // Remove ordered items from cart
        for (const item of items) {
            await removeFromCart(item.productId, item.variance); // Remove each item
        }

        // Clear local cart state
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);

        setTimeout(() => {
            setOrderPlaced(false);
        }, 5000);
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    } finally {
        setIsLoading(false);
    }
};


const removeFromCart = async (productId, variance) => {
    try {
      const userId = user.id || user._id;
      const payload = { userId, productId, variance };
      console.log("payload:", payload); // Log the payload being sent
  
      const response = await axios.post(`/cartempty`, payload);
      console.log('Response from server:', response.data); // Log the server's response
  
      fetchCartItems(); // Refresh the cart after removal
    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };
  



  return (
    <>
    <Navbar/>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-r from-pink-200 to-purple-300 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-8 py-10">
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8 text-center"
          >
            LUSH AURA
          </motion.h2>
          <form onSubmit={handleOrderSubmit} className="space-y-8">
            {/* Address Selection */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-lg font-medium text-gray-700 mb-3">Select Delivery Address</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <motion.div
                    key={addr._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`border-2 ${
                      selectedAddress === addr._id ? 'border-pink-500 shadow-lg' : 'border-gray-200'
                    } rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl`}
                    onClick={() => handleAddressChange(addr._id)}
                  >
                    <div className="flex items-start">
                      <MapPinIcon className="h-6 w-6 text-pink-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {addr.addressLine}, {addr.city}, {addr.state}, {addr.pincode}, {addr.country}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                type="button"
                onClick={() => setNewAddressModalOpen(true)}
                className="mt-4 text-pink-600 hover:text-pink-800 transition-colors duration-300 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="h-5 w-5 inline-block mr-2" />
                Add New Address
              </motion.button>
            </motion.div>

            {/* Payment Options */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-lg font-medium text-gray-700 mb-3">Select Payment Method</label>
              {['Cash on Delivery', 'Debit Card', 'Credit Card', 'UPI'].map((method) => (
                <motion.div
                  key={method}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center p-3 border-2 rounded-lg mb-2 transition-all duration-300 hover:shadow-md"
                >
                  <input
                    id={method}
                    name="paymentMethod"
                    type="radio"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={handlePaymentMethodChange}
                    className="focus:ring-pink-500 h-5 w-5 text-pink-600"
                  />
                  <label htmlFor={method} className="ml-3 text-lg cursor-pointer">
                    {method}
                  </label>
                </motion.div>
              ))}
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Order Summary</h3>
              
              <p className="text-xl text-gray-900 mb-2">Total Items: <span className="font-bold">{totalItems}</span></p>
              <p className="text-xl text-gray-900 mb-4">Total Price: <span className="font-bold text-pink-600">₹{totalPrice}</span></p>

              <div className="mt-6 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b py-3 transition-all duration-300 hover:bg-gray-100 rounded-lg p-2"
                  >
                    <p className="text-lg text-gray-800 font-semibold">{item.productName}</p>
                    <p className="text-gray-600">Size: {item.variance?.size || 0}, Color: {item.variance?.color || 'N/A'}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price per item: ₹{item.price}</p>
                    <p className="text-gray-700 font-medium">Subtotal: ₹{item.subtotal}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-lg font-semibold transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Order Success Message */}
          <AnimatePresence>
            {orderPlaced && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  exit={{ y: 50 }}
                  className="bg-white rounded-3xl p-8 max-w-md w-full"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="mb-4 relative"
                    >
                      <div className="absolute inset-0 bg-green-200 rounded-full animate-ping"></div>
                      <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500 relative z-10" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h3>
                    <p className="text-xl text-gray-600 mb-6">Thank you for your purchase.</p>
                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors duration-300"
                        onClick={() => {
                          // Add a delay to allow the animation to complete
                          setTimeout(() => {
                            navigate(`/orderlist`);
                          }, 500); // Adjust the delay (500ms in this case) to match your animation duration
                        }}
                      
                      >
                        Track Order
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition-colors duration-300"
                        onClick={() => {
                          // Add a delay to allow the animation to complete
                          setTimeout(() => {
                            navigate(`/shop`);
                          }, 500); // Adjust the delay (500ms in this case) to match your animation duration
                        }}
                      >
                        Continue Shopping

                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* New Address Modal */}
      {newAddressModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4">Add New Address</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newAddress = {
                addressLine: formData.get('address'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                country: formData.get('country'),
                pincode: formData.get('pincode'),
                phone: formData.get('phone')
              };
              addNewAddress(newAddress);
            }}>
              {['address', 'street', 'city', 'state', 'country', 'pincode', 'phone'].map((field) => (
                <div key={field} className="mb-4">
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    required
                    className="mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <motion.button 
                  type="button"
                  className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                  onClick={() => setNewAddressModalOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Address
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
    </>
  );
};

export default Checkout;

