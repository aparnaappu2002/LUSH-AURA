import React, { useState, useEffect } from "react";
import { Star, Heart, ChevronDown, ChevronUp, X } from 'lucide-react';
import axios from "../../axios/userAxios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../shared/Navbar";
import Breadcrumb from "../shared/BreadCrumbs";
import {toast,Toaster} from "react-hot-toast";

const ProductDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariance, setSelectedVariance] = useState(null); // New state to store the selected variance
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  const { id: productId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  console.log("User:",user)
  const userId= user.id || user._id

  const calculateDiscount = () => {
    const basePrice = selectedVariance ? selectedVariance.price : product.price;
    let maxDiscount = 0;
  
    if (product.bestOffer) {
      maxDiscount = product.bestOffer.discountPercentage;
    }
  
    const discountAmount = (basePrice * maxDiscount) / 100;
    const newDiscountedPrice = basePrice - discountAmount;
    console.log("Discount:", newDiscountedPrice);
  
    setDiscountedPrice(newDiscountedPrice);
    setDiscount(maxDiscount);
  };

  useEffect(() => {
    fetchProductDetails();
    fetchRelatedProducts();
    fetchProductReviews();
  }, [productId]);

  useEffect(() => {
    if (product && selectedVariance) {
      console.log('Product data:', {
        basePrice: selectedVariance ? selectedVariance.price : product.price,
        offer: product.offer,
        category: product.category
      });
      calculateDiscount();
    }
  }, [product, selectedVariance, calculateDiscount]);
  
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/productdetails/${productId}`);
      console.log("Product details fetched:", response);

      if (response.status === 200 && response.data) {
        // Set the entire product data
        setProduct(response.data);

        // Set the first product image (ensure it is not empty)
        setSelectedImage(response.data.productImage?.[0] || ''); 

        // Set the default size, color, and variance based on the fetched data
        if (response.data.variances && response.data.variances.length > 0) {
          const defaultVariance = response.data.variances[0];
          setSelectedSize(defaultVariance.size || 'Default Size');
          setSelectedColor(defaultVariance.color || 'Default Color');
          setSelectedVariance(defaultVariance);
        }
      } else {
        console.warn('Unexpected response structure:', response);
      }
    } catch (error) {
      // Handle errors (network issues, server errors, etc.)
      if (error.response) {
        console.error("Server responded with an error:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    }
};

  
  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`/relatedproducts/${productId}`);
      if (response.status === 200 && response.data) {
        const activeProducts = response.data.filter(product => product.status === 'active');
        setRelatedProducts(activeProducts);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // Dummy reviews for the product
  const fetchProductReviews = () => {
    const dummyReviews = [
      {
        _id: "1",
        name: "John Doe",
        comment: "Great product! Really loved it, totally worth the price.",
        rating: 5,
      },
      {
        _id: "2",
        name: "Jane Smith",
        comment:
          "Good quality, but the size was a bit off. Still satisfied with the purchase.",
        rating: 4,
      },
      {
        _id: "3",
        name: "Michael Johnson",
        comment:
          "Not what I expected. The material isn’t as described. Would not recommend.",
        rating: 2,
      },
      {
        _id: "4",
        name: "Sarah Lee",
        comment:
          "Excellent product! Fast delivery and high quality. Would definitely buy again!",
        rating: 5,
      },
    ];
    setReviews(dummyReviews);
  };

  

  const toggleLike = async () => {
    try {
      // Fetch the user's wishlist
      const response = await axios.get(`/wishlist/${userId}`);
      console.log("Response:", response);
  
      if (response.status === 200) {
        const wishlist = response.data; // Access the 'data' key in the response
        console.log("Wishlist:", wishlist);
  
        // Check if wishlist exists and has items
        if (wishlist.data && Array.isArray(wishlist.data) && wishlist.data.length > 0) {
          // Loop through the items to check if the product is already in the wishlist
          const isAlreadyInWishlist = wishlist.data.some((item) => item.productId._id === product._id);
  
          if (isAlreadyInWishlist) {
            // Product is already in the wishlist, show an alert or message
            toast.error("Product is already in your wishlist.");
            return; // Prevent adding the product again
          }
        }
      } else {
        console.log("No wishlist found for the user. Proceeding to add the product.");
      }
  
      // Add the product to the wishlist
      const wishlistPayload = {
        userId: userId,
        productId: product._id,
        productName: product.title,
        price: selectedVariance ? selectedVariance.price : product.price,
        image: selectedVariance?.varianceImage?.[0] || product.productImage?.[0] || "",
        variance: selectedVariance
          ? {
              size: selectedVariance.size || undefined,
              color: selectedVariance.color || undefined,
            }
          : null,
      };
  
      console.log("Wishlist data:", wishlistPayload);
  
      const addResponse = await axios.post("/wishlistadd", wishlistPayload);
      if (addResponse.status === 200) {
        toast.success("Product added to your wishlist.");
        setIsLiked(true);
      }
    } catch (error) {
      // Handle cases where no wishlist exists or any other errors
      if (error.response && error.response.status === 404) {
        console.log("No wishlist exists for the user. Proceeding to create a new one.");
        const wishlistPayload = {
          userId: userId,
          productId: product._id,
          productName: product.title,
          price: selectedVariance ? selectedVariance.price : product.price,
          image: selectedVariance?.varianceImage?.[0] || product.productImage?.[0] || "",
          variance: selectedVariance
            ? {
                size: selectedVariance.size || undefined,
                color: selectedVariance.color || undefined,
              }
            : null,
        };
  
        console.log("Wishlist data (new):", wishlistPayload);
  
        const addResponse = await axios.post("/wishlistadd", wishlistPayload);
        if (addResponse.status === 200) {
          toast.success("Product added to your wishlist.");
          setIsLiked(true);
        }
      } else {
        console.error("Error managing wishlist:", error);
        toast.error("An error occurred while managing your wishlist. Please try again.");
      }
    }
  };
  
  
  

  const toggleDropdown = (type) => {
    if (type === "highlights") {
      setShowHighlights(!showHighlights);
    } else {
      setShowSpecifications(!showSpecifications);
    }
  };

  // First, modify the handleSizeChange function
  const handleSizeChange = (size) => {
    const availableVariances = product.variances.filter(
      (variance) => variance.size === size
    );
  
    if (availableVariances.length > 0) {
      setSelectedSize(size);
      
      if (selectedColor) {
        const matchingVariance = availableVariances.find(
          (variance) => variance.color.toLowerCase() === selectedColor.toLowerCase()
        );
        
        if (matchingVariance) {
          setSelectedVariance(matchingVariance);
          setCurrentImages(matchingVariance.varianceImage);
          setSelectedImage(matchingVariance.varianceImage[0]);
        } else {
          setSelectedColor(availableVariances[0].color);
          setSelectedVariance(availableVariances[0]);
          setCurrentImages(availableVariances[0].varianceImage);
          setSelectedImage(availableVariances[0].varianceImage[0]);
        }
      } else {
        setSelectedColor(availableVariances[0].color);
        setSelectedVariance(availableVariances[0]);
        setCurrentImages(availableVariances[0].varianceImage);
        setSelectedImage(availableVariances[0].varianceImage[0]);
      }
    }
  };
  
  // Modify the handleColorChange function
  const handleColorChange = (color) => {
    const availableVariances = product.variances.filter(
      (variance) => variance.color.toLowerCase() === color.toLowerCase()
    );
  
    if (availableVariances.length > 0) {
      setSelectedColor(color);
      
      if (selectedSize) {
        const matchingVariance = availableVariances.find(
          (variance) => variance.size === selectedSize
        );
        
        if (matchingVariance) {
          setSelectedVariance(matchingVariance);
          setCurrentImages(matchingVariance.varianceImage);
          setSelectedImage(matchingVariance.varianceImage[0]);
        } else {
          setSelectedSize(availableVariances[0].size);
          setSelectedVariance(availableVariances[0]);
          setCurrentImages(availableVariances[0].varianceImage);
          setSelectedImage(availableVariances[0].varianceImage[0]);
        }
      } else {
        setSelectedSize(availableVariances[0].size);
        setSelectedVariance(availableVariances[0]);
        setCurrentImages(availableVariances[0].varianceImage);
        setSelectedImage(availableVariances[0].varianceImage[0]);
      }
    }
  };
  
  // Update the initial setup in useEffect
  useEffect(() => {
    if (product && product.variances && product.variances.length > 0) {
      const defaultVariance = product.variances[0];
      setSelectedSize(defaultVariance.size);
      setSelectedColor(defaultVariance.color);
      setSelectedVariance(defaultVariance);
      setCurrentImages(defaultVariance.varianceImage);
      setSelectedImage(defaultVariance.varianceImage[0]);
    } else {
      // Fallback to main product images if no variances
      setCurrentImages(product?.productImage || []);
      setSelectedImage(product?.productImage?.[0] || "/placeholder.svg");
    }
  }, [product]);
  
  

  // Function to update selected variance based on size and color
  const updateSelectedVariance = (size, color) => {
    const selected = product?.variances?.find(
      (variance) => variance.size === size && variance.color.toLowerCase() === color.toLowerCase()
    );
  
    if (selected) {
      setSelectedVariance(selected);
  
      // Update the gallery and main image
      const images = selected.varianceImage || [];
      setSelectedImage(images[0] || "/placeholder.svg");
      setProduct((prevProduct) => ({
        ...prevProduct,
        productImage: images.length > 0 ? images : prevProduct.productImage,
      }));
    } else {
      // Handle case where no variance matches (optional)
      setSelectedVariance(null);
      setSelectedImage("/placeholder.svg");
    }
  };
  

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);

    if (!selectedVariance || selectedVariance.quantity === 0) {
      toast.error("This product is out of stock.");
      setQuantity(0);
      return;
    }
  
  
    if (newQuantity > 5) {
      toast("You can only add up to 5 of this product to your cart.", { icon: '⚠️' });

      setQuantity(5);
    } else if (newQuantity > selectedVariance.quantity) {
      toast(`Only ${selectedVariance.quantity} items are available in stock.`, { icon: '⚠️' });

      setQuantity(selectedVariance.quantity);
    } else if (newQuantity < 1) {
      setQuantity(1); // Minimum quantity is 1
    } else {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (quantity > 5) {
      toast("You can only add up to 5 of this product to your cart.", { icon: '⚠️' });

      setQuantity(5);
      return;
    }
  
    if (user) {
      addToCart();
    } else {
      setShowLoginModal(true);
    }
  };
  
  const addToCart = async () => {
    try {
      if (!selectedVariance) {
        toast.error("Please select a valid size and color.");
        return;
      }
  
      const availableQuantity = selectedVariance.quantity;
  
      if (quantity > availableQuantity) {
        toast(`Only ${availableQuantity} items are available in stock.`, { icon: '⚠️' });
        setQuantity(availableQuantity);
        return;
      }
  
      if (quantity > 5) {
        toast("You can only add up to 5 of this product to your cart.", { icon: '⚠️' });
        setQuantity(5);
        return;
      }
  
      // Calculate the offer price
      const basePrice = selectedVariance ? selectedVariance.price : product.price;
      const maxDiscount = product.bestOffer ? product.bestOffer.discountPercentage : 0;
      const discountAmount = (basePrice * maxDiscount) / 100;
      const offerPrice = basePrice - discountAmount;
  
      const payload = {
        userId: user.id || user._id,
        productId: product._id,
        productName: product.title,
        availableQuantity,
        variance: {
          size: selectedVariance.size,
          color: selectedVariance.color,
          image: selectedVariance.varianceImage[0],
        },
        quantity,
        image: selectedVariance.varianceImage[0],
        price: basePrice,  // Original price
        offerPrice,        // Discounted price to be added to the cart
      };
  
      console.log("Payload sent to /cartadd:", payload);
  
      const response = await axios.post("/cartadd", payload);
  
      if (response.status === 200) {
        console.log("Product added to cart successfully:", response.data);
        toast.success("Product added to cart!");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart. Please try again.");
    }
  };
  

  

  const navigateToLogin = () => {
    navigate("/login");
    setShowLoginModal(false);
  };

  const closeModal = () => {
    setShowLoginModal(false);
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  
  



  return (
    <>
      <Navbar />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row -mx-4">
          {/* Left Section: Image Gallery */}
          <div className="md:flex-1 px-4 flex">
  <div className="flex flex-col space-y-2 mr-4">
    {currentImages.map((image, index) => (
      <img
        key={index}
        src={image}
        alt={`Product Image ${index + 1}`}
        className={`w-20 h-20 object-cover cursor-pointer rounded ${
          selectedImage === image ? "border-2 border-gray-900" : "border"
        }`}
        onClick={() => setSelectedImage(image)}
      />
    ))}
  </div>

  <div className="h-[460px] w-[460px] rounded-lg bg-gray-300 relative group overflow-hidden">
    <img
      className="w-full h-full object-cover transform group-hover:scale-150 transition-transform duration-500 ease-in-out"
      src={selectedImage || "/placeholder.svg"}
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
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-pink-200 text-gray-600"
                } hover:bg-red-600 hover:text-white transition-colors duration-300`}
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="flex mb-4">
              <div className="flex items-center">
                {[...Array(4)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-current"
                  />
                ))}
                <Star className="w-4 h-4 text-gray-400 fill-current" />
              </div>
              <span className="text-gray-600 ml-2">4.4 (109 reviews)</span>
            </div>

            <div className="flex items-center mb-4">
              <span className="font-bold text-3xl text-green-600">
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span className="ml-3 text-2xl text-gray-500 line-through">
                ₹{selectedVariance ? selectedVariance.price : product.price}
              </span>
              {discount > 0 && (
                <span className="ml-3 text-lg text-red-500 font-semibold">
                  {discount}% OFF
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {discount > 0 && (
                <p>
                  You save: ₹
                  {(
                    (selectedVariance ? selectedVariance.price : product.price) -
                    discountedPrice
                  ).toFixed(2)}
                </p>
              )}
              <p>
                {selectedVariance && selectedVariance.quantity > 0
                  ? `In stock (${selectedVariance.quantity} available)`
                  : "Out of stock"}
              </p>
            </div>


            {product.variances && product.variances.length > 0 && (
              <div className="mb-4">
              
                {product.variances.some((variance) => variance.size) && (
                  <div>
                    <span className="font-bold text-gray-700">
                      Select Size:
                    </span>
                    <div className="flex items-center mt-2">
                      {product.variances.map(
                        (variance) =>
                          variance.size && (
                            <button
                              key={variance.size}
                              className={`mr-2 px-4 py-2 rounded-lg ${
                                selectedSize === variance.size
                                  ? "bg-pink-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              } hover:bg-pink-400 hover:text-white transition-colors duration-300`}
                              onClick={() => handleSizeChange(variance.size)}
                            >
                              {variance.size} ml
                            </button>
                          )
                      )}
                    </div>
                  </div>
                )}

               
                {product.variances.some((variance) => variance.color) && (
                  <div className="mt-4">
                    <span className="font-bold text-gray-700">
                      Select Color:
                    </span>
                    <div className="flex items-center mt-2">
                      {product.variances
                        .filter(
                          (value, index, self) =>
                           
                            index ===
                            self.findIndex(
                              (t) =>
                                t.color?.toLowerCase() ===
                                value.color?.toLowerCase()
                            )
                        )
                        .map(
                          (variance) =>
                            variance.color && (
                              <button
                                key={variance.color}
                                className={`mr-2 w-10 h-10 rounded-full border-2 ${
                                  selectedColor === variance.color
                                    ? "border-gray-900"
                                    : "border-gray-300"
                                }`}
                                style={{
                                  backgroundColor: variance.color.toLowerCase(),
                                }}
                                
                                onClick={() =>
                                  handleColorChange(variance.color)
                                }
                              />
                            )
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              <span className="font-bold text-gray-700">
                Product Description:
              </span>
              <p className="text-gray-600 text-sm mt-2">
                {product.description || "No description available."}
              </p>
            </div>
            {/* Highlights Dropdown */}
            <div className="mt-6">
              <button
                className="flex justify-between items-center w-full py-4 px-6 bg-pink-100 rounded-lg hover:bg-pink-200"
                onClick={() => toggleDropdown("highlights")}
              >
                <span className="text-lg font-semibold">Highlights</span>
                {showHighlights ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showHighlights && product.highlights ? (
                <p className="mt-2 px-6 text-gray-700">{product.highlights}</p>
              ) : (
                showHighlights && (
                  <p className="px-6 text-gray-700">No highlights available.</p>
                )
              )}
            </div>

            <div className="mt-6">
              <button
                className="flex justify-between items-center w-full py-4 px-6 bg-pink-100 rounded-lg hover:bg-pink-200"
                onClick={() => toggleDropdown("specifications")}
              >
                <span className="text-lg font-semibold">Specifications</span>
                {showSpecifications ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showSpecifications && product.specifications ? (
                <p className="mt-2 px-6 text-gray-700">
                  {product.specifications}
                </p>
              ) : (
                showSpecifications && (
                  <p className="px-6 text-gray-700">
                    No specifications available.
                  </p>
                )
              )}
            </div>
            <button
              className="mt-6 w-full bg-pink-400 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Related Products */}
       {/* Related Products */}
       {relatedProducts.length > 0 && (
  <div className="mt-16">
    <h3 className="text-xl font-bold mb-4">Related Products</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {relatedProducts.map((product) => (
        product.status === 'active' && (
          <div
            key={product._id}
            className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <div className="flex-grow">
              <img
                src={product.productImage[0]}
                alt={product.title}
                className="w-full h-40 object-cover rounded"
              />
              <h4 className="text-lg font-semibold mt-2 line-clamp-2">
                {product.title}
              </h4>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-pink-400 text-white py-2 px-4 rounded-full font-bold hover:bg-pink-600 transition-colors duration-300"
                onClick={() => {
                  // First navigate to the new product
                  navigate(`/productdetails/${product._id}`);
                  // Then fetch the new product details
                  fetchProductDetails();
                  fetchRelatedProducts();
                  // Scroll to top for better UX
                  window.scrollTo(0, 0);
                }}
              >
                View Details
              </button>
            </div>
          </div>
        )
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
                <li
                  key={review._id}
                  className="border rounded-lg p-4 shadow-md"
                >
                  <div className="flex items-center mb-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-500 fill-current"
                      />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-gray-400 fill-current"
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold">{review.name}</h4>
                  <p className="text-gray-600">{review.comment}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl relative max-w-md w-full">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="mb-6">Please log in to add items to your cart.</p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors duration-200"
                  onClick={navigateToLogin}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </>
  );

};

export default ProductDetails;

