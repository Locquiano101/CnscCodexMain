import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER } from "../../../../App";
import {
  ChevronDown,
  ChevronRight,
  School2,
  DollarSign,
  FileText,
  Building2,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Award,
} from "lucide-react";

export function SduMainOverallProposedActioPlanConduct({ onSelectOrg }) {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await axios.get(`${API_ROUTER}/getAllProposalConduct`);
        setProposals(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch proposals:", err);
        if (err.status === 404 || err.response?.status === 404) {
          setProposals([]);
        } else {
          setError("Failed to load proposals");
        }
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  // Group proposals by organization
  const organizationData = proposals.reduce((acc, proposal) => {
    const orgName =
      proposal.organizationProfile?.orgName || "Unknown Organization";

    if (!acc[orgName]) {
      acc[orgName] = {
        profile: proposal.organizationProfile,
        proposals: [],
        totalBudget: 0,
        statusCounts: {
          Approved: 0,
          Pending: 0,
          Rejected: 0,
        },
        totalDocuments: 0,
      };
    }

    acc[orgName].proposals.push(proposal);
    acc[orgName].totalBudget +=
      proposal.ProposedIndividualActionPlan?.budgetaryRequirements || 0;
    acc[orgName].totalDocuments += proposal.document?.length || 0;

    return acc;
  }, {});

  const organizations = Object.entries(organizationData).map(
    ([orgName, data]) => ({
      orgName,
      ...data,
    })
  );

  // Overall analytics
  const analytics = {
    totalOrganizations: organizations.length,
    totalProposals: proposals.length,
    totalBudget: proposals.reduce(
      (sum, p) =>
        sum + (p.ProposedIndividualActionPlan?.budgetaryRequirements || 0),
      0
    ),
    avgProposalsPerOrg:
      organizations.length > 0
        ? (proposals.length / organizations.length).toFixed(1)
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">
          Loading organization data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 h-full w-full">
      {/* Summary Cards */}
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Organizations Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cnsc-primary-color p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Total Organizations
                </p>
                <p className="text-4xl font-bold">
                  {analytics.totalOrganizations}
                </p>
              </div>
              <Building2 className="w-14 h-14 opacity-30" />
            </div>
          </div>

          <div className="bg-cnsc-primary-color p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">
                  Total Proposals
                </p>
                <p className="text-4xl font-bold">{analytics.totalProposals}</p>
              </div>
              <FileText className="w-14 h-14 opacity-30" />
            </div>
          </div>

          <div className="bg-cnsc-primary-color p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">
                  Total Budget
                </p>
                <p className="text-4xl font-bold">
                  ₱{(analytics.totalBudget / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-14 h-14 opacity-30" />
            </div>
          </div>

          <div className="bg-cnsc-primary-color p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">
                  Avg per Org
                </p>
                <p className="text-4xl font-bold">
                  {analytics.avgProposalsPerOrg}
                </p>
              </div>
              <TrendingUp className="w-14 h-14 opacity-30" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-800 to-gray-700 text-white">
          <h2 className="text-2xl font-bold">
            Organization Profiles & Proposal Statistics
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            Click on any organization to view detailed proposal breakdown
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Proposals
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status Breakdown
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total Budget
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Documents
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr
                  onClick={() => {
                    console.log(org.profile);
                    onSelectOrg(org.profile);
                  }}
                  className="hover:bg-gray-50 transition-colors "
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center ">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <School2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 flex gap-4 items-center">
                        <div className="font-bold text-gray-900 text-lg">
                          {org.profile?.orgName || "N/A"}
                        </div>
                        {org.profile?.orgAcronym && (
                          <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-medium mr-2 inline-block mt-1">
                            {org.profile.orgAcronym}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-center">
                    <span className="text-2xl">{org.proposals.length}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      {org.statusCounts.Approved > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-800">
                            {org.statusCounts.Approved}
                          </span>
                        </div>
                      )}
                      {org.statusCounts.Pending > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-lg">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-800">
                            {org.statusCounts.Pending}
                          </span>
                        </div>
                      )}
                      {org.statusCounts.Rejected > 0 && (
                        <div className="flex items-center gap-1 bg-red-100 px-3 py-1.5 rounded-lg">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-bold text-red-800">
                            {org.statusCounts.Rejected}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ₱{org.totalBudget.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: ₱
                      {(org.totalBudget / org.proposals.length).toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-700">
                        {org.totalDocuments}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No organizations found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
