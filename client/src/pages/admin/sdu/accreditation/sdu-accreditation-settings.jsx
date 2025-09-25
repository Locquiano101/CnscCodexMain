import { useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";

export function SduAccreditationSettings() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    setShowConfirm(true); // Show confirmation popup
  };

  const handleConfirm = async () => {
    setShowConfirm(false); // Hide popup
    try {
      const res = await axios.post(`${API_ROUTER}/DeactivateAllAccreditation`);
      console.log("Axios response:", res.data);
      alert("All accreditations have been reset.");
    } catch (error) {
      console.error("Axios error:", error);
      alert("Failed to reset accreditations.");
    }
  };

  const handleCancel = () => {
    setShowConfirm(false); // Close popup without doing anything
  };

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Reset Accreditation
      </button>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure?
            </h2>
            <p className="text-gray-600 mb-6">
              This will deactivate all accreditations. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
