const express = require('express');

const Product = require('../Models/productSchema'); // Adjust path as necessary
const Category = require('../Models/categorySchema'); // Adjust path as necessary

// Get top 5 best-selling products
const bestProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ salesCount: -1 }).limit(10);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching best-selling products', error });
  }
}

// Get top 5 best-selling categories
const bestCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ salesCount: -1 }).limit(10);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching best-selling categories', error });
  }
}

module.exports = {
    bestProducts,
    bestCategories
}
