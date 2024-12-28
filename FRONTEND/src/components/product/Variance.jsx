import React, { useState, useCallback, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const VarianceModal = ({ isOpen, onClose, onSave }) => {
  const [variance, setVariance] = useState({
    size: '',
    color: '',
    quantity: 0,
    price: 0,
    images: []
  });
  const [errors, setErrors] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setVariance(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setVariance(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (variance.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (variance.price <= 0) newErrors.price = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cropImage = useCallback(() => {
    if (completedCrop && currentImageIndex !== null && imgRef.current) {
      const image = imgRef.current;
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
        setVariance(prev => {
          const newImages = [...prev.images];
          newImages[currentImageIndex] = {
            ...newImages[currentImageIndex],
            cropped: croppedImageUrl
          };
          return { ...prev, images: newImages };
        });
        setCurrentImageIndex(null);
      }, 'image/jpeg');
    }
  }, [completedCrop, currentImageIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(variance);
      onClose();
    }
  };

  const removeImage = (index) => {
    setVariance(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Variance</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Size</label>
            <input
              type="text"
              name="size"
              value={variance.size}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7b437e] border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="text"
              name="color"
              value={variance.color}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7b437e] border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={variance.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7b437e] ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={variance.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7b437e] ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#7b437e] border-gray-300"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {variance.images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.cropped || img.preview}
                  alt={`Variance ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  X
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full"
                >
                  Crop
                </button>
              </div>
            ))}
          </div>
          {currentImageIndex !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg max-w-2xl w-full">
                <ReactCrop
                  src={variance.images[currentImageIndex].preview}
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                >
                  <img
                    ref={imgRef}
                    src={variance.images[currentImageIndex].preview}
                    alt="Crop preview"
                    style={{ maxHeight: '70vh' }}
                  />
                </ReactCrop>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={cropImage}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Crop
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#7b437e] text-white rounded hover:bg-[#693769]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VarianceModal;

