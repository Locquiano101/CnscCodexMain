import axios from "axios";
import { AlertTriangle, Building, ChevronDown, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

// Organization Option Component
function OrganizationOption({ org, isSelected, onClick }) {
  return (
    <div
      className={`
        flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
        hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 border-b border-gray-100
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
      `}
      onClick={() => onClick(org)}
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
}

export function SuspendAccreditationProcess({ onCancel }) {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [step, setStep] = useState(0);
  const [warningNote, setWarningNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getAllOrganizationProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
        setOrgs(res.data || []);
      } catch (err) {
        console.error("Error fetching orgs:", err);
        setError("Failed to load organizations. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    getAllOrganizationProfile();
  }, []);

  const handleSelectOrg = (org) => {
    setSelectedOrg(org);
    setIsOpen(false);
  };

  const handleSelect = (org) => {
    setSelectedOrg(org);
    setIsOpen(false);
  };

  const handleClose = () => {
    setStep(0);
    setSelectedOrg(null);
    setWarningNote("");
    setIsSubmitting(false);
    setError(null);
    if (onCancel) onCancel();
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleRevokeClick = () => {
    if (selectedOrg) {
      setStep(1);
    }
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    if (!selectedOrg || !warningNote.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_ROUTER}/SduMainAccreditationSuspension`,
        {
          organizationProfileId: selectedOrg._id,
          organizationId: selectedOrg.organization,
          warningNote: warningNote.trim(),
        }
      );

      console.log(res);
      handleClose();
    } catch (err) {
      console.error("Error issuing warning:", err);
      setError("Failed to issue warning. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Organization to Revoke Accreditation
        </label>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : error && orgs.length === 0 ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        ) : (
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
                      ${
                        !selectedOrg
                          ? "bg-red-50 border-l-4 border-l-red-500"
                          : ""
                      }
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
                      onClick={handleSelectOrg}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

        {/* First Confirmation Modal */}
        {step === 1 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Confirm Warning Action
                </h2>
              </div>

              <div className="p-8">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                    Organization Details
                  </p>
                  <p className="font-bold text-xl text-slate-900 mb-2">
                    {selectedOrg?.orgName}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                    <span className="font-semibold">
                      {selectedOrg?.orgAcronym}
                    </span>
                    {selectedOrg?.orgClass && (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>{selectedOrg?.orgClass}</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-center text-slate-600 mb-8 text-lg">
                  Are you sure you want to proceed with issuing a warning to
                  this organization?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold hover:border-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFirstConfirm}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Confirmation Modal */}
        {step === 2 && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center relative">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  Final Confirmation
                </h2>
              </div>

              <div className="p-8">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-red-800 leading-relaxed">
                    <span className="font-bold text-base block mb-2">
                      ⚠️ Warning:
                    </span>
                    This action will issue an official warning to{" "}
                    <span className="font-bold">
                      {selectedOrg?.orgName} ({selectedOrg?.orgAcronym})
                    </span>
                    . This will be permanently recorded.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 text-slate-700">
                    Warning Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={warningNote}
                    onChange={(e) => setWarningNote(e.target.value)}
                    placeholder="Provide detailed reasons for this warning..."
                    className="w-full border-2 border-slate-300 rounded-xl p-4 min-h-[140px] focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all resize-none text-slate-700 placeholder:text-slate-400"
                    disabled={isSubmitting}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">ℹ️</span>
                      <span>
                        This note will be permanently recorded in the
                        organization's file.
                      </span>
                    </p>
                    <span className="text-xs text-slate-400">
                      {warningNote.length}/1000
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalConfirm}
                    disabled={isSubmitting || !warningNote.trim()}
                    className={`flex-1 px-6 py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200
                      ${
                        isSubmitting
                          ? "bg-red-400 text-white opacity-70 cursor-not-allowed backdrop-blur-sm"
                          : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Confirm Warning"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
