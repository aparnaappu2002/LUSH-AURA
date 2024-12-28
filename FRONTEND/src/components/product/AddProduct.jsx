import React, { useState, useEffect, useCallback } from "react";
import axios from "../../axios/adminAxios";
import { toast } from "react-hot-toast";
import cloudAxios from "axios";
import { useNavigate } from "react-router-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import VarianceModal from "./Variance";

 function AddProduct() {
  const [formData, setFormData] = useState({
    title: "",
    stockStatus: "",
    price: "",
    availableQuantity: "",
    category: "",
    description: "",
    sizes: [],
    highlights: "",
    specifications: "",
  });
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isVarianceModalOpen, setIsVarianceModalOpen] = useState(false);
  const [variances, setVariances] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const getCategory = async () => {
      try {
        const response = await axios.get("/category");
        const activeCategories = response.data.categories.filter(cat => cat.status === 'active');
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    getCategory();
  }, []);

  useEffect(() => {
    if (!cropModalOpen) {
      setCrop(undefined);
      setCompletedCrop(null);
    }
  }, [cropModalOpen]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.stockStatus) newErrors.stockStatus = "Stock status is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be a positive number";
    if (!formData.availableQuantity || formData.availableQuantity < 1) newErrors.availableQuantity = "Available quantity must be at least 1";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.highlights) newErrors.highlights = "Highlights are required";
    if (!formData.specifications) newErrors.specifications = "Specifications are required";
    if (image.length < 3) newErrors.images = "At least three images are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveVariance = (newVariance) => {
    setVariances(prev => [...prev, {
      ...newVariance,
      images: newVariance.images.map(img => ({
        file: img.file,
        preview: img.preview || img.cropped || img
      }))
    }]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        sizes: checked
          ? [...prev.sizes, value]
          : prev.sizes.filter(size => size !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageUrls = files.map((file) => URL.createObjectURL(file));
      setImageUrl((prev) => [...prev, ...newImageUrls]);
      setImage((prev) => [...prev, ...files]);
    }
  };

  const deleteImage = (index) => {
    setImage((prev) => {
      const updatedImages = prev.filter((_, i) => i !== index);
      return updatedImages;
    });
  
    setImageUrl((prev) => {
      const updatedImageUrls = prev.filter((_, i) => i !== index);
      const deletedUrl = prev[index];
      
      if (deletedUrl) {
        URL.revokeObjectURL(deletedUrl);
      }
  
      return updatedImageUrls;
    });
  
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const openCropModal = (index) => {
    setCurrentImage(imageUrl[index]);
    setCurrentImageIndex(index);
    setCropModalOpen(true);
    setCrop(undefined); // Reset crop when opening the modal
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setCurrentImage(null);
    setCurrentImageIndex(null);
  };

  const cropImage = useCallback(async () => {
    if (completedCrop && currentImage) {
      const canvas = document.createElement('canvas');
      const scaleX = 1;
      const scaleY = 1;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');

      const image = new Image();
      image.src = currentImage;

      image.onload = () => {
        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          setImageUrl((prev) => {
            const newUrls = [...prev];
            newUrls[currentImageIndex] = croppedImageUrl;
            return newUrls;
          });
          setImage((prev) => {
            const newFiles = [...prev];
            newFiles[currentImageIndex] = new File([blob], `cropped-image-${currentImageIndex}.jpg`, { type: 'image/jpeg' });
            return newFiles;
          });
          closeCropModal();
        }, 'image/jpeg');
      };
    }
  }, [completedCrop, currentImage, currentImageIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const uploadPromises = imageUrl.slice(0, 3).map(async (blobUrl, index) => {
        const formData = new FormData();
        const croppedImage = await fetch(blobUrl).then((r) => r.blob());
        formData.append("file", croppedImage);
        formData.append("upload_preset", "lush_aura");
        formData.append("cloud_name", "dzpf5joxo");

        const response = await cloudAxios.post(
          "https://api.cloudinary.com/v1_1/dzpf5joxo/image/upload",
          formData
        );
        return response.data.secure_url;
      });

      const imageUrls = await Promise.all(uploadPromises);

      const uploadVarianceImages = await Promise.all(
        variances.map(async (variance) => {
          if (variance.images && variance.images.length > 0) {
            const imageUploads = await Promise.all(variance.images.map(async (img) => {
              const formData = new FormData();
              const varianceBlob = await fetch(img.preview).then((r) => r.blob());
              formData.append("file", varianceBlob);
              formData.append("upload_preset", "lush_aura");
              formData.append("cloud_name", "dzpf5joxo");

              const response = await cloudAxios.post(
                "https://api.cloudinary.com/v1_1/dzpf5joxo/image/upload",
                formData
              );

              return response.data.secure_url;
            }));

            return {
              ...variance,
              varianceImage: imageUploads,
            };
          }
          return variance;
        })
      );

      const selectedCategory = categories.find(
        (cat) => cat.categoryName === formData.category
      );
      const selectedCategoryId = selectedCategory._id;

      const productDetails = {
        name: formData.title,
        price: formData.price,
        quantity: formData.availableQuantity,
        categoryId: selectedCategoryId,
        description: formData.description,
        status: formData.stockStatus,
        imageUrl: imageUrls,
        highlights: formData.highlights,
        specifications: formData.specifications,
        sizes: formData.sizes,
        variances: uploadVarianceImages,
      };

      await axios.post("/addproduct", productDetails);
      toast.success("Product added successfully!");
      navigate("/productlist");
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-xl font-semibold mb-6">Add Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            {/* Stock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Status</label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.stockStatus ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              >
                <option value="">Select status</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              {errors.stockStatus && <p className="text-red-500 text-sm">{errors.stockStatus}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.price ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            {/* Available Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Quantity</label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.availableQuantity ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              />
              {errors.availableQuantity && <p className="text-red-500 text-sm">{errors.availableQuantity}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.category ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Sizes</label>
              <div className="space-y-2">
                {["300 ML", "500 ML", "750ML"].map((size) => (
                  <label key={size} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="sizes"
                      value={size}
                      checked={formData.sizes.includes(size)}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#7b437e] focus:ring-[#7b437e]"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Highlights */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Highlights</label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.highlights ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
                placeholder="Enter product highlights, separated by commas"
              />
              {errors.highlights && <p className="text-red-500 text-sm">{errors.highlights}</p>}
            </div>

            {/* Specifications */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.specifications ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none`}
                placeholder="Enter product specifications, separated by commas"
              />
              {errors.specifications && <p className="text-red-500 text-sm">{errors.specifications}</p>}
            </div>

            {/* Images */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Images (Minimum 3 required)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:bg-gray-100 file:text-gray-700 file:rounded file:px-4 file:py-2 file:mr-4"
              />
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
            </div>
          </div>

          {/* Display Selected Images */}
          <div className="grid grid-cols-3 gap-4">
            {imageUrl.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => deleteImage(idx)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => openCropModal(idx)}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full"
                >
                  Crop
                </button>
              </div>
            ))}
          </div>

          {/* Image Count Indicator */}
          <div className={`text-sm ${image.length >= 3 ? 'text-green-600' : 'text-red-500'}`}>
            {image.length} / 3 images uploaded
          </div>

          {/* Crop Modal */}
          {cropModalOpen && currentImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                >
                  <img
                    src={currentImage}
                    alt="Crop preview"
                    style={{ maxHeight: '70vh' }}
                  />
                </ReactCrop>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={closeCropModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={cropImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Crop
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Variances */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Variances</h2>
            {variances.map((variance, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md mb-2">
                <p>Size: {variance.size}</p>
                <p>Color: {variance.color}</p>
                <p>Quantity: {variance.quantity}</p>
                <p>Price: ${variance.price.toFixed(2)}</p>
                {variance.imageUrls && variance.imageUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Variance ${index + 1} Image ${i + 1}`} className="mt-2 w-20 h-20 object-cover rounded-md" />
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setIsVarianceModalOpen(true)}
              className="mt-2 px-4 py-2 bg-[#7b437e] text-white rounded-md hover:bg-[#693769]"
            >
              Add Variance
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-[#7b437e] text-white rounded-md hover:bg-[#693769] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || image.length < 3}
          >
            {isLoading ? "Saving Product..." : "Save Product"}
          </button>
        </form>
      </div>

      {/* Variance Modal */}
      <VarianceModal
        isOpen={isVarianceModalOpen}
        onClose={() => setIsVarianceModalOpen(false)}
        onSave={handleSaveVariance}
      />
    </div>
  );
}

export default AddProduct;

