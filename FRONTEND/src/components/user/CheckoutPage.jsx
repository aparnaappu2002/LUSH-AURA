import React, { useState, useCallback, useEffect } from "react";
import {
  PlusIcon,
  XIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  CheckCircleIcon,
  CopyIcon,
} from "lucide-react";
import axios from "../../axios/userAxios";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../shared/Navbar";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showCouponAnimation, setShowCouponAnimation] = useState(false);
  const [productOffers, setProductOffers] = useState({});
  const [shippingCharge, setShippingCharge] = useState(50); // Example flat rate shipping charge
  const [isCODAllowed, setIsCODAllowed] = useState(true);


  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const userId = user.id || user._id;

  const [formData, setFormData] = useState({
    address: '',
    street: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    phone: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'address':
        return value.length < 5 ? 'Address must be at least 5 characters long' : '';
      case 'street':
        return value.length < 3 ? 'Street must be at least 3 characters long' : '';
      case 'city':
        return !/^[a-zA-Z\s]{2,}$/.test(value) ? 'City must contain only letters and spaces' : '';
      case 'state':
        return !/^[a-zA-Z\s]{2,}$/.test(value) ? 'State must contain only letters and spaces' : '';
      case 'country':
        return !/^[a-zA-Z\s]{2,}$/.test(value) ? 'Country must contain only letters and spaces' : '';
      case 'pincode':
        return !/^\d{6}$/.test(value) ? 'Pincode must be exactly 6 digits' : '';
      case 'phone':
        return !/^[6-9]\d{9}$/.test(value) ? 'Please enter a valid 10-digit Indian mobile number' : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  

  const fetchOrderHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await axios.get(`/orders/${userId}`);
      //console.log("Received data:", data);
      setIsFirstOrder(data.length === 0);
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast.error("Failed to fetch order history. Please try again.");
      setIsFirstOrder(true);
    }
  }, [userId]);

  const fetchAddresses = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/showAddress/${userId}`);
        setAddresses(data.addresses || []);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        //toast.error("Failed to fetch addresses. Please try again.");
      }
    }
  }, [userId]);

  const fetchCartItems = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/cart/${userId}`);
        if (data.cart && Array.isArray(data.cart.items)) {
          const updatedItems = data.cart.items.map((item) => {
            const price = item.variance?.price || item.price || 0; // Default to 0 if undefined
            const subtotal = price * (item.quantity || 0); // Default quantity to 0 if undefined

            return {
              ...item,
              price,
              subtotal,
            };
          });

          const totalPrice = updatedItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
          );

          setItems(updatedItems);
          setTotalItems(data.cart.totalItems || 0); // Default to 0 if undefined
          setTotalPrice(totalPrice);
          setIsCODAllowed(totalPrice <= 1000);

        } else {
          console.warn("Cart items are not in the expected format:", data.cart);
          setItems([]);
          setTotalItems(0);
          setTotalPrice(0);
          setIsCODAllowed(true);

        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Failed to fetch cart items. Please try again.");
        setItems([]);
        setTotalItems(0);
        setTotalPrice(0);
        setIsCODAllowed(true);

      }
    }
  }, [userId]);

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get("/coupons");
      //console.log("Fetched Coupons:", response.data);

      if (!Array.isArray(response.data)) {
        console.error("Unexpected coupons data structure:", response.data);
        toast.error("Failed to fetch coupons. Please try again.");
        return;
      }

      //console.log("Total Price:", totalPrice, "Is First Order:", isFirstOrder);

      const filteredCoupons = response.data.filter((coupon) => {
        const isEligible =
          totalPrice >= coupon.minPurchaseAmount &&
          (isFirstOrder || coupon.code !== "LUSHNEW");

        // console.log(
        //   `Coupon: ${coupon.code}, Min Purchase: ${coupon.minPurchaseAmount}, Eligible: ${isEligible}`
        // );

        return isEligible;
      });

      setAvailableCoupons(filteredCoupons);
      //console.log("Filtered Coupons:", filteredCoupons);
    } catch (error) {
      console.error("Error fetching available coupons:", error);
      toast.error("Failed to fetch available coupons. Please try again.");
    }
  };

  const fetchProductOffers = async (items) => {
    try {
      if (!items || items.length === 0) {
        console.log("No items to fetch offers for");
        return;
      }

      // Extract product data with proper variance handling
      const productData = items.map((item) => {
        const productId = item.productId?._id || item.productId;
        const categoryId = item.productId?.categoryId;

        // Find matching variance from product's variances array
        let variancePrice = null;
        if (item.productId?.variances && item.variance) {
          const matchingVariance = item.productId.variances.find(
            (v) =>
              v.color === item.variance.color && v.size === item.variance.size
          );
          variancePrice = matchingVariance?.price;
        }

        // Use product's base price if no variance price is found
        const basePrice = variancePrice || item.productId?.price || item.price;

        return {
          productId,
          categoryId,
          variance: {
            ...item.variance,
            price: variancePrice,
          },
          basePrice,
          variancePrice,
        };
      });

     // console.log("Product data for offer fetch:", productData);

      const productIds = productData.map((p) => p.productId).filter(Boolean);
      const queryString = productIds.join(",");

      const response = await axios.get(
        `/offers/products?productIds=${queryString}`
      );
      //console.log("Offer response:", response.data);

      if (response.data.success && response.data.productOffers) {
       // console.log("Setting product offers:", response.data.productOffers);
        setProductOffers(response.data.productOffers);

        // Update items with best offer prices
        const updatedItems = items.map((item) => {
          const productId = item.productId?._id || item.productId;

          // Find matching variance price
          let variancePrice = null;
          if (item.productId?.variances && item.variance) {
            const matchingVariance = item.productId.variances.find(
              (v) =>
                v.color === item.variance.color && v.size === item.variance.size
            );
            variancePrice = matchingVariance?.price;
          }

          // Use appropriate base price
          const basePrice =
            variancePrice || item.productId?.price || item.price;
          const offer = response.data.productOffers[productId];

          if (offer && !item.hasAppliedOffer) {
            const discountedPrice =
              basePrice * (1 - offer.discountPercentage / 100);

            // console.log("Applying best offer:", {
            //   productId,
            //   basePrice,
            //   variancePrice,
            //   discountedPrice,
            //   discountPercentage: offer.discountPercentage,
            //   offerName: offer.offerName,
            // });

            return {
              ...item,
              variance: {
                ...item.variance,
                price: variancePrice,
              },
              originalPrice: basePrice,
              price: discountedPrice,
              subtotal: discountedPrice * item.quantity,
              appliedOffer: {
                name: offer.offerName,
                percentage: offer.discountPercentage,
                type: offer.offerType,
              },
              hasAppliedOffer: true,
            };
          }

          // If no offer, preserve original prices
          if (!item.hasAppliedOffer) {
            return {
              ...item,
              variance: {
                ...item.variance,
                price: variancePrice,
              },
              originalPrice: basePrice,
              price: basePrice,
              subtotal: basePrice * item.quantity,
              hasAppliedOffer: true,
            };
          }

          return item;
        });

        const pricesChanged = updatedItems.some(
          (updatedItem, index) => updatedItem.price !== items[index].price
        );

        if (pricesChanged) {
          //console.log("Updating items with new prices:", updatedItems);
          setItems(updatedItems);

          // Recalculate total price with applied offers
          const newTotalPrice = updatedItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
          );
          //console.log("New total price with offers:", newTotalPrice);
          setTotalPrice(newTotalPrice);
        }
      }
    } catch (error) {
      console.error("Error fetching product offers:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Failed to fetch product offers");
    }
  };

  // Update the item display section in the render to show offer details
  const renderItemWithOffer = (item) => (
    <div className="flex justify-between items-start">
      <div className="flex-grow">
        <p className="text-sm text-gray-800 font-semibold">
          {item.productName}
        </p>
        <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
        {item.variance && (
          <p className="text-xs text-gray-600">
            {item.variance.size && `Size: ${item.variance.size}`}
            {item.variance.color && `, Color: ${item.variance.color}`}
          </p>
        )}
        {item.appliedOffer && (
          <p className="text-xs text-green-600">
            {item.appliedOffer.name} - {item.appliedOffer.percentage}% off
          </p>
        )}
      </div>
      <div className="text-right space-y-1">
        <div className="flex flex-col items-end">
          {item.variance ? (
            // Show variance price
            <>
              {item.variance.price ? (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{(item.variance.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-sm text-green-600">
                    Save ₹
                    {(
                      (item.variance.price - item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-base font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              )}
            </>
          ) : (
            // Show original price if no variance
            <>
              {item.originalPrice > item.price ? (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{(item.originalPrice * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-sm text-green-600">
                    Save ₹
                    {(
                      (item.originalPrice - item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-base font-medium text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Price per item: ₹{item.price.toFixed(2)}
        </div>
      </div>
    </div>
  );

  // Modify useEffect to only run when items change and don't have offers applied
  useEffect(() => {
    const needsOfferCheck = items.some((item) => !item.hasAppliedOffer);
    if (items.length > 0 && needsOfferCheck) {
      fetchProductOffers(items);
    }
  }, [items]);

  useEffect(() => {
    fetchAddresses();
    fetchCartItems();
    fetchAvailableCoupons();
    fetchOrderHistory();
  }, [fetchAddresses, fetchCartItems, fetchOrderHistory]);

  useEffect(() => {
    fetchAvailableCoupons();
  }, [isFirstOrder, totalPrice]);

  const handleAddressChange = (id) => setSelectedAddress(id);
  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    if (method === "Cash on Delivery" && !isCODAllowed) {
      toast.error("Cash on Delivery is not available for orders above ₹1000.");
      return;
    }
    setPaymentMethod(method);
  };

  const addNewAddress = async (newAddress) => {
    try {
      const response = await axios.post("/address", { ...newAddress, userId });
      setAddresses((prevAddresses) => [...prevAddresses, response.data]);
      setNewAddressModalOpen(false);
      fetchAddresses();
      toast.success("New address added successfully!");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add new address. Please try again.");
    }
  };

  const handleFailedPayment = async () => {
    await Promise.all(
      items.map((item) => removeFromCart(item.productId, item.variance))
    );
    setItems([]);
    setTotalItems(0);
    setTotalPrice(0);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  // ... (previous imports and code remain the same until handleOrderSubmit)

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedAddress || !paymentMethod) {
      toast.error("Please select an address and payment method.");
      return;
    }
  
    // Check if there are items in the cart
    if (!items.length) {
      toast.error("Your cart is empty. Please add items before placing an order.");
      return;
    }
  
    setIsLoading(true);
    const finalPrice = totalPrice + shippingCharge;
    try {
      const orderDetails = {
        userId,
        items,
        shippingAddress: selectedAddress,
        paymentMethod,
        totalItems,
        totalPrice:finalPrice,
        shippingCharge: 50,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: discountAmount
      };
  
      const response = await axios.post("/addOrder", orderDetails);
      const { order, razorpayOrder } = response.data;
      console.log(response.data)
  
      if (paymentMethod === "UPI" && razorpayOrder) {
        const razorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "LUSH AURA",
          description: "Order Payment",
          order_id: razorpayOrder.id,
          prefill: {
            name: user.name || "",
            email: user.email || "",
            contact: selectedAddress
              ? addresses.find((addr) => addr._id === selectedAddress)?.phone || ""
              : "",
          },
          handler: async (response) => {
            try {
              const paymentVerification = await axios.post("/verifypayment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
  
              if (paymentVerification.data.success) {
                // Only clear cart after successful payment verification
                await handleSuccessfulOrder();
              } else {
                throw new Error("Payment verification failed.");
              }
            } catch (error) {
              console.error("Payment verification failed:", error);
              await axios.post(`/failureorder/${order._id}`, {
                status: "Failed",
              });
              toast.error("Payment failed. Please try again.");
            }
          },
          theme: { color: "#EC4899" },
          modal: {
            ondismiss: async () => {
              await axios.post(`/failureorder/${order._id}`, {
                status: "Failed",
              });
              toast.error("Payment process was cancelled.");
              setIsLoading(false);
            },
          },
          retry: false,
        };
  
        const razorpay = new Razorpay(razorpayOptions);
        razorpay.open();
      } else if (paymentMethod === "Cash on Delivery") {
        // For COD, clear cart after order is confirmed
        await handleSuccessfulOrder();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to place the order. Please try again."
      );
      setIsLoading(false);
    }
  };
  
  

  // ... (rest of the component remains the same)

  const handleSuccessfulOrder = async () => {
    try {
      // Show success message first
      toast.success("Order placed successfully!");
  
      // Clear cart items only after successful order
      await Promise.all(
        items.map((item) => removeFromCart(item.productId, item.variance))
      );
  
      // Reset UI state
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode("");
  
      // Show order placed animation
      setOrderPlaced(true);
  
      // Set timer to hide animation
      setTimeout(() => {
        setOrderPlaced(false);
      }, 5000);
  
    } catch (error) {
      console.error("Error handling successful order:", error);
      toast.error("Order placed but there was an issue clearing your cart.");
    }
  };

  const removeFromCart = async (productId, variance) => {
    try {
      const payload = { userId, productId, variance };
      await axios.post(`/cartempty`, payload);
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  };

  const applyCoupon = () => {
    if (!couponCode) {
      toast.error("Please enter a valid coupon code.");
      return;
    }

    if (appliedCoupon) {
      toast.error("A coupon is already applied. Only one coupon can be used.");
      return;
    }

    const availableCoupon = availableCoupons.find(
      (coupon) => coupon.code === couponCode
    );

    if (!availableCoupon) {
      toast.error("Invalid coupon code. Please try again.");
      return;
    }

    let discountAmount = 0;
    if (availableCoupon.discountType === "fixed") {
      discountAmount = availableCoupon.discountValue;
    } else if (availableCoupon.discountType === "percentage") {
      discountAmount = (totalPrice * availableCoupon.discountValue) / 100;
    }

    const discountedPrice = Math.max(totalPrice - discountAmount, 0);

    setAppliedCoupon(availableCoupon);
    setTotalPrice(discountedPrice);
    setDiscountAmount(discountAmount);
    setShowCouponAnimation(true);

    setTimeout(() => {
      setShowCouponAnimation(false);
    }, 3000);

    toast.success(`Coupon "${couponCode}" applied successfully!`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success("Coupon code copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy coupon code. Please try again.");
      }
    );
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setTotalPrice(totalPrice + discountAmount);
    setDiscountAmount(0);
    setCouponCode("");
    toast.success("Coupon removed successfully!");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbar />
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
              {/* Address selection */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Select Delivery Address
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <motion.div
                      key={addr._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`border-2 ${
                        selectedAddress === addr._id
                          ? "border-pink-500 shadow-lg"
                          : "border-gray-200"
                      } rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-xl`}
                      onClick={() => handleAddressChange(addr._id)}
                    >
                      <div className="flex items-start">
                        <MapPinIcon className="h-6 w-6 text-pink-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {addr.addressLine}, {addr.city}, {addr.state},{" "}
                            {addr.pincode}, {addr.country}
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

              {/* Payment method selection */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                {["UPI",  "Cash on Delivery"].map((method) => (
        <motion.div
          key={method}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center p-3 border-2 rounded-lg mb-2 transition-all duration-300 hover:shadow-md ${
            method === "Cash on Delivery" && !isCODAllowed ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <input
            id={method}
            name="paymentMethod"
            type="radio"
            value={method}
            checked={paymentMethod === method}
            onChange={handlePaymentMethodChange}
            className="focus:ring-pink-500 h-5 w-5 text-pink-600"
            disabled={method === "Cash on Delivery" && !isCODAllowed}
          />
          <label
            htmlFor={method}
            className={`ml-3 text-lg ${
              method === "Cash on Delivery" && !isCODAllowed ? "text-gray-400" : "cursor-pointer"
            }`}
          >
            {method}
          </label>
        </motion.div>
      ))}
      {!isCODAllowed && (
        <p className="text-red-500 text-sm mt-2">
          Cash on Delivery is not available for orders above ₹1000.
        </p>
      )}

              </motion.div>

              {/* Order summary */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>

                <p className="text-xl text-gray-900 mb-2">
                  Total Items: <span className="font-bold">{totalItems}</span>
                </p>
                <p className="text-xl text-gray-900 mb-2">
                  Shipping Charge:{" "}
                  <span className="font-bold text-pink-600">
                    ₹{shippingCharge}
                  </span>
                </p>
                <p className="text-xl text-gray-900 mb-4">
                  Total Price:{" "}
                  <span className="font-bold text-pink-600">
                    ₹{totalPrice + shippingCharge}
                  </span>
                </p>

                <div className="mt-6 space-y-4">
                  {currentItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b py-2 transition-all duration-300 hover:bg-gray-100 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <p className="text-sm text-gray-800 font-semibold">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.variance?.size &&
                              `Size: ${item.variance.size}`}
                            {item.variance?.color &&
                              `, Color: ${item.variance.color}`}
                            {item.variance?.price &&
                              `, Price: ₹${item.variance.price.toFixed(2)}`}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex flex-col items-end">
                            {item.variance?.price ? (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹
                                  {(
                                    item.variance.price * item.quantity
                                  ).toFixed(2)}
                                </span>
                                <span className="text-base font-medium text-gray-900">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                                <span className="text-sm text-green-600">
                                  Save ₹
                                  {(
                                    (item.variance.price - item.price) *
                                    item.quantity
                                  ).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-medium text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Price per item: ₹{item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{(totalPrice + discountAmount).toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                      <span>Total Amount</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mr-2 px-3 py-1 bg-pink-500 text-white rounded-md disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <span className="mx-2 text-gray-700">
                    Page {currentPage} of{" "}
                    {Math.ceil(items.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(items.length / itemsPerPage)
                    }
                    className="ml-2 px-3 py-1 bg-pink-500 text-white rounded-md disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>

              {/* Coupon section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-8 bg-gray-50 p-6 rounded-lg shadow-inner relative overflow-hidden"
              >
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Apply Coupon
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors duration-300"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Coupon applied: {appliedCoupon.code}
                      </p>
                      <p className="text-sm">
                        Discount: ₹{discountAmount.toFixed(2)}
                      </p>
                    </div>
                    {/* <button
                      onClick={() => copyToClipboard(appliedCoupon.code)}
                      className="text-green-600 hover:text-green-800 transition-colors duration-300"
                    >
                      <CopyIcon className="h-5 w-5" />
                    </button> */}
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 transition-colors duration-300"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <AnimatePresence>
                  {showCouponAnimation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-pink-100 bg-opacity-90 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <h3 className="text-3xl font-bold text-pink-600 mb-2">
                          Coupon Applied!
                        </h3>
                        <p className="text-xl text-pink-800">
                          You saved ₹{discountAmount.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Available Coupons:
                </h4>
                <div className="space-y-2">
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="bg-white p-2 rounded-md shadow flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{coupon.code}</p>
                        <p className="text-sm text-gray-600">
                          {coupon.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
                      >
                        <CopyIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Place order button */}
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
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </motion.button>
              </motion.div>
            </form>

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
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                        }}
                        className="mb-4 relative"
                      >
                        <div className="absolute inset-0 bg-green-200 rounded-full animate-ping"></div>
                        <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500 relative z-10" />
                      </motion.div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Order Placed Successfully!
                      </h3>
                      <p className="text-xl text-gray-600 mb-6">
                        Thank you for your purchase.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors duration-300"
                          onClick={() => {
                            setTimeout(() => {
                              navigate(`/orderlist`);
                            }, 500);
                          }}
                        >
                          Track Order
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition-colors duration-300"
                          onClick={() => {
                            setTimeout(() => {
                              navigate(`/shop`);
                            }, 500);
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
      </motion.div>

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            
            // Validate all fields
            const newErrors = {};
            Object.keys(formData).forEach(field => {
              const error = validateField(field, formData[field]);
              if (error) newErrors[field] = error;
            });

            if (Object.keys(newErrors).length > 0) {
              setFormErrors(newErrors);
              toast.error('Please fix the errors in the form');
              return;
            }

            addNewAddress(formData);
            setNewAddressModalOpen(false);
            // Reset form data and errors
            setFormData({
              address: '',
              street: '',
              city: '',
              state: '',
              country: '',
              pincode: '',
              phone: ''
            });
            setFormErrors({});
          }}
        >
          {[
            { name: 'address', label: 'Address Line' },
            { name: 'street', label: 'Street' },
            { name: 'city', label: 'City' },
            { name: 'state', label: 'State' },
            { name: 'country', label: 'Country' },
            { name: 'pincode', label: 'Pincode' },
            { name: 'phone', label: 'Phone Number' }
          ].map(({ name, label }) => (
            <div key={name} className="mb-4">
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {label}
              </label>
              <input
                type="text"
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className={`mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  formErrors[name] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors[name] && (
                <p className="mt-1 text-sm text-red-500">{formErrors[name]}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <motion.button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
              onClick={() => {
                setNewAddressModalOpen(false);
                setFormData({
                  address: '',
                  street: '',
                  city: '',
                  state: '',
                  country: '',
                  pincode: '',
                  phone: ''
                });
                setFormErrors({});
              }}
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
      <Toaster position="top-right" />
    </>
  );
};

export default Checkout;
