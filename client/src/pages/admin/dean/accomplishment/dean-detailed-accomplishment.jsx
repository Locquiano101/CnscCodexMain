import { Award, FileText, FileTextIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { UpdateStatusAccomplishment } from "../../../../components/update-status-accomplishment";

export function DeanAccomplishmentReportDetailed({
  getCategoryIcon,
  orgData,
  user,
  formatDate,
  getCategoryColor,
  selectedAccomplishment,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [statusModal, setStatusModal] = useState(null);

  const [loading, setLoading] = useState(true);
  // Replaced three-dots dropdown with visible action buttons
  useEffect(() => {
    if (selectedAccomplishment) {
      setLoading(false);
    }
  }, [selectedAccomplishment]);

  // 1️⃣ Required documents mapping with proper structure
  const requiredDocuments = {
    // ✅ Activities Based on PPA
    "Programs, Projects, and Activities (PPAs)": [
      { label: "Attendance Sheet", required: true },
      { label: "Narrative Report", required: true },
      { label: "Photo Documentation", required: true },
      { label: "Financial/Liquidation Report", required: true },
      { label: "Summary of Evaluation", required: true },
      {
        label: "Compiled sample evaluation (Minimum Required: 10)",
        required: true,
      },
      { label: "Resolution", required: false }, // Optional
    ],

    // ✅ Institutional Activities
    "Institutional Involvement": [
      { label: "Narrative Report", required: true },
      { label: "Attendance Sheet", required: true },
      { label: "Certificate of Participation", required: true },
      { label: "Photo Documentation", required: true },
    ],

    // ✅ External Activities
    "External Activities": [
      { label: "Official Invitation", required: true },
      { label: "Narrative Report", required: true },
      { label: "Photo Documentation", required: true },
      { label: "CMO 63 s. 2017 documents", required: true },
      { label: "Liquidation Report", required: false }, // Optional - Funds came from the Organization
      { label: "Echo Seminar/Training documents", required: false }, // Optional - Funds came from the School
    ],

    // ✅ Meetings
    "Meetings & Assemblies": [
      { label: "Minutes", required: true },
      { label: "Photo Documentation", required: true },
      { label: "Resolution", required: false }, // Optional
    ],
  };

  const docsConfig = selectedAccomplishment
    ? requiredDocuments[selectedAccomplishment.category] || []
    : [];

  // Check which docs are already uploaded
  const uploadedLabels =
    selectedAccomplishment?.documents?.map((d) => d.label?.toLowerCase()) || [];

  // Filter required and optional separately - FIXED LOGIC
  const missingRequiredDocs = docsConfig.filter(
    (doc) => doc.required && !uploadedLabels.includes(doc.label.toLowerCase())
  );

  const missingOptionalDocs = docsConfig.filter(
    (doc) => !doc.required && !uploadedLabels.includes(doc.label.toLowerCase())
  );

  // Get counts for optional documents
  const totalOptionalDocs = docsConfig.filter((d) => !d.required).length;
  const uploadedOptionalDocs = totalOptionalDocs - missingOptionalDocs.length;

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-gray-200 overflow-hidden">
      {loading ? (
        // 🔄 Loading State
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <FileTextIcon className="h-12 w-full text-gray-500 mb-4" />
          <p className="text-gray-500">Select Accomplishments</p>
        </div>
      ) : selectedAccomplishment ? (
        <div className="flex flex-col h-full w-full p-4 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            {/* Category Badge */}
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm ${getCategoryColor(
                selectedAccomplishment.category
              )}`}
            >
              {getCategoryIcon(selectedAccomplishment.category)}
              <span>{selectedAccomplishment.category}</span>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Points Awarded */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 shadow-sm">
                <Award className="w-5 h-5 text-yellow-700" />
                <span className="text-sm font-semibold text-yellow-800">
                  {selectedAccomplishment.awardedPoints} Points
                </span>
              </div>

              {/* Visible Action Buttons (replacing dropdown) */}
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() =>
                    setStatusModal({
                      type: "revision",
                      status: "Revision from Dean",
                    })
                  }
                >
                  Request Revision
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() =>
                    setStatusModal({
                      type: "approval",
                      status: "Approved by Dean",
                    })
                  }
                >
                  Approve
                </button>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font text-gray-900  leading-tight">
            <span className=" font-black">Title:</span>
            {selectedAccomplishment.title}
          </h2>
          {/* Description */}
          <p className="text-gray-700 ">
            <span className="font-semibold">Description:</span>
            <span className=" italic">
              {selectedAccomplishment.description}
            </span>
          </p>
          {selectedAccomplishment?.overallStatus && (
            <p className="text-gray-700 text-sm mt-2 mb-6">
              <span className="font-semibold">Status:</span>
              <span className=" italic">
                {selectedAccomplishment.overallStatus}
              </span>
            </p>
          )}

          <div className="flex w-full gap-4  h-full">
            {/* Uploaded Documents */}
            {selectedAccomplishment.documents &&
              selectedAccomplishment.documents.length > 0 && (
                <div className="flex-1  flex flex-col h-full">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Uploaded Documents (
                    {selectedAccomplishment.documents.length})
                  </h4>
                  <div className="flex-1 flex flex-col  rounded-lg p-2 overflow-y-auto gap-2">
                    {selectedAccomplishment.documents.map((doc, index) => (
                      <div
                        key={doc._id || index}
                        onClick={() => console.log(doc)}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {doc.label}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                doc.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : doc.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded: {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex-1 flex flex-col">
              {/* Required Documents */}
              {missingRequiredDocs.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Required Documents (
                    {docsConfig.filter((d) => d.required).length -
                      missingRequiredDocs.length}
                    /{docsConfig.filter((d) => d.required).length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {missingRequiredDocs.map((doc, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedDoc(doc.label);
                        }}
                        className="flex items-center gap-2 p-2 rounded border bg-red-50 border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">
                          {doc.label}
                        </span>
                        <span className="ml-auto text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          Missing
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <p className="text-green-800 font-medium">
                    All required documents uploaded!
                  </p>
                </div>
              )}

              {/* Optional Documents */}
              {totalOptionalDocs > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Optional Documents ({uploadedOptionalDocs}/
                    {totalOptionalDocs})
                  </h4>

                  {/* Show success message if all optional documents are uploaded */}
                  {missingOptionalDocs.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                      <p className="text-green-800 font-medium">
                        All optional documents uploaded!
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Show success message for uploaded optional documents if any */}
                      {uploadedOptionalDocs > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-blue-800 font-medium">
                            {uploadedOptionalDocs} optional document
                            {uploadedOptionalDocs > 1 ? "s" : ""} uploaded!
                          </p>
                        </div>
                      )}

                      {/* Show missing optional documents */}
                      <div className="flex flex-col gap-2">
                        {missingOptionalDocs.map((doc, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSelectedDoc(doc.label);
                              NotifyDocumentPopUp(true);
                            }}
                            className="flex items-center gap-2 p-2 rounded border bg-gray-50 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700 font-medium">
                              {doc.label}
                            </span>
                            <span className="ml-auto text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              Optional
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex  w-full text-xs justify-end gap-4 pt-6 p-2">
            <div className="flex items-center gap-2">
              <span>
                Created: {formatDate(selectedAccomplishment.createdAt)}
              </span>
            </div>{" "}
            {selectedAccomplishment.updatedAt !==
              selectedAccomplishment.createdAt && (
              <div className="flex items-center gap-2">
                ||
                <span>
                  Updated: {formatDate(selectedAccomplishment.updatedAt)}
                </span>
              </div>
            )}
          </div>
          <UpdateStatusAccomplishment
            accomplishment={selectedAccomplishment}
            statusModal={statusModal}
            setStatusModal={setStatusModal}
            orgData={orgData}
            user={user}
            getCategoryIcon={getCategoryIcon}
            getCategoryColor={getCategoryColor}
            formatDate={formatDate}
          />
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">
            Select an accomplishment to view details
          </p>
        </div>
      )}
    </div>
  );
}
