import React, { useState, useEffect } from 'react';
import { Star, Heart,ChevronDown,ChevronUp } from 'lucide-react';
import axios from '../../axios/userAxios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import Breadcrumb from '../shared/BreadCrumbs';

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const { id: productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
    fetchRelatedProducts();
    fetchProductReviews();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/productdetails/${productId}`);
      if (response.status === 200 && response.data) {
        //console.log(response)
        setProduct(response.data);
        setSelectedImage(response.data.productImage[0]);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`/relatedproducts/${productId}`);
      if (response.status === 200 && response.data) {
        setRelatedProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // Dummy reviews for the product
  const fetchProductReviews = () => {
    const dummyReviews = [
      { _id: '1', name: 'John Doe', comment: 'Great product! Really loved it, totally worth the price.', rating: 5 },
      { _id: '2', name: 'Jane Smith', comment: 'Good quality, but the size was a bit off. Still satisfied with the purchase.', rating: 4 },
      { _id: '3', name: 'Michael Johnson', comment: 'Not what I expected. The material isn’t as described. Would not recommend.', rating: 2 },
      { _id: '4', name: 'Sarah Lee', comment: 'Excellent product! Fast delivery and high quality. Would definitely buy again!', rating: 5 },
    ];
    setReviews(dummyReviews);
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleDropdown = (type) => {
    if (type === 'highlights') {
      setShowHighlights(!showHighlights);
    } else {
      setShowSpecifications(!showSpecifications);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Breadcrumb/>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row -mx-4">
          {/* Left Section: Image Gallery */}
          <div className="md:flex-1 px-4 flex">
            <div className="flex flex-col space-y-2 mr-4">
              {product.productImage.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Product Image ${index + 1}`}
                  className={`w-20 h-20 object-cover cursor-pointer rounded ${
                    selectedImage === image ? 'border-2 border-gray-900' : 'border'
                  }`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>

            <div className="h-[460px] w-[460px] rounded-lg bg-gray-300 relative group overflow-hidden">
              <img
                className="w-full h-full object-cover transform group-hover:scale-150 transition-transform duration-500 ease-in-out"
                src={selectedImage || '/placeholder.svg?height=460&width=460'}
                alt="Selected Product"
              />
            </div>
          </div>

          {/* Right Section: Product Info */}
          <div className="md:flex-1 px-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">{product.title}</h2>
              <button
                onClick={toggleLike}
                className={`p-2 rounded-full ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-pink-200 text-gray-600'
                } hover:bg-red-600 hover:text-white transition-colors duration-300`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex mb-4">
              <div className="flex items-center">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
                <Star className="w-4 h-4 text-gray-400 fill-current" />
              </div>
              <span className="text-gray-600 ml-2">4.4 (109 reviews)</span>
            </div>

            <div className="flex items-center mb-4">
              <span className="font-bold text-3xl">₹{product.price}</span>
              <span className="ml-3 text-3xl">
                <del>₹700</del>
              </span>
              <span className="text-gray-600 ml-2">
                {product.stock ? 'In stock' : 'Out of stock'}
              </span>
            </div>

            <div className="mb-4">
              <span className="font-bold text-gray-700">Select Quantity:</span>
              <div className="flex items-center mt-2">
                <button
                  className="bg-pink-100 py-2 px-4 rounded-lg text-gray-800 hover:bg-pink-200"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  className="mx-2 border text-center w-12"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
                <button
                  className="bg-pink-100 py-2 px-4 rounded-lg text-gray-800 hover:bg-pink-200"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-700">Product Description:</span>
              <p className="text-gray-600 text-sm mt-2">
                {product.description || 'No description available.'}
              </p>
            </div>
            {/* Highlights Dropdown */}
            <div className="mt-6">
  <button
    className="flex justify-between items-center w-full py-4 px-6 bg-pink-100 rounded-lg hover:bg-pink-200"
    onClick={() => toggleDropdown('highlights')}
  >
    <span className="text-lg font-semibold">Highlights</span>
    {showHighlights ? <ChevronUp /> : <ChevronDown />}
  </button>
  {showHighlights && product.highlights ? (
    <p className="mt-2 px-6 text-gray-700">{product.highlights}</p>
  ) : (
    showHighlights && <p className="px-6 text-gray-700">No highlights available.</p>
  )}
</div>


<div className="mt-6">
  <button
    className="flex justify-between items-center w-full py-4 px-6 bg-pink-100 rounded-lg hover:bg-pink-200"
    onClick={() => toggleDropdown('specifications')}
  >
    <span className="text-lg font-semibold">Specifications</span>
    {showSpecifications ? <ChevronUp /> : <ChevronDown />}
  </button>
  {showSpecifications && product.specifications ? (
    <p className="mt-2 px-6 text-gray-700">{product.specifications}</p>
  ) : (
    showSpecifications && <p className="px-6 text-gray-700">No specifications available.</p>
  )}
</div>


          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-4">Related Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <img
                    src={product.productImage[0]}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded"
                  />
                  <h4 className="text-lg font-semibold mt-2">{product.title}</h4>
                  <p className="text-gray-600">₹{product.price}</p>
                  <button
                    className="mt-4 bg-pink-400 text-white py-2 px-4 rounded-full font-bold hover:bg-pink-800 w-full"
                    onClick={() => navigate(`/productdetails/${product._id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review._id} className="border rounded-lg p-4 shadow-md">
                  <div className="flex items-center mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gray-400 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-semibold">{review.name}</h4>
                  <p className="text-gray-600">{review.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;
