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

export function SduProposedActionPlanOrganization({ selectedOrg }) {
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
        <div className="">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Plus size={48} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              No Proposals Found
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              There are currently no proposed action plans for this
              organization. Notify Organization
            </p>
            <button
              onClick={() => setShowManageModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-200 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      {!loading && !error && proposals.length > 0 && (
        <div className=" h-full overflow-auto">
          <div className="bg-gray-50 p-4 ">
            <div className="w-full flex justify-between">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Proposals Analysis
              </h3>
              <div
                className="relative inline-block text-left"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsManageProposedPlanOpen((prev) => !prev)}
                  className={`px-6 flex w-fit gap-2 justify-center items-center py-2 bg-amber-200 ... ${
                    isManageProposedPlanOpen ? "rounded-t-lg" : "rounded-lg"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Proposed Action Plan
                  <ChevronDown
                    className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                      isManageProposedPlanOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isManageProposedPlanOpen && (
                  <div className="absolute flex flex-col gap-2 w-full right-0 bg-white border ...">
                    <button
                      onClick={() => handleButtonClick("approve")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors duration-200"
                    >
                      <Check className="..." />
                      Approve All
                    </button>
                    <button
                      onClick={() => handleButtonClick("notes")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors duration-200"
                    >
                      <Edit className="..." />
                      Set Revision All
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 ">
              <div className="flex flex-col gap-2 ">
                {/* Total Proposals */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800">
                    Total Proposals
                  </h4>
                  <p className="text-3xl font-bold text-blue-900">
                    {proposals.length}
                  </p>
                </div>

                {/* Average Budget */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="text-sm font-medium text-green-800">
                    Estimated Budget
                  </h4>
                  <p className="text-3xl font-bold text-green-900">
                    {proposals.length > 0
                      ? "$" +
                        Math.round(
                          proposals.reduce(
                            (sum, p) => sum + (p.budgetaryRequirements || 0),
                            0
                          ) / proposals.length
                        )
                      : "$0"}
                  </p>
                </div>

                {/* Next Upcoming Proposal */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="text-sm font-medium text-purple-800">
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
                        <p className="font-semibold text-purple-900">
                          {nextProposal.activityTitle} -{" "}
                          {new Date(
                            nextProposal.proposedDate
                          ).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="font-semibold text-purple-900">
                          No upcoming proposals
                        </p>
                      );
                    })()
                  ) : (
                    <p className="font-semibold text-purple-900">
                      No proposals yet
                    </p>
                  )}
                </div>
              </div>

              {/* SDG Frequency */}
              <div className="flex-1 h-full bg-white p-6 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
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

                  return (
                    <div className="space-y-3">
                      {Object.entries(sdgCounts)
                        .sort((a, b) => b[1] - a[1])
                        .map(([sdg, count]) => (
                          <div key={sdg} className="flex items-center gap-4">
                            <span className="w-24 text-sm font-medium text-slate-700">
                              {sdg}
                            </span>
                            <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{
                                  width: `${(count / maxCount) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="w-8 text-sm font-medium text-slate-700 text-right">
                              {count}
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto h-full ">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Target size={14} />
                      Activity Details
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      Venue
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} />
                      Budget
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {proposals.map((proposal, index) => (
                  <tr
                    key={proposal._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 cursor-pointer transition-all duration-200 group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(proposal);
                    }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-2 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                          <FileText size={20} className="text-blue-600" />
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
                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border ${getStatusColor(
                          proposal.overallStatus
                        )}`}
                      >
                        {getStatusIcon(proposal.overallStatus)}
                        {proposal.overallStatus}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm font-medium text-slate-900">
                        {formatDate(proposal.proposedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin size={14} className="text-slate-400" />
                        {proposal.venue}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(proposal.budgetaryRequirements)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          // optional: return an icon based on status
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
