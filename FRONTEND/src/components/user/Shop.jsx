import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '../../axios/userAxios';
import { Star, Heart, ChevronLeft, ChevronRight, Search, Filter, SlidersHorizontal } from 'lucide-react';

import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../shared/BreadCrumbs';
import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleAddToCart = () => {
    console.log(`Product added to cart: ${product.title}`);
  };

  const handleCardClick = () => {
    navigate(`/productdetails/${product._id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col justify-between h-full"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={product.productImage[0]}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike();
          }}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          } hover:bg-red-600 hover:text-white transition-colors duration-300`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {product.title}
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price.toFixed(2)}
            </span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="mt-4 w-full bg-pink-400 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors duration-300"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector((state) => state.user.user);
  const productsPerPage = 8;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categorystatus'); // Assuming an endpoint for categories
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/productlist', {
        params: {
          category: selectedCategory || '', // Send category only if selected
          search: searchQuery || '',       // Send search only if not empty
        },
      });
      let fetchedProducts = Array.isArray(response.data.products) ? response.data.products : [];
    
    // Apply sorting based on current sortOption
    fetchedProducts = sortProducts(fetchedProducts, sortOption);

    setProducts(fetchedProducts);

    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to the first page on category change
  };

  const sortProducts = (productsToSort, sortOption) => {
    const sortedProducts = [...productsToSort];
    if (sortOption === 'priceLowToHigh') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceHighToLow') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'a-z') {
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'z-a') {
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    }
    return sortedProducts;
  };
  

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
  
    // Sort products locally based on the selected option
    setProducts(sortProducts(products, option));
  };
  

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  if (!user) {
    return (
      <>
      <Navbar/>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-8 text-center shadow-lg max-w-md w-full"
        >
          <div className="mb-6">
            <FaUser className="w-16 h-16 mx-auto text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view and manage your profile.
          </p>
          <Link
            to="/login"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Log In Now
          </Link>
        </motion.div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Breadcrumb />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pink-800 mb-6">Lush Aura Collection</h1>
            
            {/* Enhanced Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-5 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search for products..."
                      className="w-full pl-12 pr-4 py-3 border border-pink-100 rounded-lg bg-pink-50/30 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-4">
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="w-full appearance-none pl-12 pr-10 py-3 border border-pink-100 rounded-lg bg-pink-50/30 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                    <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-pink-400 w-5 h-5" />
                  </div>
                </div>

                {/* Sort Options */}
                <div className="md:col-span-3">
                  <div className="relative">
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="w-full appearance-none pl-12 pr-10 py-3 border border-pink-100 rounded-lg bg-pink-50/30 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300"
                    >
                      <option value="default">Sort By</option>
                      <option value="priceLowToHigh">Price: Low to High</option>
                      <option value="priceHighToLow">Price: High to Low</option>
                      <option value="a-z">Title: A-Z</option>
                      <option value="z-a">Title: Z-A</option>
                    </select>
                    <SlidersHorizontal className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                    <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-pink-400 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700">
                    {categories.find(cat => cat._id === selectedCategory)?.categoryName || 'Selected Category'}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-700">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 hover:text-pink-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
