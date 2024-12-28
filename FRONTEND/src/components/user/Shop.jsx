import React, { useState, useEffect } from 'react';
import axios from '../../axios/userAxios';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../shared/BreadCrumbs';

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
            handleAddToCart();
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
  const productsPerPage = 8;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category'); // Assuming an endpoint for categories
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
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
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

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    const sortedProducts = [...products];
    if (option === 'priceLowToHigh') {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === 'priceHighToLow') {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (option === 'a-z') {
      sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (option === 'z-a') {
      sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
    }

    setProducts(sortedProducts);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Breadcrumb />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-700">Shop</h1>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring focus:ring-pink-400"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring focus:ring-pink-400"
            >
              <option value="default">Sort By</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="a-z">Title: A-Z</option>
              <option value="z-a">Title: Z-A</option>
            </select>
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
