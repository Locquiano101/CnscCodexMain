import React, { useState } from "react";
import {
  Plus,
  FileText,
  Images,
  X,
  Upload,
  Trash2,
  Tag,
  Check,
} from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function StudentLeaderAddPost({ orgData, Modal }) {
  const [postType, setPostType] = useState(null);
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
  const MAX_IMAGES = 10;

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    if (postType === "photos") {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > MAX_IMAGES) {
        alert(`Max ${MAX_IMAGES} images allowed.`);
        return;
      }
      setFiles([...files, ...newFiles]);
    } else {
      setFiles([e.target.files[0]]);
    }
    e.target.value = "";
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeFile = (i) => setFiles(files.filter((_, idx) => idx !== i));
  const clearAllFiles = () => setFiles([]);

  const handleSubmit = async () => {
    if (!postType || files.length === 0) {
      alert("Please select a post type and upload at least one file.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("postType", postType);
      formData.append("organization", orgData.organization);
      formData.append("organizationProfile", orgData._id);
      formData.append("caption", caption);
      formData.append("label", "posts");
      formData.append("tags", JSON.stringify(selectedTags));

      files.forEach((file) => formData.append("files", file));

      await axios.post(`${API_ROUTER}/postPublicInformation`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Post created!");
      Modal();
      setPostType(null);
      setFiles([]);
      setCaption("");
      setSelectedTags([]);
    } catch (err) {
      alert("❌ Failed to create post.");
      console.error(err);
    }
  };

  const getFilePreview = (file) =>
    file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

  const canAddMore = () =>
    postType === "document" ? files.length === 0 : files.length < MAX_IMAGES;

  return (
    <Dialog open={true} onOpenChange={Modal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus className="text-amber-600" /> Create Post
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">{/* Post Type */}
          {/* Post Type */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Choose Post Type
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPostType("document");
                  setFiles([]);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  postType === "document"
                    ? "bg-amber-50 border-amber-500 text-amber-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileText size={28} />
                <span className="font-medium">Document</span>
                <span className="text-xs opacity-70">Upload 1 file</span>
              </button>
              <button
                onClick={() => {
                  setPostType("photos");
                  setFiles([]);
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  postType === "photos"
                    ? "bg-amber-50 border-amber-500 text-amber-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Images size={28} />
                <span className="font-medium">Photos</span>
                <span className="text-xs opacity-70">
                  Max {MAX_IMAGES} images
                </span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-amber-600" /> Select Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {selectedTags.includes(tag) && <Check size={14} />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          {postType && canAddMore() && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                {postType === "document" ? "Upload Document" : "Upload Photos"}
              </h3>
              <label
                htmlFor="file-upload"
                className="block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 transition"
              >
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">
                  {postType === "document"
                    ? "Click to select a document"
                    : "Click to select photos"}
                </p>
                <p className="text-xs text-gray-400">
                  {postType === "document" ? "PDF, DOC, DOCX" : "JPG, PNG, GIF"}
                </p>
              </label>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={postType === "document" ? ".pdf,.doc,.docx" : "image/*"}
                multiple={postType === "photos"}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* File Preview */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  {postType === "document"
                    ? "Selected Document"
                    : `Selected Photos (${files.length}/${MAX_IMAGES})`}
                </span>
                <button
                  onClick={clearAllFiles}
                  className="text-red-600 text-xs flex items-center gap-1 hover:underline"
                >
                  <Trash2 size={12} /> Clear All
                </button>
              </div>

              {postType === "document" ? (
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
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      <img
                        src={getFilePreview(file)}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Caption */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Caption
            </h3>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write something..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {caption.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 border-t bg-gray-50">
          <div className="flex gap-3 w-full">
            <Button
              onClick={Modal}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!postType || files.length === 0}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Create Post
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
