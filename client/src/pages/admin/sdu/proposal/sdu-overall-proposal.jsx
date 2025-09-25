import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  FileText,
  DollarSign,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { API_ROUTER } from "../../../../App";

export function SduSystemWideProposal({ onSelectOrg, user }) {
  const [proposalsConduct, setProposalsConduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposedPlanConduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(
        `${API_ROUTER}/getAllSystemWideProposalConduct`,
        { withCredentials: true }
      );
      console.log(data);
      setProposalsConduct(data);
    } catch (err) {
      console.error("Error fetching proposals conduct:", err);
      setError(err.message || "Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposedPlanConduct();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "No date specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Calculate summary statistics
  const totalProposals = proposalsConduct.length;
  const totalBudget = proposalsConduct.reduce((sum, proposal) => {
    const budget =
      parseFloat(
        proposal.ProposedIndividualActionPlan?.budgetaryRequirements
      ) || 0;
    return sum + budget;
  }, 0);
  const totalDocuments = proposalsConduct.reduce((sum, proposal) => {
    return sum + (proposal.document?.length || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system-wide proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Error Loading Proposals</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchProposedPlanConduct}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const parseAlignedSDG = (alignedSDG) => {
    if (!alignedSDG || !Array.isArray(alignedSDG) || alignedSDG.length === 0)
      return [];
    try {
      // The alignedSDG is an array with a JSON string as the first element
      return JSON.parse(alignedSDG[0]);
    } catch (error) {
      console.error("Error parsing alignedSDG:", error);
      return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          System-Wide Proposals
        </h1>
        <p className="text-gray-600">
          Overview of all system-wide proposal submissions
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Proposals
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {totalProposals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Total Budget</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-600">
                Total Documents
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {totalDocuments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      {proposalsConduct.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Proposals Found
          </h3>
          <p className="text-gray-600">
            There are currently no system-wide proposals to display.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Proposal Details</h2>
          {proposalsConduct.map((proposal, index) => {
            const plan = proposal.ProposedIndividualActionPlan;
            const alignedSDGs = parseAlignedSDG(plan?.alignedSDG);

            return (
              <div
                key={proposal._id}
                onClick={() => {
                  console.log(proposal.organizationProfile);
                  onSelectOrg(proposal.organizationProfile);
                }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                {/* Organization Info */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {plan?.activityTitle || "Untitled Activity"}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="font-medium">
                        {proposal.organizationProfile?.orgName} (
                        {proposal.organizationProfile?.orgAcronym})
                      </span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">
                        {proposal.organizationProfile?.orgClass}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.overallStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : proposal.overallStatus === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {proposal.overallStatus}
                  </span>
                </div>

                {/* Proposal Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Aligned SDGs */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Aligned SDGs
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {alignedSDGs.length > 0 ? (
                          alignedSDGs.map((sdg, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                              {sdg}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No SDGs specified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Budgetary Requirements
                      </h4>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(plan?.budgetaryRequirements || 0)}
                      </p>
                    </div>

                    {/* Venue */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Venue
                      </h4>
                      <p className="text-gray-700">
                        {plan?.venue || "No venue specified"}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Proposed Date */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Proposed Date
                      </h4>
                      <p className="text-gray-700">
                        {formatDate(plan?.proposedDate)}
                      </p>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Documents Attached
                      </h4>
                      <div className="space-y-2">
                        {proposal.document && proposal.document.length > 0 ? (
                          proposal.document.map((doc, idx) => (
                            <div
                              key={doc._id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm text-gray-700 truncate">
                                {doc.fileName}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  doc.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {doc.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No documents attached
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-600">
                          Total: {proposal.document?.length || 0} document(s)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brief Details */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Brief Details
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {plan?.briefDetails || "No brief details provided"}
                  </p>
                </div>

                {/* Aligned Objective */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Aligned Objective
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {plan?.AlignedObjective || "No aligned objective specified"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
