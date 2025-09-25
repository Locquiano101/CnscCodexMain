import axios from "axios";
import {
  Award,
  FileText,
  MoreHorizontal,
  Calculator,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
export function SduAccomplishmentReportDetailed({
  getCategoryIcon,
  user,
  formatDate,
  getCategoryColor,
  selectedAccomplishment,
}) {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingData, setGradingData] = useState({
    totalPoints: 0,
    breakdown: {},
    comments: "",
    status: "Pending",
  });

  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (selectedAccomplishment) {
      setLoading(false);
      // Initialize grading data if it exists
      if (selectedAccomplishment.grading) {
        setGradingData(selectedAccomplishment.grading);
      }
    }
  }, [selectedAccomplishment]);

  // Grading criteria based on the rubric
  const gradingCriteria = {
    "Programs, Projects, and Activities (PPAs)": {
      maxPoints: 35,
      criteria: [
        { name: "Program Quality & Execution", maxPoints: 15 },
        { name: "Documentation Completeness", maxPoints: 10 },
        { name: "Impact & Effectiveness", maxPoints: 10 },
      ],
    },
    "Meetings & Assemblies": {
      maxPoints: 5,
      criteria: [
        { name: "Meeting Documentation", maxPoints: 3 },
        { name: "Participation & Engagement", maxPoints: 2 },
      ],
    },
    "Quality of Required Documents": {
      maxPoints: 10,
      criteria: [
        { name: "Document Completeness", maxPoints: 5 },
        { name: "Document Quality", maxPoints: 3 },
        { name: "Systematic Organization", maxPoints: 2 },
      ],
    },
    "Institutional Involvement": {
      maxPoints: 15,
      criteria: [
        { name: "Level of Participation", maxPoints: 8 },
        { name: "Documentation Quality", maxPoints: 4 },
        { name: "Impact on Organization", maxPoints: 3 },
      ],
    },
    "External Activities": {
      maxPoints: 25,
      criteria: [
        { name: "Activity Relevance", maxPoints: 10 },
        { name: "Documentation & Compliance", maxPoints: 8 },
        { name: "Learning Outcomes", maxPoints: 7 },
      ],
    },
  };

  // Required documents mapping with proper structure
  const requiredDocuments = {
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
      { label: "Resolution", required: false },
    ],
    "Institutional Involvement": [
      { label: "Narrative Report", required: true },
      { label: "Attendance Sheet", required: true },
      { label: "Certificate of Participation", required: true },
      { label: "Photo Documentation", required: true },
    ],
    "External Activities": [
      { label: "Official Invitation", required: true },
      { label: "Narrative Report", required: true },
      { label: "Photo Documentation", required: true },
      { label: "CMO 63 s. 2017 documents", required: true },
      { label: "Liquidation Report", required: false },
      { label: "Echo Seminar/Training documents", required: false },
    ],
    "Meetings & Assemblies": [
      { label: "Minutes", required: true },
      { label: "Photo Documentation", required: true },
      { label: "Resolution", required: false },
    ],
  };

  const docsConfig = selectedAccomplishment
    ? requiredDocuments[selectedAccomplishment.category] || []
    : [];

  const uploadedLabels =
    selectedAccomplishment?.documents?.map((d) => d.label?.toLowerCase()) || [];

  const missingRequiredDocs = docsConfig.filter(
    (doc) => doc.required && !uploadedLabels.includes(doc.label.toLowerCase())
  );

  const missingOptionalDocs = docsConfig.filter(
    (doc) => !doc.required && !uploadedLabels.includes(doc.label.toLowerCase())
  );

  const totalOptionalDocs = docsConfig.filter((d) => !d.required).length;
  const uploadedOptionalDocs = totalOptionalDocs - missingOptionalDocs.length;

  const handleGrading = () => {
    const categoryGrading = gradingCriteria[selectedAccomplishment.category];
    if (categoryGrading) {
      setGradingData({
        ...gradingData,
        breakdown: categoryGrading.criteria.reduce((acc, criteria) => {
          acc[criteria.name] = 0;
          return acc;
        }, {}),
        maxPoints: categoryGrading.maxPoints,
      });
    }
    setShowGradingModal(true);
  };

  const calculateTotalPoints = () => {
    return Object.values(gradingData.breakdown || {}).reduce(
      (sum, points) => sum + (points || 0),
      0
    );
  };
  const handleOpenDocument = (doc) => {
    console.log(doc);
    setSelectedDocFile(
      `${DOCU_API_ROUTER}/${doc.organizationProfile}/${doc.fileName}`
    ); // use actual file URL from your backend
    setSelectedDoc(doc);
    setShowDocModal(true);
  };
  const getGradeStatus = (points, maxPoints) => {
    const percentage = (points / maxPoints) * 100;
    if (percentage >= 90)
      return {
        status: "Excellent",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    if (percentage >= 80)
      return {
        status: "Good",
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      };
    if (percentage >= 70)
      return {
        status: "Satisfactory",
        color: "bg-yellow-100 text-yellow-800",
        icon: CheckCircle,
      };
    return {
      status: "Needs Improvement",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    };
  };

  const currentGrading = gradingCriteria[selectedAccomplishment?.category];

  const saveGrade = async () => {
    if (!selectedAccomplishment) return;

    const finalGrading = {
      ...gradingData,
      totalPoints: calculateTotalPoints(),
      maxPoints: currentGrading.maxPoints,
      gradedAt: new Date().toISOString(),
      gradedBy: user?.name || "Current User",
    };

    try {
      const payload = {
        accomplishmentId: selectedAccomplishment._id,
        organizationProfile: selectedAccomplishment.organizationProfile,
        grading: finalGrading,
      };

      const response = await axios.post(
        `${API_ROUTER}/gradeAccomplishment`, // replace with your backend endpoint
        payload
      );

      console.log("Grade saved successfully:", response.data);
      setGradingData(finalGrading);
      setShowGradingModal(false);
    } catch (error) {
      console.error("Failed to save grade:", error);
      // Optionally: show a notification to the user
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-gray-200 overflow-hidden">
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <FileText className="h-12 w-full text-gray-500 mb-4" />
          <p className="text-gray-500">Select Accomplishments</p>
        </div>
      ) : selectedAccomplishment ? (
        <div className="flex flex-col h-full w-full p-4 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm ${getCategoryColor(
                selectedAccomplishment.category
              )}`}
            >
              {getCategoryIcon(selectedAccomplishment.category)}
              <span>{selectedAccomplishment.category}</span>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Grading Display */}
              {gradingData.totalPoints > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 shadow-sm">
                  <Calculator className="w-5 h-5 text-purple-700" />
                  <span className="text-sm font-semibold text-purple-800">
                    {gradingData.totalPoints}/
                    {currentGrading?.maxPoints ||
                      selectedAccomplishment.awardedPoints}{" "}
                    Points
                  </span>
                  {currentGrading &&
                    (() => {
                      const gradeInfo = getGradeStatus(
                        gradingData.totalPoints,
                        currentGrading.maxPoints
                      );
                      const IconComponent = gradeInfo.icon;
                      return (
                        <span
                          className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${gradeInfo.color}`}
                        >
                          <IconComponent className="w-3 h-3" />
                          {gradeInfo.status}
                        </span>
                      );
                    })()}
                </div>
              )}

              {/* More Options Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="p-2 rounded-full hover:bg-gray-100 border border-gray-200 transition"
                >
                  <MoreHorizontal className="text-gray-600" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition items-center gap-2"
                      onClick={() => {
                        handleGrading();
                        setShowDropdown(false);
                      }}
                    >
                      <Calculator className="w-4 h-4" />
                      Grade Accomplishment
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
                      onClick={() => {
                        console.log("View detailed breakdown");
                        setShowDropdown(false);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <h2 className="text-xl font text-gray-900 leading-tight">
            <span className="font-black">Title:</span>{" "}
            {selectedAccomplishment.title}
          </h2>
          <p className="text-gray-700">
            <span className="font-semibold">Description:</span>
            <span className="italic">
              {" "}
              {selectedAccomplishment.description}
            </span>
          </p>
          {selectedAccomplishment?.overallStatus && (
            <p className="text-gray-700 text-sm mt-2 mb-6">
              <span className="font-semibold">Status:</span>
              <span className="italic">
                {" "}
                {selectedAccomplishment.overallStatus}
              </span>
            </p>
          )}

          <div className="flex w-full gap-4 h-full">
            {/* Uploaded Documents */}
            {selectedAccomplishment.documents &&
              selectedAccomplishment.documents.length > 0 && (
                <div className="flex-1 flex flex-col h-full">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Uploaded Documents (
                    {selectedAccomplishment.documents.length})
                  </h4>
                  <div className="flex-1 flex flex-col rounded-lg p-2 overflow-y-auto gap-2">
                    {selectedAccomplishment.documents.map((doc, index) => (
                      <div
                        key={doc._id || index}
                        onClick={() => handleOpenDocument(doc)}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {doc.label}
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
                        onClick={() => handleOpenDocument(doc)}
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
                  <CheckCircle className="w-5 h-5 text-green-600" />
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
                  {missingOptionalDocs.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 font-medium">
                        All optional documents uploaded!
                      </p>
                    </div>
                  ) : (
                    <div>
                      {uploadedOptionalDocs > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                          <p className="text-blue-800 font-medium">
                            {uploadedOptionalDocs} optional document
                            {uploadedOptionalDocs > 1 ? "s" : ""} uploaded!
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        {missingOptionalDocs.map((doc, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedDoc(doc.label)}
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

          <div className="flex w-full text-xs justify-end gap-4 pt-6 p-2">
            <div className="flex items-center gap-2">
              <span>
                Created: {formatDate(selectedAccomplishment.createdAt)}
              </span>
            </div>
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

      {/* Grading Modal */}
      {showGradingModal && currentGrading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Grade Accomplishment: {selectedAccomplishment.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Category: {selectedAccomplishment.category} (Max:{" "}
                {currentGrading.maxPoints} points)
              </p>
            </div>

            <div className="p-6 space-y-4">
              {currentGrading.criteria.map((criteria, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {criteria.name}
                    </label>
                    <span className="text-xs text-gray-500">
                      Max: {criteria.maxPoints} pts
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={criteria.maxPoints}
                    value={gradingData.breakdown[criteria.name] || 0}
                    onChange={(e) => {
                      const value = Math.min(
                        criteria.maxPoints,
                        Math.max(0, parseInt(e.target.value) || 0)
                      );
                      setGradingData({
                        ...gradingData,
                        breakdown: {
                          ...gradingData.breakdown,
                          [criteria.name]: value,
                        },
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              ))}

              <div className="border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  value={gradingData.comments}
                  onChange={(e) =>
                    setGradingData({ ...gradingData, comments: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add any comments or feedback..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Total Score:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {calculateTotalPoints()}/{currentGrading.maxPoints} points
                  </span>
                </div>
                {calculateTotalPoints() > 0 &&
                  (() => {
                    const gradeInfo = getGradeStatus(
                      calculateTotalPoints(),
                      currentGrading.maxPoints
                    );
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Grade:</span>
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${gradeInfo.color}`}
                        >
                          {gradeInfo.status} (
                          {Math.round(
                            (calculateTotalPoints() /
                              currentGrading.maxPoints) *
                              100
                          )}
                          %)
                        </span>
                      </div>
                    );
                  })()}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowGradingModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => saveGrade()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
      {showDocModal && selectedDocFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Preview - {selectedDoc?.label || "Selected Document"}
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={selectedDocFile}
                className="w-full h-[70vh]"
                title="Document Preview"
              />
              <p className="mt-2 text-sm text-gray-600"></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
