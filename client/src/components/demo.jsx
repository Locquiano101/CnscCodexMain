// Sample usage component
import React, { useState } from "react";
import { User, Building } from "lucide-react";
import { ReusableFileUpload } from "./file_manager";

export default function FileUploadDemo() {
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Define the fields configuration
  const uploadFields = {
    profilePhoto: {
      label: "Profile Photo",
      accept: "image/*",
    },
    resume: {
      label: "Resume",
      accept: ".pdf,.doc,.docx",
    },
    portfolio: {
      label: "Portfolio Document",
      accept: ".pdf,.zip",
    },
    certificate: {
      label: "Certificate",
      accept: "image/*,.pdf",
    },
  };

  const handleFileChange = (key, files) => {
    console.log(`File changed for ${key}:`, files);
    setUploadedFiles((prev) => ({
      ...prev,
      [key]: files ? files[0] : null,
    }));
  };

  const handleSubmit = () => {
    // Create FormData
    const formData = new FormData();

    // Add each file to FormData with key as 'file' and filename
    Object.entries(uploadedFiles).forEach(([key, file]) => {
      if (file) {
        formData.append("file", file.name);
      }
    });

    // Log FormData contents
    console.log("FormData created:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Example of sending to server
    // fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // });

    alert("FormData created! Check console for details");
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Document Upload Form
        </h1>

        <div className="space-y-6">
          {Object.entries(uploadFields).map(([key, config]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {config.label}
                <span className="text-red-500 ml-1">*</span>
              </label>

              <ReusableFileUpload
                fields={{ [key]: config }}
                onFileChange={handleFileChange}
                required={true}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Documents
          </button>
        </div>

        {/* Display uploaded files summary */}
        {Object.keys(uploadedFiles).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Files Summary:
            </h3>
            <ul className="space-y-1">
              {Object.entries(uploadedFiles).map(
                ([key, file]) =>
                  file && (
                    <li key={key} className="text-sm text-gray-600">
                      <strong>{uploadFields[key]?.label}:</strong> {file.name}
                    </li>
                  )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
