import React, { useState } from "react";
import { Plus, FileText, Images, X, Upload, Trash2, Tag } from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

export function StudentLeaderAddPost({ orgData, Modal }) {
  const [postType, setPostType] = useState(null); // "document" or "photos"
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const AVAILABLE_TAGS = [
    "Announcement",
    "Update",
    "Event",
    "Reminder",
    "General",
  ];

  const MAX_IMAGES = 10; // Image limit

  const handleFileChange = (e) => {
    if (!e.target.files) return;

    if (postType === "photos") {
      const newFiles = Array.from(e.target.files);
      const totalFiles = files.length + newFiles.length;

      if (totalFiles > MAX_IMAGES) {
        alert(
          `You can only upload a maximum of ${MAX_IMAGES} images. Please select fewer files.`
        );
        return;
      }

      setFiles([...files, ...newFiles]);
    } else {
      setFiles([e.target.files[0]]); // single doc
    }

    // Clear the input value so the same file can be selected again if needed
    e.target.value = "";
  };
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleSubmit = async () => {
    if (!postType || files.length === 0) {
      alert("Please select a post type and upload at least one file.");
      return;
    }
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    try {
      const formData = new FormData();
      formData.append("postType", postType);
      formData.append("organization", orgData.organization);
      formData.append("organizationProfile", orgData._id);

      formData.append("caption", caption);
      formData.append("label", "posts");
      formData.append("tags", JSON.stringify(selectedTags)); // ✅ send tags as JSON

      formData.append(
        "logs",
        `${orgData.orgName} added a new post at ${formattedDate}`
      );
      // Append files
      files.forEach((file, index) => {
        formData.append("files", file); // backend should accept `files[]`
      });

      // 🔎 Debug log
      console.log("Submitting FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // ✅ Send with axios
      const response = await axios.post(
        `${API_ROUTER}/postPublicInformation`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Post created:", response.data);
      alert("Post created successfully!");

      // Reset form after submit
      Modal();
      setPostType(null);
      setFiles([]);
      setCaption("");
    } catch (error) {
      console.error("❌ Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const canAddMore = () => {
    if (postType === "document") return files.length === 0;
    if (postType === "photos") return files.length < MAX_IMAGES;
    return true;
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm absolute inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6  w-3/4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Plus className="text-amber-600" size={28} />
          Create Post
        </h2>

        {/* Choose type */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => {
              setPostType("document");
              setFiles([]);
            }}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              postType === "document"
                ? "bg-amber-50 border-amber-500 text-amber-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={24} />
            <div className="text-center">
              <div className="font-medium">Document</div>
              <div className="text-xs opacity-75">Upload 1 file</div>
            </div>
          </button>
          <button
            onClick={() => {
              setPostType("photos");
              setFiles([]);
            }}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              postType === "photos"
                ? "bg-amber-50 border-amber-500 text-amber-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Images size={24} />
            <div className="text-center">
              <div className="font-medium">Photos</div>
              <div className="text-xs opacity-75">
                Upload multiple (max: {MAX_IMAGES} images)
              </div>
            </div>
          </button>
        </div>

        {/* 🔖 Tags Section */}
        <div className="mb-6">
          <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag size={16} className="text-amber-600" /> Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Selected: {selectedTags.join(", ")}
            </div>
          )}
        </div>
        {/* File upload area - only show if can add more files */}
        {postType && canAddMore() && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {postType === "document" ? "Upload Document" : "Upload Photos"}
            </label>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-3" size={32} />
              <div className="text-gray-600 mb-2">
                {postType === "document"
                  ? "Choose a document file"
                  : `Choose photos (${files.length}/${MAX_IMAGES} selected)`}
              </div>
              <div className="text-xs text-gray-500 mb-4">
                {postType === "document"
                  ? "PDF, DOC, DOCX files supported"
                  : "JPG, PNG, GIF files supported"}
              </div>
              <input
                type="file"
                accept={postType === "document" ? ".pdf,.doc,.docx" : "image/*"}
                multiple={postType === "photos"}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-amber-700 transition-colors"
              >
                Select {postType === "document" ? "File" : "Files"}
              </label>
            </div>
          </div>
        )}

        {/* File preview */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-700">
                {postType === "document"
                  ? "Selected Document:"
                  : `Selected Photos (${files.length}/${MAX_IMAGES}):`}
              </div>
              <button
                onClick={clearAllFiles}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>

            {postType === "document" ? (
              // Document preview
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="text-amber-600" size={20} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{files[0].name}</div>
                  <div className="text-xs text-gray-500">
                    {(files[0].size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <button
                  onClick={() => removeFile(0)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              // Photos preview
              <div className="flex gap-4 overflow-x-auto p-4 ">
                {files.map((file, index) => (
                  <div key={index} className="relative group flex-shrink-0">
                    <div className="aspect-auto h-64 rounded-lg overflow-hidden bg-gray-100">
                      {getFilePreview(file) ? (
                        <img
                          src={getFilePreview(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Images className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="text-xs text-gray-600 mt-1 truncate max-w-[7rem]">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show message when limit is reached for photos */}
            {postType === "photos" && files.length >= MAX_IMAGES && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-800">
                  Maximum number of images reached ({MAX_IMAGES}/{MAX_IMAGES}).
                  Remove some images to add more.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <textarea
            placeholder="Write a caption for your post..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {caption.length}/500 characters
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setPostType(null);
              setFiles([]);
              setCaption("");
            }}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!postType || files.length === 0}
            className="flex-1 bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
}
