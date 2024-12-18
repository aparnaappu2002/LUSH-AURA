import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../axios/adminAxios';
import { PlusIcon, PencilIcon, TrashIcon, XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import cloudAxios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 16 / 9 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageIndex, setImageIndex] = useState(null);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    status: 'active',
    image: null,
    highlights: '',
    specifications: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/productlist');
      console.log("Products:", response.data.products);
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    }
  };

  const handleAddProduct = () => {
    navigate('/addproduct');
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
      highlights: productToEdit.highlights || '',
      specifications: productToEdit.specifications || '',
      image: null
    });
    setUploadedImages(productToEdit.productImage.map(url => ({ url, isExisting: true })));
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
          imageData.append('file', img.file);
          imageData.append('upload_preset', 'lush_aura');
          imageData.append("cloud_name", "dzpf5joxo");

          const cloudinaryResponse = await cloudAxios.post(
            'https://api.cloudinary.com/v1_1/dzpf5joxo/image/upload',
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
      };

      console.log("Final FormData to be submitted:", payload);

      if (editingProduct) {
        await axios.put(`/editproduct/${editingProduct._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/addproduct', payload);
        toast.success('Product added successfully');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleChange = (e) => {
    const { name, files } = e.target;
    if (name === 'image' && files && files.length > 0) {
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
      setCrop({ unit: '%', width: 30, aspect: 16 / 9 });
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
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

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
          setUploadedImages((prevImages) => {
            const newImages = [...prevImages];
            newImages[imageIndex] = { 
              ...(newImages[imageIndex].isExisting ? { isExisting: true } : {}),
              file: blob, 
              preview: croppedImageUrl 
            };
            return newImages;
          });
          closeCropModal();
        }, 'image/jpeg');
      };
    }
  }, [completedCrop, imageToCrop, imageIndex]);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-pink-800">Beauty Product Management</h1>
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
                <th className="py-3 px-4 text-left text-pink-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-pink-50 transition-colors duration-150">
                    <td className="py-3 px-4">
                      <img
                        src={product.productImage[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-full border-2 border-pink-200"
                      />
                    </td>
                    <td className="py-3 px-4 text-pink-800">{product.title}</td>
                    <td className="py-3 px-4 text-pink-800">₹{product.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-white ${
                          product.status === "active" ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-pink-600 hover:text-pink-800 mr-2 transition-colors duration-150"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-pink-800">
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-pink-100 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-pink-800">
                  {editingProduct ? 'Edit' : 'Add'} Beauty Product
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-pink-500 hover:text-pink-700">
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-pink-700">Name</label>
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
                  <label htmlFor="description" className="block text-sm font-medium text-pink-700">Description</label>
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
                  <label htmlFor="price" className="block text-sm font-medium text-pink-700">Price</label>
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
                  <label htmlFor="status" className="block text-sm font-medium text-pink-700">Status</label>
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
                  <label htmlFor="highlights" className="block text-sm font-medium text-pink-700">
                    Highlights
                  </label>
                  <textarea
                    id="highlights"
                    name="highlights"
                    value={formData.highlights || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="specifications" className="block text-sm font-medium text-pink-700">
                    Specifications
                  </label>
                  <textarea
                    id="specifications"
                    name="specifications"
                    value={formData.specifications || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-pink-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-pink-700">Current Images</label>
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
                    <p className="text-sm text-pink-600">No images uploaded.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-pink-700">Upload New Image</label>
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
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-pink-800 mb-4">Confirm Edit</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to edit this product?</p>
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
              <h2 className="text-2xl font-bold text-pink-800 mb-4">Crop Image</h2>
              <div className="max-h-[60vh] overflow-auto">
                <ReactCrop
                  src={imageToCrop}
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={(c) => onCropComplete(c)}
                >
                  <img src={imageToCrop} alt="Crop preview" style={{ maxWidth: '100%', maxHeight: '60vh' }} />
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
      </div>
    </div>
  );
}

export default ProductList;

