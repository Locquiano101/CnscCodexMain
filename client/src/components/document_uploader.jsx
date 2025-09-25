import React, { useState, useRef } from "react";
import { Upload, X, RotateCcw, FileText, FileMinus } from "lucide-react";

export default function DocumentUploader({
  onFileSelect = null,
  showReset = true,
  className = "",
  acceptedFormats = "application/pdf",
  title = "Upload PDF Document",
}) {
  const [fileData, setFileData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    setFileData({
      name: file.name,
      size: (file.size / 1024).toFixed(2), // in KB
      file,
    });

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const resetFile = () => {
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {!fileData ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center text-black bg-gray-100 hover:bg-gray-200 transition-colors`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">{title}</h2>

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
            Choose PDF File
          </button>
        </div>
      ) : (
        <div className="space-y-4 bg-white border border-gray-300 p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Selected Document</h3>
            {showReset && (
              <button
                onClick={resetFile}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Filename:</strong> {fileData.name}
            </p>
            <p>
              <strong>Size:</strong> {fileData.size} KB
            </p>
          </div>
          {showReset && (
            <button
              onClick={resetFile}
              className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentDisplayCard({
  name = null,
  size = null,
  downloadUrl = null, // Direct link or route for the file
  className = "",
}) {
  if (!name && !size && !downloadUrl) {
    return (
      <div className="flex items-center gap-4">
        <FileMinus size={32} />
        <p className="text-gray-500 italic">No document available.</p>
      </div>
    );
  }

  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = name || "document.pdf"; // fallback
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={handleDownload}
      className={`flex items-start gap-4 p-4 bg-white border rounded-xl shadow cursor-pointer hover:bg-gray-50 transition ${className}`}
      title="Click to download"
    >
      <div className="text-blue-600 bg-blue-100 rounded-full p-2">
        <FileText className="w-6 h-6" />
      </div>

      <div className="flex-1 space-y-1">
        {name && <p className="font-medium text-gray-800">{name}</p>}
        {size && <p className="text-sm text-gray-500">Size: {size}</p>}
      </div>
    </div>
  );
}

export function FileRenderer({ basePath, fileName }) {
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
}
