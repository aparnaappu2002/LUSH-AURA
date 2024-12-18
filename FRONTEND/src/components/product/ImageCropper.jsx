import React from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';

const ImageCropper = ({ image, crop, setCrop, zoom, setZoom, rotation, setRotation, onCropComplete }) => {
  return (
    <div className="relative w-full h-96">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onCropComplete={onCropComplete}
      />

      {/* Zoom Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4"
      >
        <label className="text-sm text-gray-600">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
          className="w-32"
        />
      </motion.div>
    </div>
  );
};

export default ImageCropper;
