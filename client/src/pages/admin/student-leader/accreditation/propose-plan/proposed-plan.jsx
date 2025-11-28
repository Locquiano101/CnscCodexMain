import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  X,
  Calendar,
  FileText,
  Building,
} from "lucide-react";
import axios from "axios";
import { API_ROUTER } from "../../../../../App";
import { AddProposedActionPlan } from "./proposed-plan-add";
import EditPpa from "./proposed-plan-edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export function StudentProposedPlan({ orgData, accreditationData }) {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_ROUTER}/getStudentLeaderProposalById/${accreditationData._id}`
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
    if (accreditationData._id) {
      fetchProposals();
    }
  }, [accreditationData._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "Pending":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const handleEdit = (proposal) => {
    setSelectedProposal(proposal);

    setShowEditModal(true);
  };

  const handleDelete = (proposal) => {
    setSelectedProposal(proposal);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProposals(proposals.filter((p) => p._id !== selectedProposal._id));
    setShowDeleteModal(false);
    setSelectedProposal(null);
  };

  const handleView = (proposal) => {
    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="p-6 w-full h-full" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {orgData.orgName} Proposed Action Plans
        </h1>
        {!loading && proposals.length > 0 && (
          <Button
            onClick={() => setShowManageModal(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Proposal
          </Button>
        )}
      </div>
      {/* Loading State */}
      {loading && (
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading proposals...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Empty State */}
      {!loading && !error && proposals.length === 0 && (
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="text-center">
              <Plus size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Proposals Found
              </h3>
              <p className="text-gray-600 mb-6">
                There are currently no proposed action plans for this
                organization.
              </p>
              <Button
                onClick={() => setShowManageModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 mx-auto shadow-lg hover:shadow-xl"
              >
                <Plus size={20} className="mr-2" />
                Create First Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Table */}
      {!loading && !error && proposals.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr
                    key={proposal._id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(proposal);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proposal.activityTitle}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {proposal.briefDetails}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={getStatusColor(proposal.overallStatus)}
                      >
                        {proposal.overallStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(proposal.proposedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {proposal.venue}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(proposal.budgetaryRequirements)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(proposal);
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(proposal);
                          }}
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && selectedProposal && (
        <Dialog open={showViewModal} onOpenChange={() => setShowViewModal(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Proposal</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title
                  </label>
                  <p className="text-gray-900">
                    {selectedProposal.activityTitle}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(selectedProposal.overallStatus)}
                  >
                    {selectedProposal.overallStatus}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposed Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedProposal.proposedDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <p className="text-gray-900">{selectedProposal.venue}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Required
                  </label>
                  <p className="text-gray-900">
                    {formatCurrency(selectedProposal.budgetaryRequirements)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aligned Organizational Objectives
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedProposal.alignedOrgObjectives}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brief Details
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedProposal.briefDetails}
                </p>
              </div>

              {selectedProposal.collaboratingEntities &&
                selectedProposal.collaboratingEntities.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collaborating Organizations
                    </label>
                    <div className="space-y-2">
                      {selectedProposal.collaboratingEntities.map(
                        (entity, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-gray-900">
                              {entity.orgName} ({entity.orgAcronym})
                            </p>
                            <p className="text-sm text-gray-600">
                              {entity.orgDepartment}
                            </p>
                            <p className="text-sm text-gray-600">
                              Class: {entity.orgClass}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button
                onClick={() => setShowViewModal(false)}
                variant="outline"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <EditPpa
          selectedProposal={selectedProposal}
          orgData={orgData}
          onClose={() => setShowEditModal(false)}
          accreditationData={accreditationData}
          onFinish={() => fetchProposals()}
        />
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <Dialog open={showDeleteModal} onOpenChange={() => setShowDeleteModal(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Delete Proposal
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProposal?.activityTitle}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Add/Manage Modal */}
      {showManageModal && (
        <AddProposedActionPlan
          orgData={orgData}
          accreditationData={accreditationData}
          onClose={() => setShowManageModal(false)}
          onFinish={() => fetchProposals()}
        />
      )}
    </div>
  );
}
