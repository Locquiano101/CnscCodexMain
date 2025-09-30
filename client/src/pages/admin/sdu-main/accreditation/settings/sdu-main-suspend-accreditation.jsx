import axios from "axios";
import { AlertTriangle, Building, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

export function SuspendAccreditationProcess({ onCancel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalConfirmModal, setShowFinalConfirmModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const getAllOrganizationProfile = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      setOrgs(res.data || []);
    } catch (error) {
      console.error("Error fetching orgs:", error);
    }
  };

  useEffect(() => {
    getAllOrganizationProfile();
  }, []);

  const handleSelect = (org) => {
    setSelectedOrg(org);
    setIsOpen(false);
  };

  const handleRevokeClick = () => {
    if (!selectedOrg) {
      alert("Please select an organization first");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFirstConfirm = () => {
    setShowConfirmModal(false);
    setShowFinalConfirmModal(true);
  };

  const handleFinalConfirm = async () => {
    setIsRevoking(true);
    try {
      await axios.post(`${API_ROUTER}/revokeAccreditation/${selectedOrg._id}`);
      alert("Accreditation revoked successfully");
      setShowFinalConfirmModal(false);
      setSelectedOrg(null);
      // Optionally refresh the org list
      await getAllOrganizationProfile();
    } catch (error) {
      console.error("Error revoking accreditation:", error);
      alert("Failed to revoke accreditation. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
      <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Organizations Found
      </h3>
      <p className="text-gray-500">
        There are no active organizations available at the moment.
      </p>
    </div>
  );

  // --- Cancel button handler ---
  const handleCancel = () => {
    if (onCancel) onCancel(); // ✅ call parent cancel
  };

  if (orgs.length === 0) {
    return (
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Organization
          </label>
        </div>
        <EmptyState />
        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  const OrganizationOption = ({ org, isSelected = false }) => (
    <div
      className={`
        flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
        hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
      `}
      onClick={() => handleSelect(org)}
    >
      <div className="relative">
        {org.orgLogo ? (
          <img
            src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
            alt={org.orgAcronym}
            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
            org.orgLogo ? "hidden" : "flex"
          }`}
        >
          {org.orgAcronym || org.orgName?.charAt(0) || "?"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{org.orgName}</h3>
        {org.orgAcronym && (
          <p className="text-sm text-gray-500 truncate">{org.orgAcronym}</p>
        )}
      </div>
      {isSelected && (
        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="h-3 w-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );

  // First Confirmation Modal
  const FirstConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-yellow-600" size={28} />
          <h3 className="text-xl font-semibold">Confirm Revocation</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to revoke accreditation for{" "}
          <strong>{selectedOrg?.orgName}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFirstConfirm}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Final Confirmation Modal
  const FinalConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={28} />
          <h3 className="text-xl font-semibold">Final Confirmation</h3>
        </div>
        <p className="text-gray-600 mb-4">
          This action cannot be undone. The accreditation for{" "}
          <strong>{selectedOrg?.orgName}</strong> will be permanently revoked.
        </p>
        <p className="text-red-600 font-semibold mb-6">
          Are you absolutely sure?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFinalConfirmModal(false)}
            disabled={isRevoking}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFinalConfirm}
            disabled={isRevoking}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isRevoking ? "Revoking..." : "Revoke"}
          </button>
        </div>
      </div>
    </div>
  );

  if (orgs.length === 0) {
    return (
      <div className="p-4">
        <div className="mb-3">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Organization
          </label>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Organization to Revoke Accreditation
        </label>

        <div className="relative">
          {/* Selected Organization Display */}
          <div
            className={`
            bg-white shadow-lg border-2 cursor-pointer transition-all duration-200
            ${
              isOpen
                ? "border-blue-500 rounded-t-2xl"
                : "border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg"
            }
          `}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="p-4 flex items-center gap-4">
              {selectedOrg ? (
                <>
                  <div className="relative">
                    {selectedOrg.orgLogo ? (
                      <img
                        src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${selectedOrg.orgLogo}`}
                        alt={selectedOrg.orgAcronym}
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm ${
                        selectedOrg.orgLogo ? "hidden" : "flex"
                      }`}
                    >
                      {selectedOrg.orgAcronym ||
                        selectedOrg.orgName?.charAt(0) ||
                        "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {selectedOrg.orgName}
                    </h3>
                    {selectedOrg.orgAcronym && (
                      <p className="text-sm text-gray-500 truncate">
                        {selectedOrg.orgAcronym}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-500 font-medium">
                      Choose an organization...
                    </span>
                  </div>
                </>
              )}
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute z-50 w-full rounded-b-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {/* Clear Selection Option */}
                <div
                  className={`
                  flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
                  hover:bg-red-50 hover:border-l-4 hover:border-l-red-500 border-b border-gray-100
                  ${!selectedOrg ? "bg-red-50 border-l-4 border-l-red-500" : ""}
                `}
                  onClick={() => handleSelect(null)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-700">None</h3>
                    <p className="text-sm text-gray-500">Clear selection</p>
                  </div>
                  {!selectedOrg && (
                    <div className="h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Organization Options */}
                {orgs.map((org) => (
                  <OrganizationOption
                    key={org._id}
                    org={org}
                    isSelected={selectedOrg?._id === org._id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
        {/* Revoke Button */}
        <button
          onClick={handleRevokeClick}
          disabled={!selectedOrg}
          className="mt-6 w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Revoke Accreditation
        </button>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          className="mt-3 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>

        {/* Modals */}
        {showConfirmModal && <FirstConfirmModal />}
        {showFinalConfirmModal && <FinalConfirmModal />}
      </div>
    </div>
  );
}
