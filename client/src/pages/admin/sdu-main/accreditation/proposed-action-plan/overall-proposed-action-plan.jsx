import React, { useEffect, useState } from "react";

import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

import {
  ChevronDown,
  ChevronRight,
  School2,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";

export function SduMainOverallProposedActioPlan({ onSelectOrg }) {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        // Simulating API call - replace with your actual API call
        const response = await axios.get(
          `${API_ROUTER}/getAllProposedActionPlan`
        );
        // setProposals(response.data);

        // Using mock data for demonstration
        console.log(response.data);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Approved: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      "In Review": "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-md font-medium border ${
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  const getActiveBadge = (isActive) => {
    return (
      <span
        className={`px-2 py-1 rounded-full text-md font-medium border ml-2 ${
          isActive
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-gray-100 text-gray-600 border-gray-300"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const setSelectedOrg = ({ proposal }) => {
    console.log("Row clicked!", proposal);
    onSelectOrg(proposal.organizationProfile);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Proposals</h3>
          <p className="text-red-600 text-lg mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-0">
      <div className="p-6 bg-white rounded-xl shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 ">
          Proposed Action Plan Overview
        </h1>

        {proposals.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-gray-900 font-medium mb-2">
              No Proposals Found
            </h3>
            <p className="text-gray-600">
              There are currently no proposed action plans to display.
            </p>
          </div>
        ) : (
          <div className="bg-white border-gray-500 border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left text-md font-medium text-black uppercase tracking-wider">
                    Organization
                  </th>
                  <th className=" text-left text-md font-medium text-black uppercase tracking-wider">
                    Proposed PPA Status
                  </th>
                  <th className=" text-left text-md font-medium text-black uppercase tracking-wider">
                    Active Status
                  </th>
                  <th className=" text-left text-md font-medium text-black uppercase tracking-wider">
                    Action Plans
                  </th>
                  <th className=" text-left text-md font-medium text-black uppercase tracking-wider">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="">
                {proposals.map((proposal) => (
                  <React.Fragment key={proposal._id}>
                    <tr
                      className="hover:bg-gray-50 "
                      onClick={() => setSelectedOrg({ proposal: proposal })}
                    >
                      <td className=" whitespace-nowrap">
                        <div className="flex p-4 items-center">
                          {proposal.organizationProfile.orgLogo ? (
                            <div className="relative">
                              <img
                                src={`${DOCU_API_ROUTER}/${proposal.organizationProfile._id}/${proposal.organizationProfile.orgLogo}`}
                                alt={`${proposal.organizationProfile.orgName} Logo`}
                                className="w-20 h-20 object-cover rounded-full"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-cnsc-primary-color flex justify-center items-center text-white rounded-full border">
                              <School2 className="w-1/2 h-1/2 " />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-lg font-medium text-gray-900">
                              {proposal.organizationProfile.orgName ||
                                "Unknown Organization"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className=" whitespace-nowrap">
                        {getStatusBadge(proposal.overallStatus)}
                      </td>
                      <td className=" whitespace-nowrap">
                        {getActiveBadge(proposal.isActive)}
                      </td>
                      <td className=" whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg text-gray-900 mr-2">
                            {proposal.ProposedIndividualActionPlan.length}
                          </span>
                          <span className="text-md text-black">plans</span>
                        </div>
                      </td>
                      <td className=" whitespace-nowrap text-lg text-black">
                        {formatDate(proposal.createdAt)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
