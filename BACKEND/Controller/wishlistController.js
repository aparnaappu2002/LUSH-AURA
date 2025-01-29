const mongoose = require("mongoose");
const Product = require("../Models/productSchema")
const Wishlist = require("../Models/wishlistSchema") 
const Cart = require("../Models/cartSchema")

const wishlistAdd = async (req, res) => {
  try {
    const { userId, productId, productName, variance, image, price } = req.body;
    console.log("body:",req.body)

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });

    // If wishlist does not exist, create a new one
    if (!wishlist) {
      const newWishlist = new Wishlist({
        userId,
        items: [
          {
            productId,
            productName, // Add product name here
            variance,
            productImage: image,
            price,
            quantity: 1,
          },
        ],
      });
      await newWishlist.save();
      return res.status(200).json({ message: "Product added to wishlist." });
    }

    // Check if the product with the same variance already exists
    const isProductInWishlist = wishlist.items.some(
      (item) =>
        item.productId.toString() === productId &&
        JSON.stringify(item.variance) === JSON.stringify(variance)
    );

    if (isProductInWishlist) {
      return res.status(400).json({ message: "Product already in wishlist." });
    }

    // Add the product to the wishlist
    wishlist.items.push({
      productId,
      productName, // Add product name here
      variance,
      productImage: image,
      price,
      quantity: 1,
    });

    await wishlist.save();
    return res.status(200).json({ message: "Product added to wishlist." });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return res.status(500).json({ message: "Server error." });
  }
};




const fetchWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the wishlist for the given userId
    const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    console.log("Wishlist:",wishlist)

    if (!wishlist || wishlist.length === 0) {
      return res.status(200).json({ data: [] }); // Return empty array with 200 status
  }

    // Return all wishlist products for the user
    res.status(200).json({ 
      message: 'Wishlist retrieved successfully.', 
      data: wishlist.items 
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'An error occurred while retrieving the wishlist.' });
  }
};



// Route to remove an item from the wishlist
const wishlistDelete = async (req, res) => {
  try {
    const itemId = req.params.id; // The ID of the wishlist item to remove

    // Find the wishlist item by its ID and remove it
    const result = await Wishlist.updateOne(
      { "items._id": itemId }, // Find the wishlist with the specific item
      { $pull: { items: { _id: itemId } } } // Remove the item from the items array
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Item not found in the wishlist' });
    }

    res.status(200).json({ message: 'Item removed successfully from wishlist' });
  } catch (err) {
    console.error("Error removing item from wishlist:", err);
    res.status(500).json({ message: 'Failed to remove item from wishlist', error: err.message });
  }
}

const wishAdd = async (req, res) => {
  try {
    const { userId, productId, productName, variance, quantity,offerPrice } = req.body;

    console.log("Request Body:", req.body);

    // Validate required fields
    if (!userId || !productId || !quantity || !productName || !variance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }

    // Check if the item already exists in the cart
    const existingItemIndex = cart.items.filter(
      (item) =>
        item.productId.toString() === productId._id  &&
         item.variance?.size === variance.size &&
         item.variance?.color?.toLowerCase() === variance.color?.toLowerCase()
    );
    console.log("exist:",existingItemIndex)
    console.log("cart",cart.items)


    if (existingItemIndex.length > 0) {
      // If item already exists in the cart, respond with a message
      return res.status(400).json({
        error: "Product already exists in the cart with the selected variance.",
      });
    }

    // Fetch the product from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the requested variance safely
    const varianceExists = product.variances.find(
      (v) =>
        v.size === variance.size ||
        v.color?.toLowerCase() === variance.color?.toLowerCase()
    );

    if (!varianceExists) {
      return res.status(404).json({ error: "Selected variance is not available" });
    }

    const availableQuantity = varianceExists.quantity;

    // Check if the requested quantity exceeds the available quantity
    if (quantity > availableQuantity) {
      return res.status(400).json({
        error: `Only ${availableQuantity} units are available for this product.`,
      });
    }

    const selectedImage =
      varianceExists.varianceImage?.[0] || product.productImage?.[0] || "default-image.jpg";

    const itemPrice = offerPrice||varianceExists.price || product.price;
    const itemSubtotal = itemPrice * quantity;

    // Add the new item to the cart
    cart.items.push({
      productId,
      productName,
      variance: {
        size: variance.size,
        color: variance.color,
        varianceImage: varianceExists.varianceImage,
      },
      quantity,
      price: itemPrice,
      image: selectedImage,
      subtotal: itemSubtotal,
      availableQuantity,
    });

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




  module.exports={
    wishlistAdd,
    fetchWishlist,
    wishlistDelete,
    wishAdd,

  }
  