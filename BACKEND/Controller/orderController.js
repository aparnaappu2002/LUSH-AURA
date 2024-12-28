const mongoose = require("mongoose");
const Order = require('../Models/orderSchema')
const Cart = require('../Models/cartSchema')
const Product = require('../Models/productSchema')
const Address = require('../Models/addressSchema')

const addOrder = async (req, res) => {
    try {
      const { userId, items, shippingAddress, paymentMethod, totalItems, totalPrice } = req.body;
  
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
  
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
  
        const selectedVariance = product.variances.find(
          (v) => v.size === item.variance.size && v.color === item.variance.color
        );
  
        if (!selectedVariance || selectedVariance.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productName}.`);
        }
  
        // Reduce stock
        selectedVariance.quantity -= item.quantity;
        updatedProducts.push({
          product,
          size: item.variance.size,
          color: item.variance.color,
          quantity: item.quantity,
        });
  
        await product.save();
      }
  
      // Create order
      const newOrder = new Order({
        userId,
        items,
        shippingAddress,
        paymentMethod,
        paymentStatus: "Pending",
        orderStatus: "Placed",
        totalItems,
        totalPrice,
      });
  
      const savedOrder = await newOrder.save();
  
      // Remove items from cart
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
  
      return res.status(201).json({ message: "Order placed successfully.", order: savedOrder });
    } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ message: error.message || "Internal server error." });
    }
  };
  
  const getOrders = async (req, res) => {
    try {
      const orders = await Order.find().populate('userId shippingAddress');
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Error fetching orders", error: err });
    }
  }
  
  const editOrders = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;
  
      const order = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      console.log("Order:",order)
  
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Error updating order status", error: err });
    }
  }

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



// Cancel Order Endpoint
const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Validate orderId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid Order ID" });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order is already cancelled
        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({ message: "Order is already cancelled" });
        }

        // Update the order status to "Cancelled"
        order.orderStatus = "Cancelled";
        await order.save();

        // Update product quantities
        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                console.warn(`Product with ID ${item.productId} not found.`);
                continue; // Skip updating this product if not found
            }

            // Update the product's available quantity and variance quantity
            product.availableQuantity += item.quantity;

            if (item.variance && product.variances.length > 0) {
                const variance = product.variances.find(
                    v => v.size === item.variance.size && v.color === item.variance.color
                );

                if (variance) {
                    variance.quantity += item.quantity;
                } else {
                    console.warn(`Variance not found for product ID ${item.productId}.`);
                }
            }

            await product.save();
        }

        res.status(200).json({ message: "Order cancelled successfully", order });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Failed to cancel order", error });
    }
};





  
  
  
 
  
  
  
  

module.exports ={
    addOrder,
    getOrders,
    editOrders,
    getUserOrder,
    cancelOrder
}
