const Category = require('../Models/categorySchema');

// Add Category
const addCategory = async (req, res) => {
  const { newCategory } = req.body;
  //console.log("Data:", req.body)

  try {
    // Check if newCategory is defined
    if (!newCategory) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({
      categoryName: { $regex: new RegExp(`^${newCategory}$`, 'i') }
    });
    
    if (exists) {
      return res.status(409).json({ 
        message: "This category already exists" 
      });
    }
    console.log("exist:",exists)

    const newCat = new Category({
      categoryName: newCategory,
      status: 'active',
    });

    await newCat.save();
    return res.status(201).json({ message: "Category created successfully", newCat });
  } catch (error) {
    console.error('Error while creating category:', error);
    return res.status(500).json({ message: 'Error while creating the category' });
  }
};


// Show All Categories
const showCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log(categories)
    return res.status(200).json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    console.error('Error in fetching categories:', error);
    return res.status(400).json({ message: "Error in fetching categories" });
  }
};
const showCategoryStatus = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' });
    console.log(categories)
    return res.status(200).json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    console.error('Error in fetching categories:', error);
    return res.status(400).json({ message: "Error in fetching categories" });
  }
};

// Edit Category Status
const editStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, { status }, { new: true });
    return res.status(200).json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.error('Error while editing the category:', error);
    return res.status(400).json({ message: 'Error while editing the category' });
  }
};

// Edit Category Name
const editCategory = async (req, res) => {
  const { id } = req.params;
  const { editNameCategory } = req.body;

  try {
    const existingCategory = await Category.findOne({ categoryName: editNameCategory });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(409).json({ message: `Category name '${editNameCategory}' already exists.` });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { categoryName: editNameCategory },
      { new: true }
    );
    return res.status(200).json({ message: "Category name updated successfully", updatedCategory });
  } catch (error) {
    console.error('Error in changing the category name:', error);
    return res.status(400).json({ message: "Error in changing the category name" });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await Category.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error('Error while deleting the category:', error);
    return res.status(400).json({ message: "Error while deleting the category" });
  }
};

module.exports = {
  addCategory,
  showCategory,
  editStatus,
  editCategory,
  deleteCategory,
  showCategoryStatus
};
