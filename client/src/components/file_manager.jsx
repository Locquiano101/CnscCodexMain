import { X, FileText } from "lucide-react";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  UploadCloud,
  Trash2,
  Crop,
  Download,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { API_ROUTER } from "../App";

const ImageCropper = ({ src, onCrop, onCancel, originalFileName }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState("");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageRect, setImageRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const imageElement = imageRef.current;
      const containerElement = containerRef.current;

      // Get the actual displayed dimensions and position
      const imageDisplayRect = imageElement.getBoundingClientRect();
      const containerDisplayRect = containerElement.getBoundingClientRect();

      // Calculate the image's position relative to the container
      const imageX = imageDisplayRect.left - containerDisplayRect.left;
      const imageY = imageDisplayRect.top - containerDisplayRect.top;
      const imageWidth = imageDisplayRect.width;
      const imageHeight = imageDisplayRect.height;

      setImageRect({
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
      });

      // Set initial crop to center of image
      const cropSize = Math.min(200, imageWidth - 40, imageHeight - 40);
      setCrop({
        x: imageX + (imageWidth - cropSize) / 2,
        y: imageY + (imageHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize,
      });
    }
  };

  const constrainCrop = (newCrop) => {
    return {
      x: Math.max(
        imageRect.x,
        Math.min(newCrop.x, imageRect.x + imageRect.width - newCrop.width)
      ),
      y: Math.max(
        imageRect.y,
        Math.min(newCrop.y, imageRect.y + imageRect.height - newCrop.height)
      ),
      width: Math.max(
        50,
        Math.min(newCrop.width, imageRect.x + imageRect.width - newCrop.x)
      ),
      height: Math.max(
        50,
        Math.min(newCrop.height, imageRect.y + imageRect.height - newCrop.y)
      ),
    };
  };

  const handleMouseDown = (e, action = "drag", handle = "") => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    if (action === "drag") {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    } else if (action === "resize") {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || (!isDragging && !isResizing)) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    if (isDragging) {
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;

      setCrop((prev) =>
        constrainCrop({
          ...prev,
          x: newX,
          y: newY,
        })
      );
    } else if (isResizing) {
      let newCrop = { ...crop };
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      switch (resizeHandle) {
        case "se":
          newCrop.width = crop.width + deltaX;
          newCrop.height = crop.height + deltaY;
          break;
        case "sw":
          newCrop.x = crop.x + deltaX;
          newCrop.width = crop.width - deltaX;
          newCrop.height = crop.height + deltaY;
          break;
        case "ne":
          newCrop.y = crop.y + deltaY;
          newCrop.width = crop.width + deltaX;
          newCrop.height = crop.height - deltaY;
          break;
        case "nw":
          newCrop.x = crop.x + deltaX;
          newCrop.y = crop.y + deltaY;
          newCrop.width = crop.width - deltaX;
          newCrop.height = crop.height - deltaY;
          break;
        case "n":
          newCrop.y = crop.y + deltaY;
          newCrop.height = crop.height - deltaY;
          break;
        case "s":
          newCrop.height = crop.height + deltaY;
          break;
        case "e":
          newCrop.width = crop.width + deltaX;
          break;
        case "w":
          newCrop.x = crop.x + deltaX;
          newCrop.width = crop.width - deltaX;
          break;
      }

      setCrop(constrainCrop(newCrop));
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
  };

  const applyCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = imageRef.current;

    if (!image) return;

    // Calculate the crop area relative to the actual image
    const scaleX = image.naturalWidth / imageRect.width;
    const scaleY = image.naturalHeight / imageRect.height;

    const actualCrop = {
      x: (crop.x - imageRect.x) * scaleX,
      y: (crop.y - imageRect.y) * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };

    canvas.width = actualCrop.width;
    canvas.height = actualCrop.height;

    // Apply transformations
    ctx.save();
    ctx.translate(actualCrop.width / 2, actualCrop.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw the cropped portion
    ctx.drawImage(
      image,
      actualCrop.x,
      actualCrop.y,
      actualCrop.width,
      actualCrop.height,
      -actualCrop.width / 2,
      -actualCrop.height / 2,
      actualCrop.width,
      actualCrop.height
    );

    ctx.restore();

    // Use the original filename instead of extracting from blob URL
    const fileName = originalFileName || "cropped-image.png";

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], fileName, {
        type: "image/png",
      });
      onCrop(croppedFile);
    }, "image/png");
  };

  // Recalculate image position when scale or rotation changes
  useEffect(() => {
    handleImageLoad();
  }, [scale, rotation]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, crop, dragStart, resizeHandle]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh]  flex flex-col justify-center overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Crop Image</h3>

        <div
          ref={containerRef}
          className="relative mb-4 flex justify-center bg-gray-100 max-h-96 "
          style={{ userSelect: "none" }}
        >
          <img
            ref={imageRef}
            src={src}
            alt="Crop preview"
            className="block max-w-full max-h-96 min-h-auto object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* Crop overlay - only show if we have valid image rect */}
          {imageRect.width > 0 && (
            <>
              {/* Dark overlay for non-cropped areas */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top overlay */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    left: 0,
                    top: 0,
                    right: 0,
                    height: crop.y,
                  }}
                />
                {/* Bottom overlay */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    left: 0,
                    right: 0,
                    top: crop.y + crop.height,
                    bottom: 0,
                  }}
                />
                {/* Left overlay */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    left: 0,
                    top: crop.y,
                    width: crop.x,
                    height: crop.height,
                  }}
                />
                {/* Right overlay */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    right: 0,
                    top: crop.y,
                    left: crop.x + crop.width,
                    height: crop.height,
                  }}
                />
              </div>

              {/* Crop area */}
              <div
                className="absolute border-2 border-blue-400 cursor-move"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                  background: "rgba(59, 130, 246, 0.1)",
                }}
                onMouseDown={(e) => handleMouseDown(e, "drag")}
              >
                {/* Corner resize handles */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 cursor-se-resize border border-white"
                  style={{ bottom: -1.5, right: -1.5 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "se")}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 cursor-ne-resize border border-white"
                  style={{ top: -1.5, right: -1.5 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "ne")}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 cursor-nw-resize border border-white"
                  style={{ top: -1.5, left: -1.5 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "nw")}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-500 cursor-sw-resize border border-white"
                  style={{ bottom: -1.5, left: -1.5 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "sw")}
                />

                {/* Side resize handles */}
                <div
                  className="absolute w-full h-2 cursor-n-resize"
                  style={{ top: -1, left: 0 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "n")}
                />
                <div
                  className="absolute w-full h-2 cursor-s-resize"
                  style={{ bottom: -1, left: 0 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "s")}
                />
                <div
                  className="absolute w-2 h-full cursor-w-resize"
                  style={{ left: -1, top: 0 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "w")}
                />
                <div
                  className="absolute w-2 h-full cursor-e-resize"
                  style={{ right: -1, top: 0 }}
                  onMouseDown={(e) => handleMouseDown(e, "resize", "e")}
                />

                {/* Center drag indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Move className="w-6 h-6 text-blue-600 opacity-75" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </button>
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <RotateCw className="w-4 h-4" />
            Rotate
          </button>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={applyCrop}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
          >
            <Crop className="w-4 h-4" />
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReusableFileUpload = ({
  fields, //
  onFileChange,
  onChange,
  required = true,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragOverKey, setDragOverKey] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [previewUrls, setPreviewUrls] = useState({});

  const handleFileUpdate = (key, files) => {
    if (!files || !files[0]) {
      setUploadedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[key];
        return newFiles;
      });
      setPreviewUrls((prev) => {
        const newUrls = { ...prev };
        if (newUrls[key]) {
          URL.revokeObjectURL(newUrls[key]);
          delete newUrls[key];
        }
        return newUrls;
      });
      onFileChange?.(key, null);
      return;
    }

    const file = files[0];
    setUploadedFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    // Create preview URL for images
    if (isImage(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => ({
        ...prev,
        [key]: url,
      }));
    }

    onFileChange?.(key, files);
  };

  const handleDrop = useCallback(
    (e, key) => {
      e.preventDefault();
      setDragOverKey(null);
      const files = e.dataTransfer.files;
      handleFileUpdate(key, files);
    },
    [onFileChange]
  );

  const handleFileInputChange = (key, e) => {
    handleFileUpdate(key, e.target.files);
  };

  const handleDelete = (key) => {
    handleFileUpdate(key, null);
  };

  // Updated handleCrop to include original filename
  const handleCrop = (key) => {
    const file = uploadedFiles[key];
    if (file && isImage(file)) {
      setCropImage({
        key,
        file,
        url: previewUrls[key],
        originalFileName: file.name, // Add this line
      });
    }
  };

  const handleCropComplete = (key, croppedFile) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [key]: croppedFile,
    }));

    // Update preview URL
    const newUrl = URL.createObjectURL(croppedFile);
    setPreviewUrls((prev) => {
      if (prev[key]) {
        URL.revokeObjectURL(prev[key]);
      }
      return {
        ...prev,
        [key]: newUrl,
      };
    });

    onFileChange?.(key, [croppedFile]);
    setCropImage(null);
  };

  const triggerFileInput = (key) => {
    const input = document.getElementById(`file-input-${key}`);
    if (input) input.click();
  };

  const downloadFile = (key) => {
    const file = uploadedFiles[key];
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const isImage = (file) => file && file.type.startsWith("image/");

  return (
    <div className={`space-y-2 px-3 py-2 bg-white rounded-2xl`}>
      {Object.entries(fields).map(([key, { label, accept }]) => {
        const file = uploadedFiles[key];
        const isDragging = dragOverKey === key;
        const isDisabled = Boolean(file);
        const previewUrl = previewUrls[key];

        return (
          <div key={key}>
            <div className="flex flex-col gap-4">
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverKey(key);
                  }}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={(e) => handleDrop(e, key)}
                  onClick={() => !isDisabled && triggerFileInput(key)}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-500 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                  <p className="text-gray-700 text-sm text-center">
                    Drag & drop or{" "}
                    <span className="text-blue-600 underline">
                      click to upload
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {accept || "All files accepted"}
                  </p>
                  <input
                    id={`file-input-${key}`}
                    type="file"
                    accept={accept}
                    disabled={isDisabled}
                    onChange={(e) => handleFileInputChange(key, e)}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  {isImage(file) && previewUrl ? (
                    <div className="space-y-4 flex justify-center relative ">
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="max-h-64 max-w-full object-contain rounded shadow-sm"
                        />
                        <div className=" absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleCrop(key)}
                            className="flex p-1 px-2 rounded-lg bg-white text-sm text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-500 items-center justify-center"
                          >
                            <Crop className="w-4 h-4 mr-2" />
                            Crop
                          </button>
                          <button
                            onClick={() => handleDelete(key)}
                            className="flex p-1 px-2 rounded-lg bg-white text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-500 items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2 " />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl">📄</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadFile(key)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(key)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Updated ImageCropper usage to pass originalFileName */}
      {cropImage && (
        <ImageCropper
          src={cropImage.url}
          originalFileName={cropImage.originalFileName} // Add this line
          onCrop={(croppedFile) =>
            handleCropComplete(cropImage.key, croppedFile)
          }
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
};
export const ReusableMultiFileUpload = ({ fields, onFileChange }) => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragOverKey, setDragOverKey] = useState(null);

  const handleFileUpdate = (key, files) => {
    const newFiles = files && files.length ? Array.from(files) : [];
    setUploadedFiles((prev) => {
      const combined = [...(prev[key] || []), ...newFiles];
      onFileChange?.(key, combined);
      return { ...prev, [key]: combined };
    });
  };

  const handleDrop = useCallback((e, key) => {
    e.preventDefault();
    setDragOverKey(null);
    handleFileUpdate(key, e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (key, e) => {
    handleFileUpdate(key, e.target.files);
  };

  const handleDelete = (key, index) => {
    setUploadedFiles((prev) => {
      const newArray = (prev[key] || []).filter((_, i) => i !== index);
      onFileChange?.(key, newArray);
      return { ...prev, [key]: newArray };
    });
  };

  const triggerFileInput = (key) => {
    const input = document.getElementById(`file-input-multiple-${key}`);
    if (input) input.click();
  };

  const isImage = (file) => file?.type.startsWith("image/");
  const getPreviewUrl = (file) => URL.createObjectURL(file);

  return (
    <div>
      {Object.entries(fields).map(([key, { label, accept }]) => {
        const filesArray = uploadedFiles[key] || [];
        const isDragging = dragOverKey === key;

        return (
          <div key={key} className="flex flex-col gap-2 py-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            <div className="flex flex-wrap gap-1 justify-between border border-dashed rounded p-2">
              {filesArray.map((file, index) => (
                <div key={index} className="relative flex-shrink-0">
                  {isImage(file) ? (
                    <img
                      src={getPreviewUrl(file)}
                      alt={file.name}
                      className="h-32 w-auto rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-36 border flex flex-col items-center justify-center p-4 h-full">
                      <LucideFile className="text-2xl text-black" />
                      <h1>{file.name}</h1>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(key, index)}
                    className="absolute top-2 right-3 text-red-500 hover:text-red-700"
                    title="Delete file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverKey(key);
                }}
                onDragLeave={() => setDragOverKey(null)}
                onDrop={(e) => handleDrop(e, key)}
                onClick={() => triggerFileInput(key)}
                className={`flex-shrink-0 w-42 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition ${
                  isDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <Plus className="text-2xl text-gray-500 mb-1" />
                <p className="text-gray-500 text-xs text-center">Add files</p>
                <input
                  id={`file-input-multiple-${key}`}
                  type="file"
                  accept={accept}
                  multiple
                  onChange={(e) => handleFileInputChange(key, e)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DocumentViewer = ({ fileUrl }) => {
  return (
    <div>
      {/* For images */}
      <img src={`${API_ROUTER}/${fileUrl}`} alt="Document" width="400" />

      {/* For PDF */}
      <iframe
        src={`${API_ROUTER}/${fileUrl}`}
        width="100%"
        height="600px"
        title="PDF Viewer"
      ></iframe>
    </div>
  );
};

export const FileRenderer = ({ basePath, fileName }) => {
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/.test(fileName);
  const raw = `${basePath}/${isImage ? "photos" : "documents"}/${fileName}`;
  const url = encodeURI(raw);

  const [showModal, setShowModal] = useState(false);
  if (isImage) {
    return (
      <div className="object-cover h-70 object-center  rounded-lg flex-shrink-0 flex flex-wrap relative overflow-hidden">
        <img
          src={url}
          alt={fileName}
          className="w-full h-70x-2 rounded-lg object-cover cursor-pointer"
          onClick={() => setShowModal(true)}
        />

        {showModal && (
          <div
            className="fixed inset-0 bg-black/25 w-full bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <X className="w-8 h-8 text-red-600 absolute top-2 right-4 cursor-pointer" />

              <img
                src={url}
                alt={fileName}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=" p-2 w-full space-y-4 flex flex-col justify-center items-center rounded-lg shadow-md bg-white">
      <FileText className="w-12 h-12 text-gray-800" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 text-md underline h-full"
      >
        (preview) - {fileName}
      </a>
    </div>
  );
};

export const FileRendererPinned = ({ basePath, fileName }) => {
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/.test(fileName);
  const url = encodeURI(basePath);

  const [showModal, setShowModal] = useState(false);
  if (isImage) {
    return (
      <div className="object-cover  rounded-lg flex-shrink-0 flex flex-wrap relative">
        <img
          src={url}
          alt={fileName}
          className="h-100 w-auto mx-2 rounded-lg object-cover cursor-pointer"
          onClick={() => setShowModal(true)}
        />

        {showModal && (
          <div
            className="fixed inset-0 bg-black/25 w-full bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <X
                className="w-8 h-8 text-red-600 absolute top-2 right-4 cursor-pointer"
                onClick={() => setShowModal(false)}
              />

              <img
                src={url}
                alt={fileName}
                className="h-full w-full  rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=" p-2 w-full space-y-4 flex flex-col justify-center items-center rounded-lg shadow-md bg-white">
      <FileText className="w-12 h-12 text-gray-800" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 text-md underline h-full"
      >
        (preview) - {fileName}
      </a>
    </div>
  );
};

export const FileRendererAll = ({ basePath, fileName }) => {
  const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileName);
  const url = encodeURI(basePath);

  const [showModal, setShowModal] = useState(false);
  if (isImage) {
    return (
      <div className="object-cover rounded-lg ">
        <img
          src={url}
          alt={fileName}
          className="w-full h-full rounded-lg object-cover cursor-pointer"
          onClick={() => setShowModal(true)}
        />

        {showModal && (
          <div
            className="fixed inset-0 bg-black/25 w-full bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <X
                className="w-8 h-8 text-red-600 absolute top-2 right-4 cursor-pointer"
                onClick={() => setShowModal(false)}
              />
              <img
                src={url}
                alt={fileName}
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className=" p-2 w-full flex flex-col justify-center items-center rounded-lg  bg-white">
      <FileText className="w-12 h-12 text-gray-800" />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 text-md underline h-full"
      >
        (preview) - {fileName}
      </a>
    </div>
  );
};

export function DocumentSection({ title, files, basePath }) {
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  if (!files || (Array.isArray(files) && files.length === 0)) {
    return (
      <section>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="italic text-sm">None</p>
      </section>
    );
  }

  const fileList = Array.isArray(files) ? files : [files];

  return (
    <section className="border p-4 rounded shadow-sm mb-6 bg-gray-50">
      <h3 className="font-semibold mb-2">{title}</h3>

      <div className="space-y-2 mb-4">
        {fileList.map((file, i) => (
          <FileRenderer key={i} basePath={basePath} fileName={file} />
        ))}
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              name={`${title}-status`}
              value="approved"
              checked={status === "approved"}
              onChange={() => setStatus("approved")}
            />
            <span className="ml-1">Approved</span>
          </label>
          <label>
            <input
              type="radio"
              name={`${title}-status`}
              value="revision"
              checked={status === "revision"}
              onChange={() => setStatus("revision")}
            />
            <span className="ml-1">Revision</span>
          </label>
        </div>

        {status === "revision" && (
          <textarea
            className="w-full h-24 border rounded p-2"
            placeholder="Enter revision notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
      </div>
    </section>
  );
}

export function ProfilePictureRenderer({ OrgName, OrgLogo }) {
  console.log("alshdask", OrgName);
  const path = `/${OrgName}/Accreditation/Accreditation/photos/${OrgLogo}  `;

  return (
    <img
      src={OrgLogo ? path : "/general/cnsc_codex_ver_2.svg"}
      className="h-full w-full rounded-full aspect-square object-cover"
      alt="Organization Logo"
      onError={(e) => {
        e.target.src = "/general/default-org-logo.svg";
      }}
    />
  );
}
