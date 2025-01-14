const mongoose = require("mongoose");
const Product = require("../Models/productSchema")
const Offer = require("../Models/offerSchema")
const Category = require('../Models/categorySchema');


const productOffer = async (req, res) => {
    const { productId } = req.params;
    const { offerName, description, discountPercentage, startDate, endDate, category } = req.body;

    try {
        // Validate that the product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create a new offer
        const newOffer = new Offer({
            offerName,
            description,
            discountPercentage,
            startDate,
            endDate,
            products: [productId], // Associate the offer with the product
            category,
            status: 'active',
            createdAt: new Date()
        });

        // Save the offer to the database
        const savedOffer = await newOffer.save();

        // Optionally, update the product with the new offer (if needed)
        product.offers = product.offers || [];
        product.offers.push(savedOffer._id);
        await product.save();

        res.status(201).json(savedOffer);
    } catch (error) {
        console.error('Error saving offer:', error);
        res.status(500).json({ message: 'Failed to save offer', error });
    }
}

const getOffers = async (req, res) => {
    const { productId } = req.query;

    console.log("Product",req.query)
  
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
  
    try {
      // Fetch offers for the specific product ID and ensure only active offers are returned
      const offers = await Offer.find({
        products: new mongoose.Types.ObjectId(productId),
        status: 'active',
      });
  
      res.status(200).json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  

// Endpoint to add a new offer
const categoryOffer = async (req, res) => {
  try {
    const { offerName, description, discountPercentage, startDate, endDate, products, category, status } = req.body;
    console.log("Body:",req.body)

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    // Create new offer
    const newOffer = new Offer({
      offerName,
      description,
      discountPercentage,
      startDate,
      endDate,
      products: products || [], // Default to empty array if products not provided
      category,
      status: status || 'active',
    });

    // Save the offer to the database
    const savedOffer = await newOffer.save();

    res.status(201).json({ message: 'Offer added successfully', offer: savedOffer });
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ message: 'Failed to add offer', error: error.message });
  }
}

const offers = async (req, res) => {
    try {
      const offers = await Offer.find();
      res.status(200).json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(400).json({ message: 'Bad request', error: error.message });
    }
  }
  
  const editOffer = async (req, res) => {
    const { id } = req.params;
    const updatedOffer = req.body;
  
    try {
      const offer = await Offer.findById(id);
  
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
  
      // Retain products if not provided in the update request
      if (!updatedOffer.products || updatedOffer.products.length === 0) {
        updatedOffer.products = offer.products;  // Retain previous products
      }
  
      const updated = await Offer.findByIdAndUpdate(id, updatedOffer, {
        new: true,
        runValidators: true
      });
  
      res.status(200).json({ message: 'Offer updated successfully', offer: updated });
    } catch (error) {
      console.error('Error updating offer:', error);
      res.status(500).json({ message: 'Failed to update offer', error });
    }
  };
  

  const productOfferbyId = async (req, res) => {
    const { productId } = req.params;
    const currentDate = new Date();
  
    try {
      // Find offers associated with the productId that are active and within the date range
      const offers = await Offer.find({
        products: mongoose.Types.ObjectId(productId),
        status: 'active',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
      });
  
      if (offers.length > 0) {
        res.status(200).json(offers);
      } else {
        res.status(404).json({ message: 'No active offers found for this product.' });
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  const categoryOfferbyId = async (req, res) => {
    const { categoryId } = req.params;
    const currentDate = new Date();
  
    try {
      // Find active offers associated with the categoryId within the valid date range
      const offers = await Offer.find({
        category: mongoose.Types.ObjectId(categoryId),
        status: 'active',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
      });
  
      if (offers.length > 0) {
        res.status(200).json(offers);
      } else {
        res.status(404).json({ message: 'No active offers found for this category.' });
      }
    } catch (error) {
      console.error('Error fetching category offers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  const getProductOffers = async (req, res) => {
    try {
        if (!req.query.productIds) {
            return res.status(400).json({ 
                success: false, 
                message: 'No product IDs provided' 
            });
        }

        console.log("Raw product IDs from query:", req.query.productIds);

        // Validate product IDs
        const productIds = req.query.productIds.split(',')
            .map(id => id.trim())
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

        console.log("Validated ObjectIds:", productIds.map(id => id.toString()));

        // Find products with their categories and variances
        const products = await Product.find({ 
            _id: { $in: productIds } 
        })
        .populate('categoryId')
        .populate('variances')
        .lean();

        console.log("Populated Products:", products);

        if (products.length === 0) {
            return res.status(200).json({ 
                success: true, 
                productOffers: {},
                message: 'No products found for the given IDs'
            });
        }

        // Collect category IDs
        const categoryIds = products
            .map(p => p.categoryId?._id)
            .filter(Boolean);

        const currentDate = new Date();

        // Find all active offers (both product and category)
        const offers = await Offer.find({
            status: 'active',
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            $or: [
                { products: { $in: productIds } },
                { category: { $in: categoryIds } }
            ]
        })
        .populate('products')
        .populate('category')
        .lean();

        console.log("Found offers:", offers.map(o => ({
            id: o._id,
            name: o.offerName,
            discount: o.discountPercentage,
            type: o.category ? 'category' : 'product'
        })));

        // Calculate best offers for each product
        const productOffers = {};
        for (const product of products) {
            const productId = product._id.toString();
            
            // Find applicable offers for this product
            const applicableOffers = offers.filter(offer => {
              // Check if the offer is linked to the product
              const productMatch = offer.products && 
                  offer.products.some(p => p._id.toString() === productId);
              
              // Check if the offer is linked to the product category
              const categoryMatch = offer.category && 
                  product.categoryId && 
                  offer.category._id.toString() === product.categoryId._id.toString();
          
              // Only return the offer if it matches either product or category
              return productMatch || categoryMatch;
          });
          
          console.log(`Applicable offers for product ${productId}:`, applicableOffers);
          
          

            if (applicableOffers.length > 0) {
                // Find the best offer (highest discount)
                const bestOffer = applicableOffers.reduce((best, current) =>
                    current.discountPercentage > best.discountPercentage ? current : best
                );

                // Apply the best discount to the base product price
                // Apply the best discount to the base product price
const baseDiscountedPrice = product.price * (1 - bestOffer.discountPercentage / 100);

// Calculate discounted prices for each variance
const varianceDiscounts = {};
product.variances.forEach(variance => {
    const variancePrice = variance.price;
    const varianceDiscountedPrice = variancePrice * (1 - bestOffer.discountPercentage / 100);
    varianceDiscounts[variance._id.toString()] = {
        originalPrice: variancePrice,
        discountedPrice: varianceDiscountedPrice,
        savings: variancePrice - varianceDiscountedPrice
    };
});

// Final product offer object
productOffers[productId] = {
  offerId: bestOffer._id,
  offerName: bestOffer.offerName,
  offerType: bestOffer.category ? 'category' : 'product',
  discountPercentage: bestOffer.discountPercentage,
  basePrice: {
      original: product.price,
      discounted: baseDiscountedPrice,
      savings: product.price - baseDiscountedPrice,
  },
  variances: varianceDiscounts,
  categoryId: product.categoryId?._id,
  categoryName: product.categoryId?.categoryName,
  appliedOffers: applicableOffers.map((offer) => ({
      id: offer._id,
      name: offer.offerName,
      discountPercentage: offer.discountPercentage,
      type: offer.category ? 'category' : 'product',
  })),
};


            }
        }

        return res.status(200).json({ 
            success: true, 
            productOffers,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error in getProductOffers:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error fetching offers',
            error: error.message 
        });
    }
};



  
  

  

module.exports={
    productOffer,
    getOffers,
    categoryOffer,
    offers,
    editOffer,
    productOfferbyId,
    categoryOfferbyId,
    getProductOffers
}
