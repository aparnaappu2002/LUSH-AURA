export const createImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = "anonymous"; // Fix CORS issues
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error("Failed to load image: " + err.message));
    });
  };
  
  export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    try {
      // Step 1: Load the image
      const image = await createImage(imageSrc);
      console.log("Image loaded:", image);
  
      // Step 2: Prepare canvas and context
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      // Step 3: Calculate safe area for rotation
      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
      canvas.width = safeArea;
      canvas.height = safeArea;
  
      // Step 4: Rotate the image
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);
  
      ctx.drawImage(
        image,
        safeArea / 2 - image.width / 2,
        safeArea / 2 - image.height / 2
      );
  
      console.log("Image drawn on canvas");
  
      // Step 5: Validate and extract cropped data
      if (
        pixelCrop.x < 0 || 
        pixelCrop.y < 0 || 
        pixelCrop.x + pixelCrop.width > safeArea || 
        pixelCrop.y + pixelCrop.height > safeArea
      ) {
        throw new Error("Crop dimensions are out of bounds");
      }
  
      const croppedData = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
      );
  
      console.log("Image cropped data:", croppedData);
  
      // Step 6: Adjust canvas to cropped size
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.putImageData(croppedData, 0, 0);
  
      // Step 7: Return cropped file
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            console.warn("toBlob failed, falling back to toDataURL");
            const fileUrl = canvas.toDataURL("image/jpeg");
            console.log("Generated Fallback Cropped File URL:", fileUrl);
            resolve(fileUrl);
            return;
          }
          const fileUrl = URL.createObjectURL(blob);
          console.log("Generated Cropped File URL:", fileUrl);
          resolve(fileUrl);
        }, "image/jpeg");
      });
  
    } catch (error) {
      console.error("Crop failed:", error.message);
      throw error; // Re-throw error for handling in the calling function
    }
  };
  