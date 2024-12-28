const Products = require('../Models/productSchema')
const Category = require("../Models/categorySchema")
const fs = require('fs');
const path = require('path');


const addProduct = async (req, res) => {
  const {
    name,
    price,
    quantity,
    categoryId,
  
    description,
    status,
    imageUrl,
    highlights,specifications,
    variances,
  } = req.body;

  console.log(name, price, quantity, categoryId, description, status, imageUrl);

  try {
    // Escape special characters in the product title
    const escapedTitle = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Check if product already exists
    const existingProduct = await Products.findOne({
      title: new RegExp(`^${escapedTitle}$`, "i"), // Use escapedTitle here
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    // Create and save the product
    const product = new Products({
      title: name,
    
      price,
      availableQuantity: quantity, // Corrected the typo here
      description,
      productImage: imageUrl,
      stock: status,
      categoryId,
      highlights,
      specifications,
      variances
    });

    await product.save();
    res.status(201).json({ message: "Product created" });
  } catch (error) {
    console.error("Error while creating the product:", error);
    res.status(500).json({ message: "Server error while creating a product" });
  }
};



  const showProduct = async (req, res) => {
    try {
        // Fetch all products and populate category details
        const products = await Products.find().populate('categoryId', 'categoryName');
        
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        return res.status(200).json({ message: 'Products fetched successfully', products });
    } catch (error) {
        console.error('Error while fetching products:', error);
        return res.status(500).json({ message: 'Error while fetching products' });
    }
};

const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
  
    price,
    availableQuantity,
    description,
    status,
    stock,
    category,
    productImage,
    highlights,
    specifications,
    variances
  } = req.body;

  console.log("Received edit request for product ID:", id);
  console.log("Request body:", req.body);

  try {
    const numericPrice = parseFloat(price); 

    if (isNaN(numericPrice)) {
      console.log("Invalid price:", price);
      return res.status(400).json({ message: "Invalid price input" });
    }

    const checkCategory = await Category.findOne({ categoryName: category });
    const categoryId = checkCategory ? checkCategory._id : req.body.categoryId;

    const existingProduct = await Products.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    
    const existingImages = Array.isArray(existingProduct.productImage)
      ? existingProduct.productImage
      : [];

    const incomingImages = Array.isArray(productImage) ? productImage : [];

    
    const removedImages = existingImages.filter(img => !incomingImages.includes(img));

    
    removedImages.forEach(img => {
      const filePath = path.join(__dirname, "../uploads", img);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    });


    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      {
        title:name,
        
        price: numericPrice,
        availableQuantity,
        description,
        productImage: incomingImages, 
        status,
        stock,
        categoryId,
        highlights,
        specifications,
        variances
      },
      { new: true }
    );

    console.log("Updated Product title:", updatedProduct.title);

    return res.status(200).json({
      message: "Product edited successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error while editing the product", error);
    return res.status(500).json({ message: "Error while editing the product" });
  }
};

const showProductListed = async (req, res) => {
  try {
    const { category, search } = req.query; // Extract category and search from query parameters

    // Base query: Fetch only active products
    let query = { status: 'active' };

    // Apply category filter if provided
    if (category) {
      query.categoryId = category; // Assuming category is the category ID
    }

    // Apply search filter if provided (searching in product title and description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case-insensitive regex for title
        { description: { $regex: search, $options: 'i' } }, // Case-insensitive regex for description
      ];
    }

    const products = await Products.find(query)
      .populate({
        path: 'categoryId',
        select: 'categoryName status',
      });

    // Filter products with active categories only
    const activeProducts = products.filter(
      (product) => product.categoryId?.status === 'active'
    );

    if (!activeProducts || activeProducts.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    return res.status(200).json({
      message: 'Products fetched successfully',
      products: activeProducts,
    });
  } catch (error) {
    console.error('Error while fetching the products:', error);
    return res.status(500).json({ message: 'Error while fetching the products' });
  }
};




const showProductone = async (req, res) => {
  try {
    const productId = req.params.id;

    console.log("id:",productId)

    // Find product by ID
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const relatedProducts = async (req, res) => {
  try {
    console.log("Received product ID:", req.params.id);
    const { id } = req.params;

    const currentProduct = await Products.findById(id);
    console.log("Current product found:", currentProduct);

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const products = await Products.find({
      categoryId: currentProduct.categoryId,
      _id: { $ne: id },
    }).limit(8);
    console.log("Related products:", products);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const filterProduct = async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category) {
      filter.categoryId = category; // Assuming `categoryId` matches the filter value
  }

  if (search) {
      filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search by title
  }

  try {
      const products = await Products.find(filter).populate('categoryId'); // Adjust population if needed
      res.json({ products });
  } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: 'Failed to fetch products', error: err });
  }
}









  
  module.exports = { addProduct,showProduct,editProduct,showProductListed,showProductone,relatedProducts,filterProduct};
  