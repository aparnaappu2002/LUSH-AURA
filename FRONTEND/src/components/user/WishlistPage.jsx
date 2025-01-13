import React, { useState, useEffect } from 'react';
import axios from '../../axios/userAxios';
import { Heart, ShoppingCart, Loader, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import Navbar from '../shared/Navbar';
import {toast,Toaster} from "react-hot-toast";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.user);
  const userId = user.id || user._id;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`wishlist/${userId}`);
      console.log("Response:", response);
      
      if (response.data && response.data.data) {
        setWishlist(response.data.data);
      } else {
        setWishlist([]);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError('Failed to fetch wishlist. Please try again later.');
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`wishlistdelete/${id}`);
      setWishlist(wishlist.filter(item => item._id !== id));
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const addToCart = async (item) => {
    try {
      const response = await axios.post(`/wishadd`, {
        userId: userId, // User ID
        productId: item.productId, // Product ID
        productName: item.productName, // Product Name
        variance: item.variance, // Variance object (size, color, varianceImage)
        quantity: item.quantity || 1, // Quantity (default: 1)
        price: item.price, // Price of the product
        subtotal: item.price * (item.quantity || 1), // Calculate subtotal
        availableQuantity: item.availableQuantity, // Stock availability
      });
  
      if (response.data.message) {
        toast.success("Product added to cart")
        console.log("Item added to cart:", response.data);
        await removeFromWishlist(item._id);
      }
    } catch (err) {
      if (err.response && err.response.data.error === "Product already exists in the cart with the selected variance.") {
        toast.error("This product is already in your cart with the selected variance.");
      } else {
        console.error("Error adding item to cart:", err);
        setError("Failed to add item to cart. Please try again.");
      }
    }
  };
  
  


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-pink-800 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-pink-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-pink-800 mb-8 text-center">My Wishlist</h1>
          {wishlist.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentItems.map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                    <div className="relative aspect-w-1 aspect-h-1">
                      {item.productId && item.productImage ? (
                        <img 
                          src={item.productImage} 
                          alt={item.productName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder.svg?height=200&width=200';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-pink-100">
                          <ImageOff className="w-8 h-8 text-pink-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h2 className="text-sm font-semibold text-pink-800 mb-1 truncate">{item.productName}</h2>
                      <p className="text-pink-600 font-bold mb-2 text-sm">
                        ₹{item.productId && item.productId.price ? item.productId.price.toFixed(2) : 'N/A'}
                      </p>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => removeFromWishlist(item._id)}
                          className="flex-1 py-1 px-2 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 hover:bg-pink-200 transition-colors duration-300"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => addToCart(item)}

                          className={`flex-1 py-1 px-2 rounded-full text-xs font-semibold ${
                            item.inCart
                              ? 'bg-pink-200 text-pink-800 hover:bg-pink-300'
                              : 'bg-pink-500 text-white hover:bg-pink-600'
                          } transition-colors duration-300`}
                        >
                          {item.inCart ? (
                            <span className="flex items-center justify-center">
                              <ShoppingCart size={12} className="mr-1" />
                              In Cart
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <ShoppingCart size={12} className="mr-1" />
                              Add to Cart
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-pink-100 text-pink-800 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-pink-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-pink-100 text-pink-800 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-pink-800 mt-16">
              <Heart size={64} className="mx-auto mb-4 text-pink-400" />
              <p className="text-xl">Your wishlist is empty</p>
              <p className="mt-2">Start adding your favorite beauty products!</p>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
};

export default WishlistPage;

