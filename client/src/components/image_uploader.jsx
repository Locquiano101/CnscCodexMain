import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Crop,
  Download,
  RotateCcw,
  X,
  UploadCloud,
} from "lucide-react";

export const ProportionCropTool = ({
  onCropComplete = null,
  initialProportion = "1:1",
  maxImageHeight = 400,
  showReset = true,
  acceptedFormats = "image/*",
  className = "",
  title = "",
  cropRef = null, // New prop to expose crop function
}) => {
  const [imagePreview, setImagePreview] = useState(null); // For display only
  const [originalFile, setOriginalFile] = useState(null); // The actual File object
  const [croppedImage, setCroppedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 200,
  });
  const [selectedProportion, setSelectedProportion] =
    useState(initialProportion);
  const [isResizing, setIsResizing] = useState(false);
  const [originalFileName, setOriginalFileName] = useState("");

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cropX: 0,
    cropY: 0,
  });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const imageRef = useRef(null);

  const proportions = {
    FREE: { ratio: null, label: "FREE" },
    "1:1": { ratio: 1, label: "1:1" },
    "4:3": { ratio: 4 / 3, label: "4:3" },
    "16:9": { ratio: 16 / 9, label: "16:9" },
    "3:2": { ratio: 3 / 2, label: "3:2" },
    "3:4": { ratio: 3 / 4, label: "3:4" },
    "2:3": { ratio: 2 / 3, label: "2:3" },
    "9:16": { ratio: 9 / 16, label: "9:16" },
  };

  const calculateProportionalSize = (baseWidth, baseHeight, targetRatio) => {
    if (!targetRatio) return { width: baseWidth, height: baseHeight };

    if (baseWidth / baseHeight > targetRatio) {
      return {
        width: baseHeight * targetRatio,
        height: baseHeight,
      };
    } else {
      return {
        width: baseWidth,
        height: baseWidth / targetRatio,
      };
    }
  };

  const updateCropAreaWithProportion = (newCropArea, ratio) => {
    if (!ratio || !imageRef.current) return newCropArea;

    const rect = imageRef.current.getBoundingClientRect();
    const { width, height } = calculateProportionalSize(
      newCropArea.width,
      newCropArea.height,
      ratio
    );

    const maxX = rect.width - width;
    const maxY = rect.height - height;

    return {
      x: Math.max(0, Math.min(newCropArea.x, maxX)),
      y: Math.max(0, Math.min(newCropArea.y, maxY)),
      width: Math.max(50, width),
      height: Math.max(50, height),
    };
  };

  const updatePreview = useCallback(() => {
    if (!imagePreview || !imageRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const rect = imageRef.current.getBoundingClientRect();
      const scaleX = img.width / rect.width;
      const scaleY = img.height / rect.height;

      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    img.src = imagePreview;
  }, [imagePreview, cropArea]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const cleanFileName = file.name.replace(/\s+/g, "_");
      const fileExtension = cleanFileName.split(".").pop();
      const baseName = cleanFileName.replace(/\.[^/.]+$/, "");
      const uniqueName = `${baseName}-${Date.now()}.${fileExtension}`;

      // Store the actual File object
      setOriginalFile(file);
      setOriginalFileName(uniqueName);

      // Create preview URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize crop area after image loads
  useEffect(() => {
    if (imagePreview && imageRef.current) {
      const timer = setTimeout(() => {
        const rect = imageRef.current.getBoundingClientRect();
        const ratio = proportions[selectedProportion]?.ratio;
        const baseSize = Math.min(rect.width * 0.6, rect.height * 0.6);
        const { width, height } = calculateProportionalSize(
          baseSize,
          baseSize,
          ratio
        );

        setCropArea({
          x: (rect.width - width) / 2,
          y: (rect.height - height) / 2,
          width,
          height,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [imagePreview, selectedProportion]);

  const handleProportionChange = (newProportion) => {
    setSelectedProportion(newProportion);
    const ratio = proportions[newProportion]?.ratio;

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();

      if (!ratio) {
        return;
      }

      const centerX = cropArea.x + cropArea.width / 2;
      const centerY = cropArea.y + cropArea.height / 2;

      const baseSize = Math.max(cropArea.width, cropArea.height);
      const { width, height } = calculateProportionalSize(
        baseSize,
        baseSize,
        ratio
      );

      const newX = Math.max(
        0,
        Math.min(centerX - width / 2, rect.width - width)
      );
      const newY = Math.max(
        0,
        Math.min(centerY - height / 2, rect.height - height)
      );

      setCropArea({
        x: newX,
        y: newY,
        width,
        height,
      });
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    setIsResizing(type);

    if (type === "move") {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        cropX: cropArea.x,
        cropY: cropArea.y,
      });
    } else {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        cropX: 0,
        cropY: 0,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing || !imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const ratio = proportions[selectedProportion]?.ratio;

      if (isResizing === "move") {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const newX = Math.max(
          0,
          Math.min(dragStart.cropX + deltaX, rect.width - cropArea.width)
        );
        const newY = Math.max(
          0,
          Math.min(dragStart.cropY + deltaY, rect.height - cropArea.height)
        );

        setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing === "resize") {
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        const newWidth = Math.max(
          50,
          Math.min(relativeX - cropArea.x, rect.width - cropArea.x)
        );
        const newHeight = Math.max(
          50,
          Math.min(relativeY - cropArea.y, rect.height - cropArea.y)
        );

        const updatedCropArea = updateCropAreaWithProportion(
          { ...cropArea, width: newWidth, height: newHeight },
          ratio
        );
        setCropArea(updatedCropArea);
      }
    },
    [isResizing, cropArea, dragStart, selectedProportion]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Function to create a cropped File object
  const createCroppedFile = async () => {
    if (!previewCanvasRef.current || !originalFile) return null;

    return new Promise((resolve) => {
      previewCanvasRef.current.toBlob((blob) => {
        if (blob) {
          // Create a new File object from the cropped blob
          const fileExtension = originalFile.name.split(".").pop();
          const baseName = originalFile.name.replace(/\.[^/.]+$/, "");
          const croppedFileName = `${baseName}_cropped.${fileExtension}`;

          const croppedFile = new File([blob], croppedFileName, {
            type: originalFile.type,
            lastModified: Date.now(),
          });

          resolve(croppedFile);
        } else {
          resolve(null);
        }
      }, originalFile.type);
    });
  };

  // Main crop function that can be called externally
  const cropImage = async () => {
    if (!previewCanvasRef.current || !originalFile) {
      console.warn("No image to crop or canvas not ready");
      return null;
    }

    const croppedDataUrl = previewCanvasRef.current.toDataURL(
      originalFile.type
    );
    const croppedFile = await createCroppedFile();

    setCroppedImage(croppedDataUrl);

    if (onCropComplete && croppedFile) {
      const rect = imageRef.current.getBoundingClientRect();
      const img = new Image();
      img.onload = () => {
        const scaleX = img.width / rect.width;
        const scaleY = img.height / rect.height;

        const cropData = {
          // Pass the original File object and cropped File object
          originalFile: originalFile,
          croppedFile: croppedFile,
          croppedDataUrl: croppedDataUrl, // Still provide data URL for preview
          proportion: selectedProportion,
          originalFileName: originalFileName,
          cropArea: {
            x: cropArea.x * scaleX,
            y: cropArea.y * scaleY,
            width: cropArea.width * scaleX,
            height: cropArea.height * scaleY,
          },
        };

        onCropComplete(cropData);
      };

      img.src = imagePreview;
    }

    return {
      originalFile,
      croppedFile,
      croppedDataUrl,
      proportion: selectedProportion,
      originalFileName,
    };
  };

  // Expose the crop function via ref
  useEffect(() => {
    if (cropRef) {
      cropRef.current = {
        cropImage,
        hasImage: !!imagePreview,
        resetImage,
      };
    }
  }, [cropRef, imagePreview, cropImage]);

  const resetImage = () => {
    setImagePreview(null);
    setOriginalFile(null);
    setCroppedImage(null);
    setOriginalFileName("");
    setCropArea({ x: 50, y: 50, width: 200, height: 200 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={` ${className}`}>
      {!imagePreview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center text-black transition-colors ${
            isDragging
              ? "border-cnsc-primary-color border bg-blue-900/20"
              : "border-gray-600 hover:border-gray-500 bg-gray-200"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Choose Image
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Camera-style Proportion Buttons */}
          <div className="bg-gray-400 rounded-xl p-4">
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(proportions).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => handleProportionChange(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedProportion === key
                      ? "bg-cnsc-primary-color text-white shadow-lg"
                      : "bg-cnsc-secondary-color text-black hover:text-white hover:bg-red-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image with Crop Area */}
            <div className="space-y-4">
              <div className="flex items-center bg-gray-500 p-2 rounded-lg justify-between">
                <h3 className="text-lg font-semibold text-white">Original</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cnsc-primary-color text-sm rounded-full text-white shadow-lg">
                    {selectedProportion}
                  </span>
                  {showReset && (
                    <button
                      onClick={resetImage}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      title="Reset"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative inline-block border border-gray-700 overflow-hidden bg-black">
                <img
                  ref={imageRef}
                  src={imagePreview}
                  alt="Original"
                  className="max-w-full h-auto block"
                  style={{ maxHeight: `${maxImageHeight}px` }}
                />
                {/* Crop Area Overlay */}
                <div
                  className="absolute border-2 border-cnsc-white-color bg-blue-500/20 cursor-move select-none"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                  }}
                  onMouseDown={(e) => handleMouseDown(e, "move")}
                >
                  {/* Crop Dimensions Display */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-cnsc-primary-color text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                  </div>

                  {/* Resize Handle */}
                  <div
                    className="absolute bottom-0 right-0 w-4 h-4 bg-cnsc-primary-color cursor-se-resize border border-white"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, "resize");
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-4 flex flex-col justify-center items-center">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-lg font-semibold text-white">Preview</h3>
                <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                  Live Preview
                </div>
              </div>
              <div className="border w-fit border-gray-700 bg-black rounded-lg overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full h-auto block"
                  style={{
                    maxHeight: `${maxImageHeight}px`,
                    backgroundColor: "#000",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {showReset && (
              <button
                onClick={resetImage}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default function ImageCropDemo() {
  const cropRef = useRef(null);
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const handleCropComplete = (cropData) => {
    console.log("Crop Complete!", cropData);
    setCroppedPreview(cropData.croppedDataUrl);
    setFileInfo(cropData);
  };

  const handleCropClick = async () => {
    if (cropRef.current?.hasImage) {
      const result = await cropRef.current.cropImage();
      console.log("Manual Crop Triggered", result);
    } else {
      alert("Please select an image first!");
    }
  };

  const handleResetClick = () => {
    cropRef.current?.resetImage();
    setCroppedPreview(null);
    setFileInfo(null);
  };

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center">🖼️ Crop Tool Demo</h2>

      <ProportionCropTool
        cropRef={cropRef}
        onCropComplete={handleCropComplete}
        className="bg-white p-6 rounded-xl shadow-lg"
      />

      <div className="flex justify-center gap-4">
        <button
          onClick={handleCropClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          Crop Image
        </button>
        <button
          onClick={handleResetClick}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          Reset All
        </button>
      </div>

      {croppedPreview && (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">
            🎉 Cropped Image Preview
          </h3>
          <img
            src={croppedPreview}
            alt="Cropped"
            className="inline-block border border-gray-300 rounded-md max-w-full"
            style={{ maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
}
