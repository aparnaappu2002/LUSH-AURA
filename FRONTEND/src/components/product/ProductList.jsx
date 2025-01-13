import React, { useState, useEffect, useCallback,useRef } from "react";
import axios from "../../axios/adminAxios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import cloudAxios from "axios";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FaPlus, FaPencilAlt, FaTrash } from "react-icons/fa";
import { X } from "lucide-react";
import { Toaster } from "react-hot-toast";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [currentVariant, setCurrentVariant] = useState({ name: "", value: "" });
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const fetchInitiated = useRef(false);
  const offersCache = useRef({}); // Cache to store fetched offers



  const [currentVariantImages, setCurrentVariantImages] = useState([]);
  const [productsWithOffers, setProductsWithOffers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    status: "active",
    image: null,
    highlights: "",
    specifications: "",
    variances: [],
  });

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState({
    offerName: "",
    description: "",
    discountPercentage: 0,
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [editingProductId, setEditingProductId] = useState(null);

  const handleAddOffer = (productId) => {
    setEditingProductId(productId);
    setCurrentOffer({
      offerName: "",
      description: "",
      discountPercentage: 0,
      startDate: "",
      endDate: "",
      status: "active",
    });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async () => {
    try {
      const response = await axios.post(
        `/addoffer/${editingProductId}`,
        currentOffer
      );
      const updatedProduct = response.data;

      // Update products state while preserving all existing product data
      setProducts(
        products.map((product) =>
          product._id === editingProductId
            ? {
                ...product, // Keep existing product data
                ...updatedProduct, // Merge with updated data
                productImage: product.productImage, // Ensure image is preserved
              }
            : product
        )
      );

      setIsOfferModalOpen(false);
      toast.success("Offer added successfully");
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("Failed to save offer");
    }
  };

  useEffect(() => {
    const fetchOffersForProducts = async () => {
      const productsToFetch = currentProducts.filter(
        (product) => product && !offersCache.current[product._id]
      );
  
      if (productsToFetch.length === 0) {
        setProductsWithOffers((prevProductsWithOffers) => {
          const updated = currentProducts.map((product) => ({
            ...product,
            offersCount: offersCache.current[product?._id]?.length || 0,
          }));
          // Only update state if the new productsWithOffers is different
          if (JSON.stringify(prevProductsWithOffers) !== JSON.stringify(updated)) {
            return updated;
          }
          return prevProductsWithOffers;
        });
        return;
      }
  
      try {
        const updatedProducts = await Promise.all(
          productsToFetch.map(async (product) => {
            const response = await axios.get(`/offers`, {
              params: { productId: product._id },
            });
            const offers = response.data;
            offersCache.current[product._id] = offers; // Cache offers
            return { ...product, offersCount: offers.length };
          })
        );
  
        setProductsWithOffers((prevProductsWithOffers) => [
          ...prevProductsWithOffers.filter(
            (product) =>
              !updatedProducts.some((updated) => updated._id === product._id)
          ),
          ...updatedProducts,
        ]);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };
  
    fetchOffersForProducts();
  }, [currentProducts, currentPage]);
  




  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/productlist");
      const formattedProducts = response.data.products.map((product) => ({
        ...product,
        variances: product.variances || product.variants || [], // Fallback if API sends `variants`
      }));
      setProducts(formattedProducts);
      console.log("Formatted Products:", formattedProducts); // Debugging
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
    }
  };

  const handleAddProduct = () => {
    navigate("/addproduct");
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsConfirmModalOpen(true);
  };

  const confirmEdit = () => {
    setEditingProduct(productToEdit);
    setFormData({
      name: productToEdit.title,
      description: productToEdit.description,
      price: productToEdit.price,
      status: productToEdit.status,
      highlights: productToEdit.highlights || "",
      specifications: productToEdit.specifications || "",
      image: null,
      variances: productToEdit.variances || [],
    });
    setUploadedImages(
      productToEdit.productImage.map((url) => ({ url, isExisting: true }))
    );
    setIsConfirmModalOpen(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const newImageUrls = [];
      for (const img of uploadedImages) {
        if (img.file) {
          const imageData = new FormData();
          imageData.append("file", img.file);
          imageData.append("upload_preset", "lush_aura");
          imageData.append("cloud_name", "dzpf5joxo");

          const cloudinaryResponse = await cloudAxios.post(
            "https://api.cloudinary.com/v1_1/dzpf5joxo/image/upload",
            imageData
          );
          console.log("Cloudinary response:", cloudinaryResponse.data);
          newImageUrls.push(cloudinaryResponse.data.secure_url);
        } else if (img.isExisting) {
          newImageUrls.push(img.url);
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        status: formData.status,
        productImage: newImageUrls,
        highlights: formData.highlights,
        specifications: formData.specifications,
        variances: formData.variances,
      };

      console.log("Final FormData to be submitted:", payload);

      if (editingProduct) {
        await axios.put(`/editproduct/${editingProduct._id}`, payload);
        toast.success("Product updated successfully");
      } else {
        await axios.post("/addproduct", payload);
        toast.success("Product added successfully");
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      const filePreviews = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setUploadedImages((prevImages) => [...prevImages, ...filePreviews]);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: e.target.value,
      }));
    }
  };

  const handleDeleteImage = (index) => {
    setUploadedImages((prevImages) => {
      const updatedImages = [...prevImages];
      const removedImage = updatedImages.splice(index, 1)[0];
      if (removedImage.preview) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return updatedImages;
    });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const openCropModal = (image, index) => {
    const imageUrl = image.preview || image.url || image;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageToCrop(img.src);
      setImageIndex(index);
      setCrop({ unit: "%", width: 30, aspect: 16 / 9 });
      setCropModalOpen(true);
    };
    img.src = imageUrl;
  };

  const closeCropModal = () => {
    setCropModalOpen(false);
    setImageToCrop(null);
    setCompletedCrop(null);
  };

  const onCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const cropImage = useCallback(() => {
    if (completedCrop && imageToCrop) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageToCrop;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext("2d");

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
            console.error("Canvas is empty");
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          setUploadedImages((prevImages) => {
            const newImages = [...prevImages];
            newImages[imageIndex] = {
              ...(newImages[imageIndex].isExisting ? { isExisting: true } : {}),
              file: blob,
              preview: croppedImageUrl,
            };
            return newImages;
          });
          closeCropModal();
        }, "image/jpeg");
      };
    }
  }, [completedCrop, imageToCrop, imageIndex]);

  const handleAddVariant = () => {
    setCurrentVariant({
      color: "",
      size: "",
      quantity: "",
      price: "",
      varianceImage: [],
    });
    setCurrentVariantImages([]);
    setEditingVariantIndex(null);
    setVariantModalOpen(true);
  };

  const handleEditVariant = (index) => {
    const variant = formData.variances[index];
    setCurrentVariant(variant);
    setCurrentVariantImages(variant.varianceImage || []);
    setEditingVariantIndex(index);
    setVariantModalOpen(true);
  };

  const handleImageNavigation = (index, direction) => {
    const varianceImages = formData.variances[index]?.varianceImage || [];

    if (varianceImages.length > 0) {
      setCurrentImageIndex((prevState) => {
        const currentIndex = prevState[index] || 0;
        const nextIndex =
          (currentIndex + direction + varianceImages.length) %
          varianceImages.length;

        // Return new state without causing extra renders
        return { ...prevState, [index]: nextIndex };
      });
    }
  };

  const handleSaveVariant = async () => {
    try {
      const updatedVariant = { ...currentVariant };

      // Handle image uploads
      const newImageUrls = [];
      for (const img of currentVariantImages) {
        if (img instanceof File) {
          const imageData = new FormData();
          imageData.append("file", img);
          imageData.append("upload_preset", "lush_aura");
          imageData.append("cloud_name", "dzpf5joxo");

          const cloudinaryResponse = await cloudAxios.post(
            "https://api.cloudinary.com/v1_1/dzpf5joxo/image/upload",
            imageData
          );
          newImageUrls.push(cloudinaryResponse.data.secure_url);
        } else {
          newImageUrls.push(img);
        }
      }
      updatedVariant.varianceImage = newImageUrls;

      setFormData((prevData) => {
        const newVariances = [...prevData.variances];
        if (editingVariantIndex !== null) {
          newVariances[editingVariantIndex] = updatedVariant;
        } else {
          newVariances.push(updatedVariant);
        }
        return { ...prevData, variances: newVariances };
      });

      setVariantModalOpen(false);
      toast.success(
        editingVariantIndex !== null
          ? "Variant updated successfully"
          : "Variant added successfully"
      );
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant");
    }
  };

  const handleVariantImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setCurrentVariantImages((prevImages) => [...prevImages, ...newImages]);
    }
  };

  const handleDeleteVariantImage = (index) => {
    setCurrentVariantImages((prevImages) =>
      prevImages.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <div className="min-h-screen bg-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-pink-800">
              Beauty Product Management
            </h1>
            <button
              onClick={handleAddProduct}
              className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Product
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-pink-100">
                <tr>
                  <th className="py-3 px-4 text-left text-pink-800">Image</th>
                  <th className="py-3 px-4 text-left text-pink-800">Name</th>
                  <th className="py-3 px-4 text-left text-pink-800">Price</th>
                  <th className="py-3 px-4 text-left text-pink-800">Status</th>
                  <th className="py-3 px-4 text-left text-pink-800">
                    Variants
                  </th>
                  <th className="py-3 px-4 text-left text-pink-800">Offers</th>
                  <th className="py-3 px-4 text-left text-pink-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-100">
  {productsWithOffers.length > 0 ? (
    productsWithOffers.map((product) => (
      <tr key={product._id} className="hover:bg-pink-50 transition-colors duration-150">
        {/* Image Column */}
        <td className="py-3 px-4">
          <img
            src={product.productImage?.[0] || "placeholder.jpg"}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-full border-2 border-pink-200"
          />
        </td>

        {/* Name Column */}
        <td className="py-3 px-4 text-pink-800">{product.title}</td>

        {/* Price Column */}
        <td className="py-3 px-4 text-pink-800">₹{product.price?.toFixed(2) || "0.00"}</td>

        {/* Status Column */}
        <td className="py-3 px-4">
          <span className={`inline-block px-3 py-1 rounded-full text-white ${product.status === "active" ? "bg-green-500" : "bg-red-500"}`}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        </td>

        {/* Variants Column */}
        <td className="py-3 px-4">
          {product.variances?.length ? (
            <div className="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-full">
              <span className="text-sm font-medium text-pink-800">{product.variances.length}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">No variants</span>
          )}
        </td>

        {/* Offers Column */}
        <td className="py-3 px-4">
          <div className="flex items-center">
            {product.offersCount > 0 ? (
              
              <span className="text-sm font-medium text-pink-600 mr-2">{product.offersCount}</span>
              
            ) : (
              <span className="text-sm text-gray-500 mr-2">No offers</span>
            )}
            <button
              onClick={() => handleAddOffer(product._id)}
              className="bg-pink-100 hover:bg-pink-200 text-pink-600 font-bold py-1 px-2 rounded-full text-xs flex items-center"
            >
              <FaPlus className="mr-1" />
              Add Offer
            </button>
            
            
          </div>
        </td>

        {/* Actions Column */}
        <td className="py-3 px-4">
          <button onClick={() => handleEditProduct(product)} className="text-pink-600 hover:text-pink-800 mr-2 transition-colors duration-150">
            <PencilIcon className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="py-4 px-4 text-center text-pink-800">
        No products available.
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 mx-1 rounded ${
                  currentPage === index + 1
                    ? "bg-pink-600 text-white"
                    : "bg-gray-200 text-pink-800"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-pink-100 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-pink-800">
                    {editingProduct ? "Edit" : "Add"} Beauty Product
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-pink-500 hover:text-pink-700"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Price
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="highlights"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Highlights
                    </label>
                    <textarea
                      id="highlights"
                      name="highlights"
                      value={formData.highlights || ""}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  <div>
                    <label
                      htmlFor="specifications"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Specifications
                    </label>
                    <textarea
                      id="specifications"
                      name="specifications"
                      value={formData.specifications || ""}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-pink-700">
                      Current Images
                    </label>
                    {uploadedImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.preview || img.url}
                              alt={`Uploaded ${index + 1}`}
                              className="w-32 h-32 object-cover rounded-md border-2 border-pink-200"
                            />
                            <div className="absolute top-1 right-1 flex">
                              <button
                                type="button"
                                className="bg-white rounded-full p-1 shadow hover:bg-pink-100 mr-1"
                                onClick={() => openCropModal(img, index)}
                              >
                                <PencilIcon className="w-5 h-5 text-pink-600" />
                              </button>
                              <button
                                type="button"
                                className="bg-white rounded-full p-1 shadow hover:bg-pink-100"
                                onClick={() => handleDeleteImage(index)}
                              >
                                <XIcon className="w-5 h-5 text-pink-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-pink-600">
                        No images uploaded.
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Upload New Image
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      multiple
                      onChange={handleChange}
                      accept="image/*"
                      className="mt-1 block w-full text-sm text-pink-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-pink-50 file:text-pink-700
                      hover:file:bg-pink-100"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-lg font-semibold text-pink-700 mb-2">
                      Variants
                    </label>

                    {formData.variances && formData.variances.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.variances.map((variant, index) => (
                          <div
                            key={variant._id || index}
                            className="bg-pink-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                          >
                            <h3 className="font-bold text-pink-800 text-lg mb-3">
                              Variant {index + 1}
                            </h3>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                              <p>
                                <strong className="text-pink-700">
                                  Color:{" "}
                                </strong>
                                {variant.color || "N/A"}
                              </p>
                              <p>
                                <strong className="text-pink-700">
                                  Size:{" "}
                                </strong>
                                {variant.size || "N/A"}
                              </p>
                              <p>
                                <strong className="text-pink-700">
                                  Quantity:{" "}
                                </strong>
                                {variant.quantity || 0}
                              </p>
                              <p>
                                <strong className="text-pink-700">
                                  Price:{" "}
                                </strong>
                                ₹{variant.price?.toFixed(2) || "0.00"}
                              </p>
                            </div>

                            {/* Display Images */}
                            {variant?.varianceImage?.length > 0 && (
                              <div className="relative mt-4">
                                <img
                                  src={
                                    variant.varianceImage[
                                      currentImageIndex[index] || 0
                                    ]
                                  }
                                  alt={`Variant ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-md"
                                />

                                {variant.varianceImage.length > 1 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleImageNavigation(index, -1)
                                      }
                                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                                    >
                                      <ChevronLeftIcon className="w-5 h-5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleImageNavigation(index, 1)
                                      }
                                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                                    >
                                      <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleEditVariant(index)}
                              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-2 rounded"
                            >
                              Edit Variant
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-pink-600 mb-4 italic">
                        No variants added yet.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-4 rounded"
                    >
                      Add New Variant
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      {editingProduct ? "Update" : "Add"} Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isConfirmModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-pink-800 mb-4">
                  Confirm Edit
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to edit this product?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEdit}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  >
                    Confirm Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {cropModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold text-pink-800 mb-4">
                  Crop Image
                </h2>
                <div className="max-h-[60vh] overflow-auto">
                  <ReactCrop
                    src={imageToCrop}
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={(c) => onCropComplete(c)}
                  >
                    <img
                      src={imageToCrop}
                      alt="Crop preview"
                      style={{ maxWidth: "100%", maxHeight: "60vh" }}
                    />
                  </ReactCrop>
                </div>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={closeCropModal}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={cropImage}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  >
                    Crop Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {variantModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold text-pink-800 mb-4">
                  {editingVariantIndex !== null
                    ? "Edit Variant"
                    : "Add Variant"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="variantColor"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Color
                    </label>
                    <input
                      type="text"
                      id="variantColor"
                      value={currentVariant.color || ""}
                      onChange={(e) =>
                        setCurrentVariant({
                          ...currentVariant,
                          color: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="variantSize"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Size
                    </label>
                    <input
                      type="text"
                      id="variantSize"
                      value={currentVariant.size || ""}
                      onChange={(e) =>
                        setCurrentVariant({
                          ...currentVariant,
                          size: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="variantQuantity"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="variantQuantity"
                      value={currentVariant.quantity || ""}
                      onChange={(e) =>
                        setCurrentVariant({
                          ...currentVariant,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="variantPrice"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Price
                    </label>
                    <input
                      type="number"
                      id="variantPrice"
                      value={currentVariant.price || ""}
                      onChange={(e) =>
                        setCurrentVariant({
                          ...currentVariant,
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="variantImage"
                      className="block text-sm font-medium text-pink-700"
                    >
                      Variant Images
                    </label>
                    <input
                      type="file"
                      id="variantImage"
                      multiple
                      onChange={handleVariantImageUpload}
                      className="mt-1 block w-full text-sm text-pink-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-pink-50 file:text-pink-700
                      hover:file:bg-pink-100"
                    />
                  </div>
                  {currentVariantImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {currentVariantImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={
                              img instanceof File
                                ? URL.createObjectURL(img)
                                : img
                            }
                            alt={`Variant ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteVariantImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    onClick={() => setVariantModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVariant}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  >
                    Save Variant
                  </button>
                </div>
              </div>
            </div>
          )}
          {isOfferModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-pink-800">Add Offer</h2>
                  <button
                    onClick={() => setIsOfferModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveOffer();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="offerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Offer Name
                    </label>
                    <input
                      type="text"
                      id="offerName"
                      value={currentOffer.offerName}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          offerName: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={currentOffer.description}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    ></textarea>
                  </div>
                  <div>
                    <label
                      htmlFor="discountPercentage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Discount Percentage
                    </label>
                    <input
                      type="number"
                      id="discountPercentage"
                      value={currentOffer.discountPercentage}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          discountPercentage: parseFloat(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={currentOffer.startDate}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          startDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={currentOffer.endDate}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          endDate: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      value={currentOffer.status}
                      onChange={(e) =>
                        setCurrentOffer({
                          ...currentOffer,
                          status: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsOfferModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                    >
                      Save Offer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default ProductList;
