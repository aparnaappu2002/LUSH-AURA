const mongoose = require("mongoose");
const Cart = require("../Models/cartSchema"); 
const Product = require("../Models/productSchema");


const cartAdd = async (req, res) => {
  try {
    const { userId, productId, productName, variance, quantity } = req.body;

    // Validate required fields
    if (!userId || !productId || !quantity || !productName || !variance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the product from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the requested variance
    const varianceExists = product.variances.find(
      (v) =>
        v.size === variance.size &&
        v.color.toLowerCase() === variance.color.toLowerCase()
    );

    if (!varianceExists) {
      return res
        .status(404)
        .json({ error: "Selected variance is not available" });
    }

    const availableQuantity = varianceExists.quantity; // Fetching available quantity from product variance

    // Check if the requested quantity exceeds the available quantity
    if (quantity > availableQuantity) {
      return res.status(400).json({
        error: `Only ${availableQuantity} units are available for this product.`,
      });
    }

    const selectedImage =
      varianceExists.varianceImage?.[0] || product.productImage?.[0] || "";

    if (!selectedImage) {
      console.warn(
        `No image found for product ${productId} with variance ${JSON.stringify(
          variance
        )}`
      );
    }

    const itemPrice = varianceExists.price || product.price;
    const itemSubtotal = itemPrice * quantity;

    // Fetch or create the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    // Check for existing item
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.variance.size === variance.size &&
        item.variance.color.toLowerCase() === variance.color.toLowerCase()
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      // Ensure new quantity does not exceed available quantity
      if (newQuantity > availableQuantity) {
        return res.status(400).json({
          error: `Only ${
            availableQuantity - existingItem.quantity
          } additional units are available.`,
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.subtotal = existingItem.quantity * itemPrice;
    } else {
      // Add new item
      cart.items.push({
        productId,
        productName,
        variance: {
          size: variance.size,
          color: variance.color,
          varianceImage: varianceExists.varianceImage, // Preserve variance-specific image
        },
        quantity,
        price: itemPrice,
        image: selectedImage,
        subtotal: itemSubtotal,
        availableQuantity
      });
    }

    // Update totals
    cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);

    // Save the cart
    await cart.save();

    res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



  
  
  

const getCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        model: "products",
        select: "name description price image variances",
      });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found for the user" });
    }

    // Prepare cart items with product names and correct images
    const itemsWithDetails = cart.items.map((item) => {
      const product = item.productId; // Populated product data
      const productName = item.productName || product?.name || "Unknown Product";

      const varianceImage = product?.variances?.find(
        (variance) =>
          variance.size === item.variance.size &&
          variance.color.toLowerCase() === item.variance.color.toLowerCase()
      )?.varianceImage[0] || product?.image || "";

      return {
        ...item.toObject(),
        productName, // Use productName from item or fallback to populated product name
        image: varianceImage || "", // Add image URL or empty string
      };
    });

    res.status(200).json({
      message: "Cart retrieved successfully",
      cart: {
        ...cart.toObject(),
        items: itemsWithDetails, // Updated items with productName and images
      },
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



  const removeCartItem = async (req, res) => {
    try {
      const { userId, productId, variance } = req.body;
  
      if (!userId || !productId || !variance) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: "Cart not found for the user" });
      }
  
      // Find the item in the cart
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.variance.size === variance.size &&
          item.variance.color.toLowerCase() === variance.color.toLowerCase()
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in the cart" });
      }
  
      // Remove the item and update totals
      const removedItem = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);
  
      // Update totals
      cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
  
      await cart.save();
  
      res.status(200).json({
        message: "Item removed from cart successfully",
        cart,
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  const updateCartQuantity = async (req, res) => {
    try {
      const { userId, productId, variance, quantity } = req.body;
  
      // Validate request data
      if (!userId || !productId || quantity === undefined || !variance) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      if (quantity < 1) {
        return res.status(400).json({ error: "Quantity must be at least 1" });
      }
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: "Cart not found for the user" });
      }
  
      // Find the item in the cart
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.variance.size === variance.size &&
          item.variance.color.toLowerCase() === variance.color.toLowerCase()
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in the cart" });
      }
  
      // Update quantity and subtotal for the item
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.subtotal = item.price * quantity;
  
      // Recalculate cart totals
      cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((total, item) => total + item.subtotal, 0);
  
      await cart.save();
  
      res.status(200).json({ message: "Cart item updated successfully", cart });
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  const removeCart = async (req, res) => {
    try {
      const { userId, productId, variance } = req.body;
      console.log("Payload in the backend:",req.body)
  
      if (!userId || !productId || !variance) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: "Cart not found for the user" });
      }
  
      // Find the item in the cart and remove it
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.variance.size === variance.size ||
          item.variance.color.toLowerCase() === variance.color.toLowerCase()
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ error: "Item not found in the cart" });
      }
  
      // Remove the item and update totals
      cart.items.splice(itemIndex, 1);
  
      // Update totals
      cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
  
      await cart.save();
  
      res.status(200).json({
        message: "Item removed from cart successfully",
        cart,
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  
  
  
  
  
  

  module.exports ={
    cartAdd,
    getCartItems,
    removeCartItem,
    updateCartQuantity,
    removeCart
  }