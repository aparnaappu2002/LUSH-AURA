import React, { useState, useEffect } from 'react';
import axios from '../../axios/userAxios';
import { Heart, Trash2, ShoppingBag, AlertCircle, Loader, Plus, Minus } from 'lucide-react';
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
  
      console.log("CartData:", cartData);
  
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
              availableQuantity:item.availableQuantity
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4">
          <Loader className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-xl text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-4 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-xl text-red-500">Error: {error}</p>
          </div>
          <button 
            onClick={fetchCartItems}
            className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <Loader className="w-5 h-5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Your Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-2xl text-gray-600">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 lg:w-1/4">
                    <img src={item.image} alt={item.name} className="w-full h-48 md:h-full object-cover" />
                  </div>
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2 text-gray-800">{item.name}</h2>
                      <p className="text-gray-600 mb-2 text-xl font-bold">₹{item.price.toFixed(2)}</p>
                      
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-4">
                      <div className="flex items-center space-x-2 mb-2 md:mb-0">
                      <button
  onClick={() =>
    updateQuantity(item.id, item.variance, Math.max(1, item.quantity - 1))
  }
  className="bg-gray-200 rounded-full p-1 hover:bg-gray-300 transition-colors duration-200"
>
  <Minus className="w-4 h-4" />
</button>
<span className="text-lg font-semibold">{item.quantity}</span>
<button
  onClick={() =>
    updateQuantity(item.id, item.variance, item.quantity + 1)
  }
  className="bg-gray-200 rounded-full p-1 hover:bg-gray-300 transition-colors duration-200"
>
  <Plus className="w-4 h-4" />
</button>

                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => moveToWishlist(item.id)}
                          className="flex items-center text-pink-500 hover:text-pink-600 transition-colors duration-300"
                          aria-label={`Move ${item.name} to wishlist`}
                        >
                          <Heart className="w-5 h-5 mr-1" />
                          <span className="text-sm">Wishlist</span>
                        </button>
                        <button
                          onClick={() => handleRemoveClick(item)}
                          className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-300"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-5 h-5 mr-1" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Total: ₹{totalPrice.toFixed(2)}
            </div>
            <button
              onClick={proceedToPay}
              className="w-full md:w-auto group bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-base hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 group-hover:animate-bounce" />
              <span>Proceed to Pay</span>
            </button>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
            <p className="mb-6">Are you sure you want to remove this item from your cart?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 bg-pink-200 text-gray-800 rounded hover:bg-pink-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors duration-200"
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