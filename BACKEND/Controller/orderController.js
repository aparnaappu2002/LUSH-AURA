const mongoose = require("mongoose");
const Order = require('../Models/orderSchema')
const Cart = require('../Models/cartSchema')
const Product = require('../Models/productSchema')
const Address = require('../Models/addressSchema')
const Razorpay = require('razorpay')
const crypto = require('crypto');
const Wallet = require("../Models/walletSchema")
const path = require('path');
const fs = require('fs');

const Offer = require("../Models/offerSchema")
const Category = require('../Models/categorySchema');






const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Read key ID from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Read key secret from .env
});


const addOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalItems, totalPrice,shippingCharge  } = req.body;

    // Validate input
    if (!userId || !items || !shippingAddress || !paymentMethod || !totalItems || !totalPrice) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the provided shipping address exists
    const address = await Address.findById(shippingAddress);
    if (!address) {
      return res.status(404).json({ message: "Shipping address not found." });
    }

    const updatedProducts = [];
    

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.variance) {
        return res.status(400).json({ message: "Invalid item details." });
      }

    

      const product = await Product.findById(item.productId).populate('categoryId');
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }

      if (product.status !== 'active') {
        throw new Error(`Product ${product.title} is not available for order.`);
      }



      const selectedVariance = product.variances.find(
        (v) => (item.variance.size ? v.size === item.variance.size : true) &&
               (item.variance.color ? v.color === item.variance.color : true)
      );
      
      console.log("variance:",selectedVariance)

      if (!selectedVariance || selectedVariance.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productName}.`);
      }

      // Reduce stock
      selectedVariance.quantity -= item.quantity;
      product.salesCount += item.quantity;

      if (product.categoryId) {
        product.categoryId.salesCount += item.quantity;
        await product.categoryId.save();
      }

      updatedProducts.push({
        product,
        size: item.variance.size,
        color: item.variance.color,
        quantity: item.quantity,
      });

      await product.save();
    }

    const finalPrice = totalPrice + shippingCharge;

    // Create the order
    const newOrder = new Order({
      userId,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "UPI" ? "Completed" : "Pending",
      orderStatus: paymentMethod === "UPI" ? "Placed" : "Processing",
      totalItems,
      totalPrice:finalPrice,
      shippingCharge,
    });

    let razorpayOrder = null;

    if (paymentMethod === "UPI") {
      // Create a Razorpay order
      razorpayOrder = await razorpay.orders.create({
        amount: finalPrice * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${newOrder._id}`,
        payment_capture: 1,
      });

      // Attach the Razorpay order ID to the new order
      newOrder.razorpayId = razorpayOrder.id;
    }
    console.log('Saving order:', newOrder);

    const savedOrder = await newOrder.save();

    console.log('Order saved successfully:', savedOrder);


    // Remove items from the cart
    const userCart = await Cart.findOne({ userId });
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for the user." });
    }

    const remainingCartItems = userCart.items.filter((cartItem) => {
      const isItemInOrder = items.some(
        (orderItem) =>
          orderItem.productId === cartItem.productId &&
          orderItem.variance.size === cartItem.variance.size &&
          orderItem.variance.color === cartItem.variance.color
      );
      return !isItemInOrder; // Keep items that are not part of the order
    });

    userCart.items = remainingCartItems;
    await userCart.save();

    return res.status(201).json({
      message: "Order placed successfully.",
      order: savedOrder,
      razorpayOrder: razorpayOrder || null,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
};

  
  const getOrders = async (req, res) => {
    try {
      const orders = await Order.find().populate('userId shippingAddress');
      if (!orders || orders.length === 0) {
        return res.status(200).json([]); // Return empty array instead of error
      }
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Error fetching orders", error: err });
    }
  }
  
  const editOrders = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { orderStatus, paymentStatus } = req.body;
  
      // Fetch the order to check its current status
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // If we are updating the paymentStatus, check if orderStatus is 'delivered'
      if (paymentStatus && paymentStatus === 'completed' && order.orderStatus !== 'delivered') {
        return res.status(400).json({ message: "Payment can only be completed if the order is delivered." });
      }
  
      // Prepare fields to update
      const updateFields = {};
      if (orderStatus) updateFields.orderStatus = orderStatus;
      if (paymentStatus) updateFields.paymentStatus = paymentStatus;
  
      // Update the order status or payment status
      const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });
  
      console.log("Updated Order:", updatedOrder);
      res.json(updatedOrder);
    } catch (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ message: "Error updating order status", error: err });
    }
  };
  

  const getUserOrder = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from request parameters

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        // Query the database for orders
        const orders = await Order.find({ userId: userId })
            .populate("shippingAddress") // Populate shipping address details
            .populate("items.productId", "productName price"); // Populate product details in items

        // Handle case where no orders are found
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        // Send response with the found orders
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders", error });
    }
};



// Cancel Order Endpoin

const cancelOrder = async (req, res) => {
  const { productId } = req.body;
  const { orderId } = req.params;
  console.log("Body:", req.body);

  if (!orderId || !productId) {
    return res.status(400).json({ message: "Order ID and Product ID are required." });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    

    // Convert productId to ObjectId safely
    let productIdObj;
    try {
      productIdObj = new mongoose.Types.ObjectId(productId._id);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Product ID format." });
    }

    console.log("ProductId:", productIdObj);

    // Find the item index
    const itemIndex = order.items.findIndex(item => {
      console.log("Checking item:", item.productId.toString(), "against", productIdObj.toString());
      return item.productId && item.productId.equals(productIdObj);
    });
    console.log("Item Index:", itemIndex);
    
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in the order." });
    }

    const cancelledItem = order.items[itemIndex];
    console.log("Cancel",cancelledItem)
    const refundAmount = cancelledItem.subtotal;

    // Handle refund to wallet if payment is completed
    if (order.paymentStatus === 'Completed') {
      let wallet = await Wallet.findOne({ userId: order.userId });
      if (!wallet) {
        wallet = new Wallet({
          userId: order.userId,
          balance: 0,
          transactions: []
        });
      }


      wallet.balance += refundAmount;
      wallet.transactions.push({
        transactionType: "Credit",
        amount: refundAmount,
        description: `Refund for canceled product ${cancelledItem.productName}`,
        orderId: orderId
      });

      await wallet.save();
    }

    // Fetch the product and update the variance quantity
    const product = await Product.findById(productIdObj);  // Changed Product to Products
    console.log("Product found:", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found in database." });
    }

    // Find the matching variance using the order item's variance details
    const variance = product.variances.find(v =>
      (!v.size || v.size === cancelledItem.variance.size) && 
      (!v.color || v.color === cancelledItem.variance.color)
    );

    if (!variance) {
      return res.status(404).json({ message: "Matching variance not found for the product." });
    }

    // Update variance quantity
    variance.quantity += cancelledItem.quantity;
    
    // Update product's availableQuantity
    product.availableQuantity += cancelledItem.quantity;

    // Update product status if necessary
    if (product.availableQuantity > 0) {
      product.stock = "In Stock";
    }

    await product.save();

    // Update the cancelled item's status
    order.items[itemIndex].productStatus = "Cancelled";
    
    // Recalculate total price
    order.totalPrice -= refundAmount;

    if (order.items.every(item => item.productStatus === "Cancelled")) {
      order.orderStatus = "Cancelled";
    }

    await order.save();

    res.status(200).json({ 
      message: "Product canceled successfully, order updated, and inventory restored.",
      updatedOrder: order
    });

  } catch (error) {
    console.error("Error cancelling product:", error);
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};






const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason, userId, variance } = req.body;
  console.log("Params:", req.params);
  console.log("body:", req.body);

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if the user owns the order
    if (order.userId.toString() !== req.body.userId) {
      return res.status(403).json({ message: 'Unauthorized action on this order.' });
    }

    const currentDate = new Date();
    const orderDate = new Date(order.orderDate);
    const diffTime = Math.abs(currentDate - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

    if (diffDays > 7) {
      return res.status(400).json({ message: 'Return request can only be made within 7 days of order delivery.' });
    }


    // Find the item in the order
    const item = order.items.find((item) => item._id?.toString() === req.body.variance);

    if (!item) {
      return res.status(404).json({ message: 'Variance not found in this order.' });
    }
    console.log("Item:", item);

    // Validate return eligibility
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Only delivered products are eligible for return.' });
    }

    if (item.productStatus === 'Returned' || item.productStatus === 'Return Requested') {
      return res.status(400).json({ message: 'Return request already exists for this product.' });
    }

    // Update the item's status to "Return Requested"
    item.productStatus = 'Return Requested';
    item.variance.returnReason = reason;  // Add the return reason to the item's variance
    
    // Update the returnRequest of the order
    order.returnRequest.isRequested = true;
    order.returnRequest.reason = reason;
    order.returnRequest.status = "Pending"; // Set to "Pending" or other appropriate status
    order.returnRequest.requestDate = new Date(); // Set the request date

    // Save the changes
    await order.save();

    res.status(200).json({
      message: 'Return request submitted successfully.',
      order: {
        id: order._id,
        productId: item.productId,
        status: item.productStatus,
        returnReason: reason,
      },
    });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

const acceptReturnRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if a return request exists for the order
    if (!order.returnRequest.isRequested) {
      return res.status(400).json({ message: "No return request exists for this order." });
    }

    // Check if the return request is already resolved
    if (order.returnRequest.status === "Accepted" || order.returnRequest.status === "Rejected") {
      return res.status(400).json({ message: `Return request already ${order.returnRequest.status}.` });
    }

    // Calculate the total refund amount
    let refundAmount = 0;
    for (const item of order.items) {
      if (item.productStatus === "Return Requested") {
        refundAmount += item.subtotal;
        item.productStatus = "Returned";

        // Find and update the product variance quantity
        try {
          // Find the product
          const product = await Product.findById(item.productId);
          if (!product) {
            console.error(`Product not found for ID: ${item.productId}`);
            continue;
          }

          // Find the matching variance in the product
          const varianceIndex = product.variances.findIndex(v => 
            v.size === item.variance.size && 
            v.color === item.variance.color
          );

          if (varianceIndex === -1) {
            console.error(`Matching variance not found for product ${item.productId}`);
            continue;
          }

          // Update the variance quantity
          product.variances[varianceIndex].quantity += item.quantity;
          
          // Update the overall available quantity
          product.availableQuantity += item.quantity;

          // Debug logs
          console.log('Before save:', {
            productId: product._id,
            varianceIndex,
            newQuantity: product.variances[varianceIndex].quantity,
            newTotalQuantity: product.availableQuantity
          });

          // Save the product changes
          await product.save();

          // Verify the update
          const updatedProduct = await Product.findById(product._id);
          console.log('After save:', {
            productId: updatedProduct._id,
            varianceQuantity: updatedProduct.variances[varianceIndex].quantity,
            totalQuantity: updatedProduct.availableQuantity
          });

        } catch (error) {
          console.error('Error updating product variance:', error);
          // Continue processing other items even if one fails
          continue;
        }
      }
    }

    // Update the order's total price
    order.totalPrice -= refundAmount;
    order.returnRequest.status = "Accepted";
    order.returnRequest.resolutionDate = new Date();

    // Save the updated order
    await order.save();

    // Find or create the user's wallet
    let wallet = await Wallet.findOne({ userId: order.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: order.userId });
    }

    // Credit the refund amount to the wallet
    wallet.transactions.push({
      transactionType: "Credit",
      amount: refundAmount,
      orderId: order._id,
      description: `Refund for order ${order._id}`
    });
    wallet.balance += refundAmount;
    await wallet.save();

    res.status(200).json({
      message: "Return request accepted successfully and refund credited to wallet.",
      order,
      refundAmount
    });
  } catch (error) {
    console.error("Error accepting return request:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};



const rejectReturnRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Check if a return request exists for the order
    if (!order.returnRequest.isRequested) {
      return res
        .status(400)
        .json({ message: "No return request exists for this order." });
    }

    // Check if the return request is already resolved
    if (
      order.returnRequest.status === "Accepted" ||
      order.returnRequest.status === "Rejected"
    ) {
      return res
        .status(400)
        .json({
          message: `Return request already ${order.returnRequest.status}.`,
        });
    }

    // Update the return request status
    order.returnRequest.status = "Rejected";
    order.returnRequest.resolutionDate = new Date();

    // Update product status of items with "Return Requested" to "Return Failed"
    order.items.forEach((item) => {
      if (item.productStatus === "Return Requested") {
        item.productStatus = "Return Failed";
      }
    });

    // Save the updated order
    await order.save();

    res.status(200).json({
      message: "Return request rejected successfully.",
      order,
    });
  } catch (error) {
    console.error("Error rejecting return request:", error);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing required payment details." });
    }
    console.log('Received Data:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });

    // Generate and compare signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed due to signature mismatch." });
    }

    console.log('Generated Signature:', generatedSignature);


    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { razorpayId: razorpay_order_id },
      { paymentStatus: "Completed", orderStatus: "Processing" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    console.log('Updated Order:', updatedOrder);


    return res.status(200).json({ success: true, message: "Payment verified successfully.", order: updatedOrder });
  } catch (error) {
    console.error("Error verifying payment:", error.message, error.stack);
    return res.status(500).json({ success: false, message: "Internal server error. Please try again." });
  }
};

const salesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const orders = await Order.find({
      orderDate: {
        $gte: start,
        $lte: end
      }
    })
      .populate("userId", "name email")
      .populate("shippingAddress")
      .populate({
        path: "items.productId",
        populate: { path: "categoryId", model: "category" }
      })
      .lean()
      .exec();

    const offersByDate = new Map();

    const reportData = await Promise.all(orders.map(async (order) => {
      const orderDate = new Date(order.orderDate);
      const orderDateStr = orderDate.toISOString().split('T')[0];

      if (!offersByDate.has(orderDateStr)) {
        const activeOffers = await Offer.find({
          status: 'active',
          startDate: { $lte: orderDate },
          endDate: { $gte: orderDate }
        }).lean();
        
        offersByDate.set(orderDateStr, activeOffers);
      }

      const applicableOffers = offersByDate.get(orderDateStr);
      let totalOrderDiscount = 0;

      const processedItems = order.items.map(item => {
        const productOffers = applicableOffers.filter(offer => 
          offer.products && 
          offer.products.some(p => p.equals(item.productId._id))
        );

        const categoryOffers = applicableOffers.filter(offer => 
          offer.category && 
          offer.category.equals(item.productId.categoryId._id)
        );

        const allApplicableOffers = [...productOffers, ...categoryOffers];
        let bestOffer = null;
        let maxDiscount = 0;

        allApplicableOffers.forEach(offer => {
          const offerStartDate = new Date(offer.startDate);
          const offerEndDate = new Date(offer.endDate);
          
          if (orderDate >= offerStartDate && orderDate <= offerEndDate) {
            const discountAmount = (item.price * item.quantity) * (offer.discountPercentage / 100);
            if (discountAmount > maxDiscount) {
              maxDiscount = discountAmount;
              bestOffer = {
                name: offer.name,
                discountPercentage: offer.discountPercentage,
                appliedDiscount: discountAmount,
                validFrom: offerStartDate,
                validTo: offerEndDate
              };
            }
          }
        });

        totalOrderDiscount += maxDiscount;

        return {
          ...item,
          offers: bestOffer || {
            name: 'No offer',
            appliedDiscount: 0,
            discountPercentage: 0
          }
        };
      });

      const finalAmount = order.totalPrice - totalOrderDiscount;

      return {
        order: {
          ...order,
          items: processedItems,
          finalAmount // Add final amount to order object
        },
        totalOrderDiscount,
        orderDate
      };
    }));

    // Calculate totals
    const totalSales = reportData.reduce((acc, data) => acc + data.order.totalPrice, 0);
    const totalRevenue = reportData.reduce((acc, data) => acc + data.order.finalAmount, 0);
    const totalItems = reportData.reduce((acc, data) => 
      acc + data.order.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );
    const totalDiscounts = reportData.reduce((acc, data) => acc + data.totalOrderDiscount, 0);

    res.status(200).json({
      message: "Sales report fetched successfully",
      totalSales,
      totalRevenue,
      totalItems,
      totalDiscounts,
      orders: reportData
    });

  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear
} = require('date-fns');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const downloadReport = async (req, res) => {
  try {
    const { startDate, endDate, format, dateRange } = req.query;
    
    // Calculate date range based on selection
    let queryStartDate = startDate;
    let queryEndDate = endDate;
    
    if (dateRange) {
      const currentDate = new Date();
      switch (dateRange) {
        case 'daily':
          queryStartDate = startOfDay(currentDate);
          queryEndDate = endOfDay(currentDate);
          break;
        case 'weekly':
          queryStartDate = startOfWeek(currentDate);
          queryEndDate = endOfWeek(currentDate);
          break;
        case 'yearly':
          queryStartDate = startOfYear(currentDate);
          queryEndDate = endOfYear(currentDate);
          break;
        case 'custom':
          queryStartDate = new Date(startDate);
          queryEndDate = new Date(endDate);
          break;
        default:
          queryStartDate = startOfDay(currentDate);
          queryEndDate = endOfDay(currentDate);
      }
    }

    const orders = await Order.find({
      orderDate: {
        $gte: new Date(queryStartDate),
        $lte: new Date(queryEndDate)
      }
    }).populate({
      path: 'items.productId',
      select: 'name title categoryId',
      populate: {
        path: 'categoryId',
        select: 'name categoryName'
      }
    }).lean();
    
    // Fetch sales data for the date range
    const offersByDate = new Map();

    // Enhance each order with applicable discounts
    const enhancedOrders = await Promise.all(orders.map(async order => {
      const orderDateStr = new Date(order.orderDate).toISOString().split('T')[0];

      if (!offersByDate.has(orderDateStr)) {
        const activeOffers = await Offer.find({
          status: 'active',
          startDate: { $lte: order.orderDate },
          endDate: { $gte: order.orderDate }
        }).lean();
        offersByDate.set(orderDateStr, activeOffers);
      }

      const applicableOffers = offersByDate.get(orderDateStr);

      order.items.forEach(item => {
        const productOffers = applicableOffers.filter(offer => 
          offer.products && offer.products.some(p => p.equals(item.productId._id))
        );

        const categoryOffers = applicableOffers.filter(offer => 
          offer.category && offer.category.equals(item.productId.categoryId._id)
        );

        const allApplicableOffers = [...productOffers, ...categoryOffers];
        let bestOffer = null;
        let maxDiscount = 0;

        allApplicableOffers.forEach(offer => {
          const discountAmount = (item.price * item.quantity) * (offer.discountPercentage / 100);
          if (discountAmount > maxDiscount) {
            maxDiscount = discountAmount;
            bestOffer = {
              name: offer.name,
              discountPercentage: offer.discountPercentage,
              appliedDiscount: discountAmount
            };
          }
        });

        item.offers = bestOffer || { name: 'No offer', appliedDiscount: 0, discountPercentage: 0 };
      });

      return order;
    }));

    // Calculate summary metrics
    const summary = {
      totalSales: enhancedOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      totalOrders: enhancedOrders.length,
      totalDiscounts: enhancedOrders.reduce((sum, order) => {
        const orderDiscount = order.items.reduce((itemSum, item) => 
          itemSum + (item.offers?.appliedDiscount || 0), 0);
        return sum + orderDiscount;
      }, 0),
      totalRevenue: enhancedOrders.reduce((sum, order) => {
        const orderRevenue = order.totalPrice - order.items.reduce((itemSum, item) => 
          itemSum + (item.offers?.appliedDiscount || 0), 0);
        return sum + orderRevenue;
      }, 0)
    };

    if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');
      doc.pipe(res);
      
      // Define consistent column layout
      const columns = {
        orderId: { x: 50, width: 80 },
        date: { x: 130, width: 80 },
        products: { x: 210, width: 160 },
        grossAmount: { x: 370, width: 70 },
        discount: { x: 440, width: 70 },
        netAmount: { x: 510, width: 70 }
      };

      // Header and Summary Section
      doc.fontSize(24).text('Sales Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Period: ${new Date(queryStartDate).toLocaleDateString()} to ${new Date(queryEndDate).toLocaleDateString()}`);
      doc.moveDown();
      
      // Summary Box
      doc.fontSize(14).text('Summary', { underline: true });
      doc.fontSize(10)
         .text(`Total Orders: ${summary.totalOrders}`)
         .text(`Gross Sales: ₹${summary.totalSales.toFixed(2)}`)
         .text(`Total Discounts: ₹${summary.totalDiscounts.toFixed(2)}`)
         .text(`Net Revenue: ₹${summary.totalRevenue.toFixed(2)}`);
      doc.moveDown();

      // Function to draw table headers
      const drawTableHeaders = (yPosition) => {
        doc.fontSize(10);
        Object.entries(columns).forEach(([key, value]) => {
          const header = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
          doc.text(header, value.x, yPosition);
        });
        return yPosition + 20;
      };
      
      // Initialize table
      let yPosition = drawTableHeaders(250);
      
      // Draw table content
      enhancedOrders.forEach(order => {
        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          yPosition = drawTableHeaders(yPosition);
        }

        const initialY = yPosition;
        let maxHeight = 0;
        
        // Format products text with line breaks instead of commas
        const productsText = order.items.map(item => {
          const productName = item.productId?.title || item.productId?.name || 'Unknown Product';
          return `${productName} (${item.quantity})`;
        }).join('\n');

        const totalDiscount = order.items.reduce((sum, item) => 
          sum + (item.offers?.appliedDiscount || 0), 0);
        const netAmount = order.totalPrice - totalDiscount;
        
        doc.fontSize(9);
        
        // Draw each column
        doc.text(order._id.toString().slice(-6), columns.orderId.x, yPosition);
        doc.text(new Date(order.orderDate).toLocaleDateString(), columns.date.x, yPosition);
        
        // Products with wrapping
        const productsHeight = doc.heightOfString(productsText, {
          width: columns.products.width,
          align: 'left'
        });
        doc.text(productsText, columns.products.x, yPosition, {
          width: columns.products.width,
          align: 'left'
        });
        maxHeight = Math.max(maxHeight, productsHeight);
        
        // Amounts
        doc.text(`₹${order.totalPrice.toFixed(2)}`, columns.grossAmount.x, yPosition);
        doc.text(`₹${totalDiscount.toFixed(2)}`, columns.discount.x, yPosition);
        doc.text(`₹${netAmount.toFixed(2)}`, columns.netAmount.x, yPosition);
        
        // Update position for next row
        yPosition = initialY + maxHeight + 10;
      });
      
      doc.end();
      
    } else if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');
      
      // Configure columns with proper widths
      worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Product Name', key: 'product', width: 40 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Unit Price', key: 'unitPrice', width: 12 },
        { header: 'Total Price', key: 'totalPrice', width: 12 },
        { header: 'Discount', key: 'discount', width: 12 },
        { header: 'Net Amount', key: 'netAmount', width: 12 }
      ];
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Add title and report period (before the headers)
      worksheet.spliceRows(1, 0,
        ['Sales Report'],
        [`Report Period: ${new Date(queryStartDate).toLocaleDateString()} to ${new Date(queryEndDate).toLocaleDateString()}`],
        [],
        ['Summary'],
        ['Total Orders', summary.totalOrders],
        ['Gross Sales', `₹${summary.totalSales.toFixed(2)}`],
        ['Total Discounts', `₹${summary.totalDiscounts.toFixed(2)}`],
        ['Net Revenue', `₹${summary.totalRevenue.toFixed(2)}`],
        []
      );
      
      // Style the title
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.mergeCells('A1:I1');
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
      
      // Add order data
      enhancedOrders.forEach(order => {
        order.items.forEach(item => {
          const productName = item.productId?.title || item.productId?.name || 'Unknown Product';
          const categoryName = item.productId?.categoryId?.categoryName || 
                             item.productId?.categoryId?.name || 
                             'N/A';
          
          const row = worksheet.addRow({
            orderId: order._id.toString(),
            date: new Date(order.orderDate).toLocaleDateString(),
            product: productName,
            quantity: item.quantity,
            category: categoryName,
            unitPrice: (item.price / item.quantity).toFixed(2),
            totalPrice: item.price.toFixed(2),
            discount: (item.offers?.appliedDiscount || 0).toFixed(2),
            netAmount: (item.price - (item.offers?.appliedDiscount || 0)).toFixed(2)
          });
          
          // Configure row styling
          row.alignment = { vertical: 'middle' };
          row.height = 25;
          
          // Enable text wrapping for product names
          const productCell = row.getCell('product');
          productCell.alignment = { wrapText: true, vertical: 'middle' };
        });
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      throw new Error('Unsupported format');
    }
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

const failurePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !["Pending", "Completed", "Failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid payment status." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.paymentStatus = status;
    order.updatedAt = Date.now();

    await order.save();

    return res.status(200).json({ message: "Payment status updated successfully." });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
}


const retryPayment = async (req, res) => {
  const { orderId } = req.params;
  const { 
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature 
  } = req.body;
  console.log("body:",req.body)

  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify Razorpay signature (implement your verification logic here)
    const isValidPayment = true; // Replace with actual verification

    if (isValidPayment) {
      // Update order with new payment status and Razorpay ID
      order.paymentStatus = "Completed";
      order.razorpayId = razorpay_payment_id;
      order.orderStatus = "Processing";
      order.updatedAt = new Date();

      await order.save();

      res.json({
        success: true,
        message: "Payment completed successfully",
        order
      });
    } else {
      order.paymentStatus = "Failed";
      await order.save();
      
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Failed to process payment" });
  }
};

const invoiceDownload = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId)
      .populate({
        path: "userId",
        model: "users",
        select: "firstName email phoneNumber"
      })
      .populate({
        path: "shippingAddress",
        model: "address",
        select: "addressLine street city state pincode phone"
      })
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    let filename = `invoice-${orderId}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // Define colors
    const colors = {
      background: '#FFF0F3',
      header: '#FF69B4',
      text: '#4A4A4A',
    };

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(colors.background);

    // Header
    doc.fontSize(24)
      .fillColor(colors.header)
      .text('LUSH AURA INVOICE', {
        align: 'center',
        
      })
      .moveDown();

    // Customer Details
    doc.fontSize(16)
      .fillColor(colors.header)
      .text('Customer Details')
      .moveDown(0.5);

    doc.fontSize(12)
      .fillColor(colors.text);

    // Get shipping address from the populated data
    const shippingAddress = order.shippingAddress;
    const addressString = shippingAddress ? 
      `${shippingAddress.addressLine}, ${shippingAddress.street || ''}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}` :
      'Address not available';

    doc.text(`Customer Name: ${order.userId ? order.userId.firstName : 'N/A'}`)
      .text(`Customer Email: ${order.userId ? order.userId.email : 'N/A'}`)
      .text(`Customer Phone: ${order.userId ? order.userId.phoneNumber : 'N/A'}`)
      .moveDown(0.5)
      .text('Shipping Address:')
      .text(addressString)
      .text(`Contact Number: ${shippingAddress ? shippingAddress.phone : 'N/A'}`)
      .moveDown();

    // Order Details
    doc.fontSize(16)
      .fillColor(colors.header)
      .text('Order Details')
      .moveDown(0.5);

    doc.fontSize(12)
      .fillColor(colors.text)
      .text(`Order ID: ${order._id}`)
      .text(`Order Date: ${new Date(order.orderDate).toLocaleString()}`)
      .text(`Payment Method: ${order.paymentMethod}`)
      .text(`Payment Status: ${order.paymentStatus}`)
      .text(`Order Status: ${order.orderStatus}`)
      .moveDown();

    // Order Items Table
    doc.fontSize(16)
      .fillColor(colors.header)
      .text('Order Items')
      .moveDown(0.5);

    // Define table layout
    const tableLayout = {
      x: 50,
      width: 500,
      rowHeight: 30,
      columns: {
        item: { x: 50, width: 250 },
        quantity: { x: 300, width: 70 },
        price: { x: 370, width: 80 },
        subtotal: { x: 450, width: 90 }
      }
    };

    // Table headers
    doc.fontSize(12)
      .fillColor(colors.text);

    Object.entries({
      'Item': tableLayout.columns.item.x,
      'Quantity': tableLayout.columns.quantity.x,
      'Price': tableLayout.columns.price.x,
      'Subtotal': tableLayout.columns.subtotal.x
    }).forEach(([header, x]) => {
      doc.text(header, x, doc.y);
    });

    doc.moveDown();

    // Table rows
    order.items.forEach((item) => {
      const initialY = doc.y;
      let maxHeight = tableLayout.rowHeight;

      // Calculate wrapped text height
      const nameHeight = doc.fontSize(12)
        .heightOfString(item.productName, {
          width: tableLayout.columns.item.width,
          align: 'left'
        });

      maxHeight = Math.max(maxHeight, nameHeight + 10);

      // Check for page break
      if (doc.y + maxHeight > doc.page.height - 150) {
        doc.addPage();
        doc.fontSize(12).fillColor(colors.text);
      }

      // Draw item name with word wrap
      doc.text(item.productName,
        tableLayout.columns.item.x,
        doc.y,
        {
          width: tableLayout.columns.item.width,
          align: 'left'
        }
      );

      // Draw other columns
      doc.text(item.quantity.toString(),
        tableLayout.columns.quantity.x,
        initialY,
        { width: tableLayout.columns.quantity.width, align: 'left' }
      );

      doc.text(`₹${item.price.toFixed(2)}`,
        tableLayout.columns.price.x,
        initialY,
        { width: tableLayout.columns.price.width, align: 'left' }
      );

      doc.text(`₹${item.subtotal.toFixed(2)}`,
        tableLayout.columns.subtotal.x,
        initialY,
        { width: tableLayout.columns.subtotal.width, align: 'left' }
      );

      // Add variance information if available
      if (item.variance) {
        doc.moveDown(1);
        let varianceText = [];
        if (item.variance.size) varianceText.push(`Size: ${item.variance.size}`);
        if (item.variance.color) varianceText.push(`Color: ${item.variance.color}`);
        
        if (varianceText.length > 0) {
          doc.fontSize(10)
            .text(varianceText.join(', '), 
              tableLayout.columns.item.x + 20,
              doc.y);
        }
      }

      doc.moveDown();
    });

    // Totals section
    doc.moveDown()
      .fontSize(12)
      .fillColor(colors.text);

    const rightColumn = doc.page.width - 150;

    doc.text(`Total Items: ${order.totalItems}`, rightColumn, doc.y, { align: 'right' })
      .text(`Subtotal: ₹${order.totalPrice.toFixed(2)}`, rightColumn, doc.y, { align: 'right' })
      .text(`Shipping Charge: ₹${order.shippingCharge.toFixed(2)}`, rightColumn, doc.y, { align: 'right' })
      .text(`Grand Total: ₹${(order.totalPrice + order.shippingCharge).toFixed(2)}`, rightColumn, doc.y, { align: 'right' });

    // Add some space before footer
    doc.moveDown(2);

    // Reset the x position and use the full page width for the footer
    doc.fontSize(10)
      .fillColor(colors.text)
      .text('Thank you for your purchase!', 50, doc.y, {
        width: doc.page.width - 100,
        align: 'center'
      });


    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};









  

module.exports ={
    addOrder,
    getOrders,
    editOrders,
    getUserOrder,
    cancelOrder,
    returnOrder,
    acceptReturnRequest,
    rejectReturnRequest,
    verifyPayment,
    salesReport,
    downloadReport,
    failurePayment,
    retryPayment,
    invoiceDownload,
}
