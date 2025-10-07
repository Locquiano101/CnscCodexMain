import axios from "axios";
import { useState, useEffect } from "react";
import { API_ROUTER } from "../../../../App";

import {
  Plus,
  Edit,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Users,
} from "lucide-react";
import { DonePopUp } from "../../../../components/components";

export function DeanProposedPlan({ selectedOrg }) {
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

  const latestUpdate = proposals.length
    ? new Date(
        Math.max(...proposals.map((p) => new Date(p.updatedAt).getTime()))
      )
    : null;

  const handleView = (proposal) => {
    console.log(proposal);

    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const handleRevision = () => {
    const deanStatuses = ["Revision From the Dean", "Approved By the Dean"];
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
    const deanStatuses = ["Revision From the Dean", "Approved By the Dean"];
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

  const SDG_DESCRIPTIONS = {
    "SDG 1": "End poverty in all its forms everywhere.",
    "SDG 2":
      "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture.",
    "SDG 3": "Ensure healthy lives and promote well-being for all at all ages.",
    "SDG 4":
      "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.",
    "SDG 5": "Achieve gender equality and empower all women and girls.",
    "SDG 6":
      "Ensure availability and sustainable management of water and sanitation for all.",
    "SDG 7":
      "Ensure access to affordable, reliable, sustainable, and modern energy for all.",
    "SDG 8":
      "Promote sustained, inclusive, and sustainable economic growth, full and productive employment, and decent work for all.",
    "SDG 9":
      "Build resilient infrastructure, promote inclusive and sustainable industrialization, and foster innovation.",
    "SDG 10": "Reduce inequality within and among countries.",
    "SDG 11":
      "Make cities and human settlements inclusive, safe, resilient, and sustainable.",
    "SDG 12": "Ensure sustainable consumption and production patterns.",
    "SDG 13": "Take urgent action to combat climate change and its impacts.",
    "SDG 14":
      "Conserve and sustainably use the oceans, seas, and marine resources for sustainable development.",
    "SDG 15":
      "Protect, restore, and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, halt and reverse land degradation, and halt biodiversity loss.",
    "SDG 16":
      "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all, and build effective, accountable, and inclusive institutions at all levels.",
    "SDG 17":
      "Strengthen the means of implementation and revitalize the global partnership for sustainable development.",
  };

  return (
    <div className="bg-gray-200 flex flex-col p-4 h-full w-full">
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
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
    <div className="text-center">
      <h3 className="text-xl font-semibold text-slate-800 mb-3">
        No Proposals Found
      </h3>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        There are currently no proposed action plans for this organization.
      </p>
    </div>
  </div>
)}

      {/* Enhanced Table */}
      {!loading && !error && proposals.length > 0 && (
        <div className=" backdrop-blur-sm rounded-2xl shadow-xl border-white/20 overflow-hidden flex flex-col h-full">
          <div className="bg-gray-50 p-4 ">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Proposals Analysis
            </h3>
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

      {/* Enhanced View Modal */}
      {showViewModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedProposal.activityTitle}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-white/20 text-white`}
                    >
                      {getStatusIcon(selectedProposal.overallStatus)}
                      {selectedProposal.overallStatus}
                    </span>
                    <span className="text-blue-100 text-sm">
                      {formatDate(selectedProposal.proposedDate)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Venue
                    </span>
                  </div>
                  <p className="font-semibold text-blue-900">
                    {selectedProposal.venue}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Budget Required
                    </span>
                  </div>
                  <p className="font-semibold text-green-900">
                    {formatCurrency(selectedProposal.budgetaryRequirements)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={20} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Proposed Date
                    </span>
                  </div>
                  <p className="font-semibold text-purple-900">
                    {formatDate(selectedProposal.proposedDate)}
                  </p>
                </div>
              </div>

              {/* SDG Alignment */}
              {selectedProposal.alignedSDG &&
                selectedProposal.alignedSDG.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target size={18} className="text-slate-600" />
                      <h4 className="text-base font-semibold text-slate-800">
                        Aligned Sustainable Development Goals
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {selectedProposal.alignedSDG.map((sdg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-4"
                        >
                          <span className="text-lg font-semibold text-slate-800 whitespace-nowrap">
                            {sdg} :
                          </span>
                          <p className="text-slate-700 text-sm leading-snug">
                            {SDG_DESCRIPTIONS[sdg] ||
                              "No description available."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Detailed Information */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                    <Target size={18} />
                    Aligned Organizational Objectives
                  </label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedProposal.AlignedObjective}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                    <FileText size={18} />
                    Brief Details
                  </label>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedProposal.briefDetails}
                    </p>
                  </div>
                </div>

                {selectedProposal.collaboratingEntities &&
                  selectedProposal.collaboratingEntities.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-3">
                        <Users size={18} />
                        Collaborating Organizations
                      </label>
                      <div className="space-y-3">
                        {selectedProposal.collaboratingEntities.map(
                          (entity, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                            >
                              <p className="font-semibold text-slate-900 mb-1">
                                {entity.orgName} ({entity.orgAcronym})
                              </p>
                              <p className="text-sm text-slate-600 mb-1">
                                {entity.orgDepartment}
                              </p>
                              <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Class: {entity.orgClass}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

{/* Action Buttons */}
{!["Approved by the Dean", "Completed"].includes(selectedProposal.overallStatus) && (
  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
    <button
      onClick={handleRevision}
      className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
    >
      <AlertTriangle size={18} />
      Notify Revision
    </button>

    <button
      onClick={handleApproval}
      className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
    >
      <CheckCircle size={18} />
      Approve Proposal
    </button>
  </div>
)}



            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-amber-500 p-4 text-white  rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} />
                  <h3 className="text-xl font-bold">Send Revision</h3>
                </div>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="text-white hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Revision Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  rows={5}
                  placeholder="Please provide specific feedback and suggestions for improvement..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() =>
                    submitUpdate({
                      status: "Revision from the Dean",
                    })
                  }
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Send Revision Request
                </button>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="px-6 py-3 text-slate-600 border-2 border-slate-300 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} />
                  <h3 className="text-xl font-bold">Approve Proposal</h3>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">
                      Confirm Proposal Approval
                    </h4>
                    <p className="text-green-700 text-sm leading-relaxed">
                      You are about to approve "
                      {selectedProposal?.activityTitle}". This action will
                      change the proposal status to "Approved" and notify all
                      the "{selectedOrg.orgName}".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h5 className="font-medium text-slate-800 mb-3">
                  Proposal Summary:
                </h5>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedProposal?.budgetaryRequirements)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span className="font-medium">
                      {selectedProposal?.venue}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proposed Date:</span>
                    <span className="font-medium">
                      {formatDate(selectedProposal?.proposedDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() =>
                    submitUpdate({ status: "Approved by the Dean" })
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Confirm Approval
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-3 text-slate-600 border-2 border-slate-300 hover:border-slate-400 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
