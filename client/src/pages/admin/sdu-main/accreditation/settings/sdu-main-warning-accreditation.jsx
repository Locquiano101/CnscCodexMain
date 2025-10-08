import { useState, useEffect } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";
import {
  AlertTriangle,
  X,
  CheckCircle,
  Building2,
  Loader2,
  CoinsIcon,
} from "lucide-react";

export function SduMainAccreditationWarning({ onCancel }) {
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
    setStep(1);
  };

  const handleClose = () => {
    setStep(0);
    setSelectedOrg(null);
    setWarningNote("");
    setIsSubmitting(false);
    setError(null);
    if (onCancel) onCancel();
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    if (!selectedOrg || !warningNote.trim()) return;

    setIsSubmitting(true); // ⬅️ disable button immediately
    setError(null);

    console.log({
      organizationProfileId: selectedOrg._id,
      organizationId: selectedOrg.organization,
      warningNote: warningNote.trim(),
    });

    try {
      const res = await axios.post(
        `${API_ROUTER}/SduMainAccreditationWarning`,
        {
          organizationProfileId: selectedOrg._id,
          organizationId: selectedOrg.organization,
          warningNote: warningNote.trim(),
        }
      );

      console.log(res);
      // maybe close modal or reset state here
      onCancel();
      handleClose();
    } catch (err) {
      console.error("Error issuing warning:", err);
      setError("Failed to issue warning. Please try again.");
    } finally {
      setIsSubmitting(false); // ⬅️ re-enable button after request finishes
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="relative w-1/3 ">
        {/* Main Trigger Button */}
        {step === 0 && (
          <div className="absolute inset-0 bg w-full backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white flex flex-col gap-4 rounded-lg p-6 w-full">
              <h2 className="text-lg font-semibold text-gray-800">
                Accreditation Warning
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Choose an Organization and issue a warning
              </p>
              <button
                onClick={() => setIsOpen(true)}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg w-full font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Issue Warning"
                )}
              </button>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3 rounded-lg w-full font-medium text-white bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dropdown Menu */}
        {isOpen && step === 0 && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Select Organization
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p>Loading organizations...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-4">{error}</div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : orgs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No organizations found
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {orgs.map((org) => (
                    <button
                      key={org._id}
                      onClick={() => handleSelectOrg(org)}
                      className="w-full px-6 py-4 text-left hover:bg-amber-50 transition-all duration-200 border-b border-slate-100 last:border-b-0 group"
                    >
                      <div className="flex items-start gap-4">
                        {org.orgLogo ? (
                          <img
                            src={`${API_ROUTER}/uploads/${org.orgLogo}`}
                            alt={org.orgAcronym}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-200 group-hover:ring-amber-300 transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-200 group-hover:ring-amber-300 transition-all">
                            <span className="text-white font-bold text-sm">
                              {org.orgAcronym?.substring(0, 2) || "??"}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                            {org.orgName}
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            {org.orgAcronym}
                          </p>
                          {(org.orgDepartment || org.orgSpecialization) && (
                            <p className="text-xs text-slate-500 truncate mt-1">
                              {org.orgDepartment || org.orgSpecialization}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {org.orgClass && (
                              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {org.orgClass}
                              </span>
                            )}
                            {org.isActive && (
                              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
                Are you sure you want to proceed with issuing a warning to this
                organization?
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
        : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-xl"
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
  );
}
