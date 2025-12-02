import { DOCU_API_ROUTER } from "../../../../App";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function ShowDetailedProposal({ proposal, onClose, open = true }) {
  if (!proposal) return null;

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const selectedDoc = proposal?.document?.[selectedDocIndex] || null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Proposal Details</DialogTitle>
          <DialogDescription>
            Comprehensive proposal information and documents
          </DialogDescription>
        </DialogHeader>

        {/* Split View: Details + Document Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Details Panel */}
          <div className="w-2/5 border-r overflow-y-auto">
            <div className="p-6 space-y-6">
              {proposal?.ProposedIndividualActionPlan?.activityTitle && (
                <div className="group">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                      Activity Title
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                    <p className="text-gray-900 text-xl font-bold leading-relaxed">
                      {proposal.ProposedIndividualActionPlan.activityTitle}
                    </p>
                  </div>
                </div>
              )}

              {proposal?.ProposedIndividualActionPlan?.briefDetails && (
                <div className="group">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                      Brief Details
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                    <p className="text-gray-800 text-base leading-relaxed">
                      {proposal.ProposedIndividualActionPlan.briefDetails}
                    </p>
                  </div>
                </div>
              )}

              {proposal?.ProposedIndividualActionPlan?.AlignedObjective && (
                <div className="group">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2-2h6a2 2 0 002-2V7a2 2 0 00-2-2h-6m2 5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                      Aligned Objectives
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                    <p className="text-gray-800 text-base leading-relaxed">
                      {proposal.ProposedIndividualActionPlan.AlignedObjective}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {proposal?.ProposedIndividualActionPlan?.venue && (
                  <div className="group">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-red-600 uppercase tracking-wider">
                        Venue
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                      <p className="text-gray-900 text-lg font-semibold">
                        {proposal.ProposedIndividualActionPlan.venue}
                      </p>
                    </div>
                  </div>
                )}

                {proposal?.ProposedIndividualActionPlan?.proposedDate && (
                  <div className="group">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                        Proposed Date
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                      <p className="text-gray-900 text-lg font-semibold">
                        {new Date(
                          proposal.ProposedIndividualActionPlan.proposedDate
                        ).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {proposal?.ProposedIndividualActionPlan
                ?.budgetaryRequirements && (
                <div className="group">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-green-600 uppercase tracking-wider">
                      Budget Requirements
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-200/70 group-hover:shadow-lg transition-all duration-300">
                    <p className="text-3xl font-bold text-green-700">
                      ₱
                      {proposal.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="group">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">
                    Status
                  </span>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                  <span
                    className={`inline-flex items-center px-6 py-3 rounded-2xl text-base font-bold shadow-lg ${
                      proposal?.overallStatus === "Approved"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        : proposal?.overallStatus === "Pending"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                        : proposal?.overallStatus === "Approved For Conduct"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : proposal?.overallStatus ===
                          "Ready For Accomplishments"
                        ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                        : "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full mr-3 bg-white/30"></div>
                    {proposal?.overallStatus}
                  </span>
                </div>
              </div>

              {proposal?.ProposedIndividualActionPlan?.alignedSDG &&
                proposal.ProposedIndividualActionPlan.alignedSDG.length > 0 && (
                  <div className="group">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-teal-600 uppercase tracking-wider">
                        Aligned SDGs
                      </span>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/70 group-hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-wrap gap-2">
                        {proposal.ProposedIndividualActionPlan.alignedSDG.map(
                          (sdg, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-xl font-bold border border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                              {sdg}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Right: Document Preview Panel */}
          <div className="flex-1 flex flex-col">
            {/* Document Header */}
            {proposal?.document?.length > 0 && selectedDoc && (
              <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedDoc.label || "Unnamed Document"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDoc.fileName}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm">
                    Document {selectedDocIndex + 1} of{" "}
                    {proposal.document.length}
                  </span>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            <div className="flex-1 bg-gradient-to-br from-gray-100 to-slate-100">
              {selectedDoc ? (
                <iframe
                  src={`${DOCU_API_ROUTER}/${proposal.organizationProfile}/${selectedDoc.fileName}`}
                  title={`${selectedDoc.label || "Document"} PDF`}
                  className="w-full h-full border-0 rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 mb-6">
                    <svg
                      className="w-16 h-16 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-2">
                    No Documents Available
                  </p>
                  <p className="text-sm text-gray-500">
                    This proposal doesn't have any documents attached.
                  </p>
                </div>
              )}
            </div>

            {/* Document Navigation */}
            {proposal?.document?.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-slate-50">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-1">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setSelectedDocIndex(Math.max(0, selectedDocIndex - 1))
                      }
                      disabled={selectedDocIndex === 0}
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        selectedDocIndex === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-110"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {proposal.document.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDocIndex(index)}
                        className={`w-12 h-12 text-sm font-bold rounded-xl transition-all duration-300 ${
                          selectedDocIndex === index
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-110"
                            : "text-gray-700 hover:bg-blue-50 border border-gray-200 bg-white hover:border-blue-300 hover:scale-105 hover:shadow-md"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    {/* Show ellipsis if more than 7 documents */}
                    {proposal.document.length > 7 &&
                      selectedDocIndex < proposal.document.length - 3 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setSelectedDocIndex(
                          Math.min(
                            proposal.document.length - 1,
                            selectedDocIndex + 1
                          )
                        )
                      }
                      disabled={
                        selectedDocIndex === proposal.document.length - 1
                      }
                      className={`p-2 rounded-xl transition-all duration-300 ${
                        selectedDocIndex === proposal.document.length - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:scale-110"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-200/70 p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Created:</span>{" "}
              {new Date(proposal.createdAt).toLocaleDateString("en-PH")}
            </div>
            {proposal.updatedAt !== proposal.createdAt && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Updated:</span>{" "}
                {new Date(proposal.updatedAt).toLocaleDateString("en-PH")}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
