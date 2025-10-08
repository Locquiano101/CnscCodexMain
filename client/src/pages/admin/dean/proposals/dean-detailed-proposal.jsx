import { useState } from "react";
import { DOCU_API_ROUTER } from "../../../../App";
import { UpdateStatusProposal } from "../../../../components/update-status-proposal";

export function ShowDeanDetailedProposal({ proposal, orgData, user, onClose }) {
  const [statusModal, setStatusModal] = useState(null); // ✅ unique name
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const selectedDoc = proposal?.document?.[selectedDocIndex] || null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Proposal Details
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Comprehensive proposal information and documents
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content: Split View */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Details Panel */}
          <div className="w-2/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-6 space-y-6">
              {proposal?.ProposedIndividualActionPlan?.activityTitle && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Activity Title
                  </h3>
                  <div className="bg-white rounded-md p-4 border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {proposal.ProposedIndividualActionPlan.activityTitle}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Brief Details
                </h3>
                <div className="bg-white rounded-md p-4 border border-gray-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {proposal.ProposedIndividualActionPlan.briefDetails}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Aligned Objectives
                </h3>
                <div className="bg-white rounded-md p-4 border border-gray-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {proposal.ProposedIndividualActionPlan.AlignedObjective}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Venue
                  </h3>
                  <div className="bg-white rounded-md p-4 border border-gray-200">
                    <p className="text-gray-900 font-medium">
                      {proposal.ProposedIndividualActionPlan.venue}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Proposed Date
                  </h3>
                  <div className="bg-white rounded-md p-4 border border-gray-200">
                    <p className="text-gray-900 font-medium">
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
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Budget Requirements
                </h3>
                <div className="bg-white rounded-md p-4 border border-gray-200">
                  <p className="text-2xl font-semibold text-gray-900">
                    ₱
                    {proposal.ProposedIndividualActionPlan.budgetaryRequirements.toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Status
                </h3>
                <div className="bg-white rounded-md p-4 border border-gray-200">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium `}
                  >
                    <div className="w-2 h-2 rounded-full mr-2 bg-current opacity-60"></div>
                    {proposal?.overallStatus}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Aligned SDGs
                </h3>
                <div className="bg-white rounded-md p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {proposal.ProposedIndividualActionPlan.alignedSDG.map(
                      (sdg, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-medium"
                        >
                          {sdg}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Document Preview Panel */}
          <div className="flex-1 flex flex-col">
            {/* Document Header */}
            {proposal?.document?.length > 0 && selectedDoc && (
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedDoc.label || "Unnamed Document"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedDoc.fileName}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Document {selectedDocIndex + 1} of{" "}
                    {proposal.document.length}
                  </span>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            <div className="flex-1 bg-gray-100">
              {selectedDoc ? (
                <iframe
                  src={`${DOCU_API_ROUTER}/${proposal.organizationProfile}/${selectedDoc.fileName}`}
                  title={`${selectedDoc.label || "Document"} PDF`}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto"
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
                  <p className="text-lg font-medium text-gray-700 mb-1">
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
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-1">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setSelectedDocIndex(Math.max(0, selectedDocIndex - 1))
                      }
                      disabled={selectedDocIndex === 0}
                      className={`p-2 rounded-md transition-colors ${
                        selectedDocIndex === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    ></button>

                    {/* Page Numbers */}
                    {proposal.document.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDocIndex(index)}
                        className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                          selectedDocIndex === index
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 border border-gray-200 bg-white"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

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
                      className={`p-2 rounded-md transition-colors ${
                        selectedDocIndex === proposal.document.length - 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    ></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-white flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Created:{" "}
              {new Date(proposal.createdAt).toLocaleDateString("en-PH")}
            </span>
            {proposal.updatedAt !== proposal.createdAt && (
              <span>
                Updated:{" "}
                {new Date(proposal.updatedAt).toLocaleDateString("en-PH")}
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Close
            </button>

            {/* Send Revision button */}
            <button
              onClick={() =>
                setStatusModal({ type: "alert", status: "Revision from Dean" })
              }
              className="px-4 py-2 text-white bg-amber-700 hover:bg-amber-800 rounded-md"
            >
              Send Revision
            </button>

            {/* Approve button */}
            <button
              onClick={() =>
                setStatusModal({ type: "approval", status: "Conduct Approved" })
              }
              className="px-4 py-2 text-white bg-green-700 hover:bg-green-800 rounded-md"
            >
              Approve
            </button>
          </div>
        </div>

        {/* Modal Component */}
        <UpdateStatusProposal
          statusModal={statusModal}
          setStatusModal={setStatusModal}
          orgData={orgData}
          proposal={proposal}
          user={user}
        />
      </div>
    </div>
  );
}
