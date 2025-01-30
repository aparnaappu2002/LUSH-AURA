import React, { useState, useEffect } from 'react';
import axios from '../../axios/userAxios';
import { ShoppingBasket, AlertCircle, Loader, Plus, Minus, X, Package, HeartIcon, CreditCard } from 'lucide-react';
import { useSelector } from 'react-redux';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const navigate= useNavigate()
  const user = useSelector((state) => state.user.user);

  
  

  useEffect(() => {
    fetchCartItems();
  }, []);
  
  useEffect(() => {
    const newTotalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(newTotalPrice);
  }, [cartItems]);
  
  const fetchCartItems = async () => {
    const userId = user.id || user._id; // Ensure user.id is correctly set
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/cart/${userId}`); // Fetch cart items from the server
      const cartData = response.data.cart;
  
     // console.log("CartData:", cartData);
  
      if (cartData && Array.isArray(cartData.items)) {
        setCartItems(
          cartData.items.map((item) => {
            // Fetching productName directly from the response
            const imageUrl = item.image || ""; // Use image URL directly from item
            return {
              id: item.productId._id || item.productId, // Ensure productId works for both populated or plain fields
              name: item.productName || "Unknown Product", // Use productName from the response
              price: item.price,
              image: imageUrl,
              quantity: item.quantity,
              variance: item.variance,
              availableQuantity:item.availableQuantity,
              productStatus: item.productId.status, // Add product status
              categoryStatus: item.productId.categoryId?.status
            };
          })
        );
        setTotalPrice(cartData.totalPrice || 0); // Set the total price of the cart
      } else {
        throw new Error("Invalid data format received from the server");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred"
      );
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCartItems = () => {
    // Reset any previous validation errors
    setValidationError(null);
    
    // Check each item in the cart
    for (const item of cartItems) {

      if (item.productStatus !== 'active') {
        setValidationError(`${item.name} is currently not available for purchase`);
        return false;
      }

      // Check category status
      if (item.categoryStatus !== 'active') {
        setValidationError(`${item.name} belongs to a category that is currently not available`);
        return false;
      }
      // Check if item is available (quantity > 0)
      if (item.availableQuantity <= 0) {
        setValidationError(`${item.name} is currently out of stock`);
        return false;
      }
      
      // Check if requested quantity exceeds available quantity
      if (item.quantity > item.availableQuantity) {
        setValidationError(
          `Only ${item.availableQuantity} units of ${item.name} are available`
        );
        return false;
      }
      
      // Check if quantity exceeds maximum limit of 5
      if (item.quantity > 5) {
        setValidationError(
          `Maximum quantity limit is 5 units per item. Please reduce the quantity of ${item.name}`
        );
        return false;
      }
    }
    
    return true;
  };
  
  

  const removeFromCart = async (productId, variance) => {
    try {
        const userId = user.id || user._id; // Ensure userId is correct
        const payload = {
            userId,
            productId,
            variance, // Pass variance details (size and/or color)
        };

        // Debugging: log payload to verify its structure
        console.log("Payload being sent to backend:", payload);

        // Validate that at least one variance detail is provided
        if (!variance || (!variance.size && !variance.color)) {
            throw new Error("Invalid variance details provided");
        }

        await axios.post(`/removecart`, payload); // Use POST to send a body

        fetchCartItems(); // Refresh the cart after removal
    } catch (error) {
        console.error("Error removing item from cart:", error);
        setError("Failed to remove item from cart. Please try again.");
    }
};


  

  const updateQuantity = async (productId, variance, newQuantity) => {
    if (newQuantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }
  
    const item = cartItems.find(
      (i) =>
        i.id === productId &&
        i.variance.size === variance.size &&
        i.variance.color === variance.color
    );
  
    if (!item) {
      setError("Item not found in the cart.");
      return;
    }
  
    if (newQuantity > item.availableQuantity) {
      setError(`Only ${item.availableQuantity} units of this product are available.`);
      return;
    }
    if (newQuantity > 5) {
      setError(`You can only add up to 5 of this product to your cart.`);
      return;
    }
  
    try {
      // Optimistically update the UI
      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((i) =>
          i.id === productId &&
          i.variance.size === variance.size &&
          i.variance.color === variance.color
            ? { ...i, quantity: newQuantity, subtotal: i.price * newQuantity }
            : i
        );
  
        // Recalculate the total price
        const newTotalPrice = updatedItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        setTotalPrice(newTotalPrice);
  
        return updatedItems;
      });
  
      const userId = user.id || user._id;
      const payload = { userId, productId, variance, quantity: newQuantity };
      console.log("Payload being sent to server:", payload);
  
      // Send the update request
      await axios.put(`/updatecart`, payload);
  
      // Optionally refetch the cart to ensure data consistency
      // fetchCartItems();
    } catch (error) {
      console.error("Error updating item quantity:", error);
      setError("Failed to update item quantity. Reverting changes.");
  
      // Revert the optimistic update if the request fails
      fetchCartItems();
    }
  };
  
  
  
  
  
  

  const moveToWishlist = (productId) => {
    // Implement wishlist functionality here
    console.log('Moving to wishlist:', productId);
  };

  const proceedToPay = () => {
    // Validate quantities before proceeding
    if (!validateCartItems()) {
      // If validation fails, the error will be set in state
      return;
    }
  
    console.log("Proceeding to payment");
    navigate("/checkout");
  };

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setShowConfirmModal(true);
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove.id, itemToRemove.variance);
    }
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-3">
          <Loader className="w-6 h-6 text-pink-500 animate-spin" />
          <p className="text-lg text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-lg text-red-500">Error: {error}</p>
          </div>
          <button 
            onClick={fetchCartItems}
            className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <Loader className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-6 space-x-2">
          <ShoppingBasket className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
        </div>

        {validationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{validationError}</p>
            </div>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-xl text-gray-600">Your cart is empty</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="flex">
                  <div className="w-32 h-32">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                        <p className="text-pink-500 font-bold">₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moveToWishlist(item.id)}
                          className="p-1.5 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors duration-300"
                        >
                          <HeartIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveClick(item)}
                          className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors duration-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.variance, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variance, item.quantity + 1)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 bg-white rounded-xl shadow-md p-4">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className="text-xl font-bold text-gray-800">
                  Total: ₹{totalPrice.toFixed(2)}
                </div>
                <button
                  onClick={proceedToPay}
                  className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-base hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Checkout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Remove Item</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;