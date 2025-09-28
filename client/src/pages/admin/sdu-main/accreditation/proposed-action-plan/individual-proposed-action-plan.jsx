import React, { useEffect, useRef, useState } from "react";

import axios from "axios";
import { API_ROUTER } from "../../../../../App";

import {
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Check,
  Edit,
  DollarSign,
  Target,
  Settings,
  ChevronDown,
  FileText,
  Users,
} from "lucide-react";
import { DonePopUp } from "../../../../../components/components";
import {
  ApprovalModal,
  RevisionModal,
  ViewProposalModal,
} from "./update-status-proposed-action-plan";

export function SduMainProposedActionPlanOrganization({ selectedOrg }) {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // to store action type
  const [error, setError] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmUpdateModal, setConfirmUpdateModal] = useState(false);
  const [isManageProposedPlanOpen, setIsManageProposedPlanOpen] =
    useState(false);
  const dropdownRef = useRef(null);

  const [popup, setPopup] = useState({
    open: false,
    type: "success", // "success" | "error" | "warning"
    message: "",
  });

  const fetchProposals = async () => {
    setLoading(false);
    try {
      const response = await axios.get(
        `${API_ROUTER}/getAdviserProposals/${selectedOrg._id}`
      );
      console.log(response.data);
      setProposals(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      if (err.status === 404 || err.response?.status === 404) {
        setProposals([]);
        setError(null);
      } else {
        setError("Failed to load proposals");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrg._id) {
      fetchProposals();
    }
  }, [selectedOrg._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Under Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Pending":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-900";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle size={14} className="text-emerald-600" />;
      case "Under Review":
        return <Clock size={14} className="text-amber-600" />;
      case "Rejected":
        return <XCircle size={14} className="text-red-600" />;
      case "Pending":
        return <AlertTriangle size={14} className="text-blue-600" />;
      default:
        return <Clock size={14} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const handleView = (proposal) => {
    console.log(proposal);

    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const handleRevision = () => {
    const deanStatuses = ["Revision from SDU", "Approved"];
    const adviserStatuses = [
      "Approved by the Adviser",
      "Revision from the Adviser",
    ];

    const currentStatus = selectedProposal.overallStatus?.toLowerCase().trim();

    const isDeanUpdated = deanStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    const isAdviserValid = adviserStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    if (isDeanUpdated || !isAdviserValid) {
      setPendingAction("revision");

      if (isDeanUpdated) {
        setConfirmMessage(
          "This proposal has already been updated by the Dean. Do you want to continue updating it again?"
        );
      } else if (!isAdviserValid) {
        setConfirmMessage(
          "This proposal has not yet been reviewed by the Adviser. Do you want to proceed anyway?"
        );
      }

      setConfirmUpdateModal(true);
      return;
    }

    setShowRevisionModal(true);
  };

  const handleApproval = () => {
    const deanStatuses = ["Revision From the SDU", "Approved"];
    const adviserStatuses = [
      "Approved by the Adviser",
      "Revision from the Adviser",
    ];

    const currentStatus = selectedProposal.overallStatus?.toLowerCase().trim();

    const isDeanUpdated = deanStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    const isAdviserValid = adviserStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    if (isDeanUpdated || !isAdviserValid) {
      setPendingAction("Approval");

      if (isDeanUpdated) {
        setConfirmMessage(
          "This proposal has already been updated by the Dean. Do you want to continue updating it again?"
        );
      } else if (!isAdviserValid) {
        setConfirmMessage(
          "This proposal has not yet been reviewed by the Dean. Do you want to proceed anyway?"
        );
      }

      setConfirmUpdateModal(true);
      return;
    }

    setShowApprovalModal(true);
  };

  const submitUpdate = async ({ status }) => {
    try {
      const payload = {
        overallStatus: status,
      };

      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      const response = await axios.post(
        `${API_ROUTER}/postUpdateProposal/${selectedProposal._id}`,
        payload
      );

      console.log("✅ Update success:", response.data);

      setShowRevisionModal(false);
      setShowApprovalModal(false);
      setShowViewModal(false);

      // ✅ Show success popup
      setPopup({
        open: true,
        type: "success",
        message: `Proposal successfully ${status}`,
      });

      // Optionally refresh proposals
      fetchProposals();
    } catch (error) {
      console.log("❌ Update failed:", error);

      // ❌ Show error popup
      setPopup({
        open: true,
        type: "error",
        message: "Failed to update proposal. Please try again.",
      });
    }
  };

  const handleButtonClick = (action) => {
    switch (action) {
      case "approve":
        handleApproval();
        break;
      case "notes":
        handleRevision();
        break;
    }
  };

  return (
    <div className=" flex flex-col p-4 h-full w-full">
      {/* Loading State */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-slate-600 font-medium">
              Loading proposals...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="text-center">
            <XCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && proposals.length === 0 && (
        <div className="bg-white p-4  h-full rounded-xl shadow-xl">
          <div className="border-4  flex flex-col items-center justify-center text-center h-full rounded-2xl border-dashed border-yellow-500 hover:bg-amber-500/50 transition-all duration-300">
            <div className=" rounded-full p-6 h-fit w-fit bg-yellow-200 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle size={48} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              No Proposals Found
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              There are currently no proposed action plans for this
              organization. Notify Organization
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      {!loading && !error && proposals.length > 0 && (
        <div className="h-full p-6 rounded-xl shadow-xl bg-white overflow-auto">
          <div className="w-full  flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-slate-800">
              Proposals Analysis
            </h3>
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setIsManageProposedPlanOpen((prev) => !prev)}
                className={`px-6 flex w-fit gap-2 justify-center items-center py-2 bg-cnsc-primary-color/20 text-cnsc-primary-color border border-cnsc-primary-color/30 transition-all duration-200 ${
                  isManageProposedPlanOpen ? "rounded-t-lg" : "rounded-lg"
                }`}
              >
                <Settings className="w-4 h-4" />
                Manage Proposed Action Plan
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isManageProposedPlanOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isManageProposedPlanOpen && (
                <div className="absolute flex flex-col w-full right-0 bg-white border border-cnsc-primary-color/30 rounded-b-lg shadow-lg z-10">
                  <button
                    onClick={() => handleButtonClick("approve")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-cnsc-primary-color/10 text-sm text-slate-700 transition-colors duration-200"
                  >
                    <Check className="w-4 h-4 text-cnsc-primary-color" />
                    Approve All
                  </button>
                  <button
                    onClick={() => handleButtonClick("notes")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-cnsc-primary-color/10 text-sm text-slate-700 transition-colors duration-200 rounded-b-lg"
                  >
                    <Edit className="w-4 h-4 text-cnsc-primary-color" />
                    Set Revision All
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-6 mb-6">
            <div className="flex flex-col gap-4 min-w-[250px]">
              {/* Total Proposals */}
              <div className="bg-cnsc-primary-color/10 p-4 rounded-xl border border-cnsc-primary-color/20">
                <h4 className="text-sm font-medium text-cnsc-primary-color">
                  Total Proposals
                </h4>
                <p className="text-3xl font-bold text-cnsc-primary-color">
                  {proposals.length}
                </p>
              </div>

              {/* Average Budget */}
              <div className="bg-cnsc-primary-color/10 p-4 rounded-xl border border-cnsc-primary-color/20">
                <h4 className="text-sm font-medium text-cnsc-primary-color">
                  Estimated Budget
                </h4>
                <p className="text-3xl font-bold text-cnsc-primary-color">
                  {proposals.length > 0
                    ? "$" +
                      Math.round(
                        proposals.reduce(
                          (sum, p) => sum + (p.budgetaryRequirements || 0),
                          0
                        ) / proposals.length
                      ).toLocaleString()
                    : "$0"}
                </p>
              </div>

              {/* Next Upcoming Proposal */}
              <div className="bg-cnsc-primary-color/10 p-4 rounded-xl border border-cnsc-primary-color/20">
                <h4 className="text-sm font-medium text-cnsc-primary-color">
                  Next Proposal
                </h4>
                {proposals.length > 0 ? (
                  (() => {
                    const nextProposal = [...proposals]
                      .filter((p) => new Date(p.proposedDate) >= new Date())
                      .sort(
                        (a, b) =>
                          new Date(a.proposedDate) - new Date(b.proposedDate)
                      )[0];
                    return nextProposal ? (
                      <div className="mt-1">
                        <p className="font-semibold text-cnsc-primary-color text-sm">
                          {nextProposal.activityTitle}
                        </p>
                        <p className="text-xs text-slate-600">
                          {new Date(
                            nextProposal.proposedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold text-cnsc-primary-color text-sm mt-1">
                        No upcoming proposals
                      </p>
                    );
                  })()
                ) : (
                  <p className="font-semibold text-cnsc-primary-color text-sm mt-1">
                    No proposals yet
                  </p>
                )}
              </div>
            </div>

            {/* SDG Frequency */}
            <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Proposals SDG Analysis
              </h3>

              {/* Count SDGs */}
              {(() => {
                const sdgCounts = proposals
                  .flatMap((p) => p.alignedSDG || [])
                  .reduce((acc, sdg) => {
                    acc[sdg] = (acc[sdg] || 0) + 1;
                    return acc;
                  }, {});
                const maxCount = Math.max(...Object.values(sdgCounts), 1);

                return Object.keys(sdgCounts).length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {Object.entries(sdgCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([sdg, count]) => (
                        <div key={sdg} className="flex items-center gap-4">
                          <span className="w-24 text-sm font-medium text-slate-700 flex-shrink-0">
                            {sdg}
                          </span>
                          <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-3 bg-cnsc-primary-color rounded-full transition-all duration-300"
                              style={{
                                width: `${(count / maxCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-sm font-medium text-slate-700 text-right flex-shrink-0">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-slate-500">
                    No SDG data available
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cnsc-primary-color/5 border-b border-cnsc-primary-color/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cnsc-primary-color uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Target size={14} />
                        Activity Details
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cnsc-primary-color uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cnsc-primary-color uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cnsc-primary-color uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        Venue
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-cnsc-primary-color uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <DollarSign size={14} />
                        Budget
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {proposals.length > 0 ? (
                    proposals.map((proposal) => (
                      <tr
                        key={proposal._id}
                        className="hover:bg-cnsc-primary-color/5 cursor-pointer transition-all duration-200 group"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(proposal);
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-cnsc-primary-color/10 rounded-lg p-2 group-hover:bg-cnsc-primary-color/20 transition-colors">
                              <FileText
                                size={18}
                                className="text-cnsc-primary-color"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-900 mb-1">
                                {proposal.activityTitle}
                              </div>
                              <div className="text-sm text-slate-500 line-clamp-2 max-w-xs">
                                {proposal.briefDetails}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(
                              proposal.overallStatus
                            )}`}
                          >
                            {getStatusIcon(proposal.overallStatus)}
                            {proposal.overallStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {formatDate(proposal.proposedDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="truncate">{proposal.venue}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-900">
                            {formatCurrency(proposal.budgetaryRequirements)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText size={48} className="text-slate-300" />
                          <p className="text-slate-500 font-medium">
                            No proposals available
                          </p>
                          <p className="text-slate-400 text-sm">
                            Start by creating your first proposal
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ViewProposalModal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedProposal={selectedProposal}
        handleRevision={handleRevision}
        handleApproval={handleApproval}
        formatDate={(date) => new Date(date).toLocaleDateString()}
        formatCurrency={(amount) => `$${amount.toLocaleString()}`}
        getStatusIcon={(status) => {
          return null;
        }}
      />

      <RevisionModal
        show={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        revisionNotes={revisionNotes}
        setRevisionNotes={setRevisionNotes}
        submitUpdate={submitUpdate}
      />

      <ApprovalModal
        show={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        selectedProposal={selectedProposal}
        selectedOrg={selectedOrg}
        submitUpdate={submitUpdate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {popup.open && (
        <DonePopUp
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup({ ...popup, open: false })}
        />
      )}

      {confirmUpdateModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center z-100">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setConfirmUpdateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">Confirmation</h1>
            <p className="text-sm text-gray-700 mb-4">{confirmMessage}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmUpdateModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Trigger the correct modal based on pending action
                  if (pendingAction === "revision") setShowRevisionModal(true);
                  else if (pendingAction === "Approval")
                    setShowApprovalModal(true);

                  setConfirmUpdateModal(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
