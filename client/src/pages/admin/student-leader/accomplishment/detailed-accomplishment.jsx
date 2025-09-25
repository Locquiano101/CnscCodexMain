import {
  Award,
  FileText,
  Calendar,
  X,
  AlertCircle,
  File,
  FileTextIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import axios from "axios";
import DocumentUploader from "../../../../components/document_uploader";

export function StudentAccomplishmentDetailed({
  getCategoryIcon,
  formatDate,
  getCategoryColor,
  selectedAccomplishment,
}) {
  const [addNewDocumentPopUp, setAddNewDocumentPopUp] = useState(false);
  const [updateDocumentPopUp, setUpdateAccomplishmentDocumentPopUp] =
    useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <div className="flex justify-between items-center mb-4">
            {/* Category Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium  ${getCategoryColor(
                selectedAccomplishment.category
              )}`}
            >
              {getCategoryIcon(selectedAccomplishment.category)}
              {selectedAccomplishment.category}
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-100  rounded-full ">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">
                {selectedAccomplishment.awardedPoints} Points Awarded
              </span>
            </div>
          </div>
          {/* Title */}
          <h2 className="text-xl font text-gray-900  leading-tight">
            <span className=" font-black">Title:</span>
            {selectedAccomplishment.title}
          </h2>
          {/* Description */}
          <p className="text-gray-700 mb-6">
            <span className="font-semibold">Description:</span>
            <span className=" italic">
              {selectedAccomplishment.description}
            </span>
          </p>

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
                        onClick={() => {
                          setSelectedDoc(doc),
                            setUpdateAccomplishmentDocumentPopUp(true);
                        }}
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
                          setAddNewDocumentPopUp(true);
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
                              setAddNewDocumentPopUp(true);
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

      {addNewDocumentPopUp && (
        <AddNewAccomplishmentDocument
          addNewDocumentPopUp={addNewDocumentPopUp}
          setAddNewDocumentPopUp={setAddNewDocumentPopUp}
          selectedDoc={selectedDoc}
          selectedAccomplishment={selectedAccomplishment}
        />
      )}
      {updateDocumentPopUp && (
        <UpdateAccomplishmentDocument
          setUpdateAccomplishmentDocumentPopUp={
            setUpdateAccomplishmentDocumentPopUp
          }
          selectedDoc={selectedDoc}
          selectedAccomplishment={selectedAccomplishment}
        />
      )}
    </div>
  );
}

function UpdateAccomplishmentDocument({
  selectedDoc,
  selectedAccomplishment,
  setUpdateAccomplishmentDocumentPopUp,
}) {
  if (!selectedDoc) return null;
  const [file, setFile] = useState(null);
  console.log(selectedDoc);

  const handleReplace = async () => {
    console.log("Submit new file update");
    // TODO: add API call for updating/replacing document
    const formData = new FormData();
    formData.append(
      "organizationProfile",
      selectedAccomplishment.organizationProfile
    );
    formData.append("label", selectedDoc.label);
    formData.append("subAccomplishmentId", selectedAccomplishment._id);
    formData.append("file", file);

    // ✅ Log formData entries
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const res = await axios.put(
        `${API_ROUTER}/StudentUpdateAccomplishmentDcument/${selectedDoc._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(res);
      alert("file change succesfully");
      setUpdateAccomplishmentDocumentPopUp(false);
      window.location.reload(); // 🔄 full page reload
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 md:w-4/5 lg:w-2/3 h-[90vh] p-6 relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setUpdateAccomplishmentDocumentPopUp(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4">Update Document</h2>

        {/* Document Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {selectedDoc.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Activity: {selectedAccomplishment.title}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Uploaded {formatDate(selectedDoc.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="capitalize">{selectedDoc.status}</span>
                </div>
              </div>
            </div>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {selectedDoc.status}
            </span>
          </div>
        </div>

        {/* Content Split */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Uploader (takes less width) */}
          <div className="w-1/3 flex flex-col gap-4">
            <DocumentUploader
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // stops form bubbling
              }}
              onFileSelect={(selectedFile) => setFile(selectedFile)}
              acceptedFormats="application/pdf"
              title="Select a document to upload"
              showReset={true}
              className="mb-4"
            />

            <button
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={handleReplace}
            >
              Replace File
            </button>
            {/* Document Logs */}
            {/* Document Logs */}
            {selectedDoc.logs && selectedDoc.logs.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Document Logs
                </h4>
                <ul className="space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {selectedDoc.logs.map((log, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* PDF Viewer (takes most space) */}
          <div className="flex-1">
            <iframe
              src={`${DOCU_API_ROUTER}/${selectedDoc.organizationProfile}/${selectedDoc.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
              title={`${selectedDoc.label} PDF Viewer`}
              className="w-full h-full border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddNewAccomplishmentDocument({
  addNewDocumentPopUp,
  setAddNewDocumentPopUp,
  selectedDoc,
  selectedAccomplishment,
}) {
  const [file, setFile] = useState(null);

  console.log(selectedAccomplishment);
  console.log(selectedDoc);
  if (!addNewDocumentPopUp) return null;
  const SubmitFile = async (e) => {
    if (!file) return alert("Please select a file before uploading.");

    try {
      const formData = new FormData();
      formData.append(
        "organizationProfile",
        selectedAccomplishment.organizationProfile
      );
      formData.append("label", selectedDoc);
      formData.append("subAccomplishmentId", selectedAccomplishment._id);
      formData.append("file", file);

      // ✅ Log formData entries
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const res = await axios.post(
        `${API_ROUTER}/addDocumentAccomplishment`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Upload Success:", res.data);
      alert("File Added Succesfully");
      setAddNewDocumentPopUp(false);
      window.location.reload(); // 🔄 full page reload
    } catch (error) {
      console.error("Upload Failed:", error.response || error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-1/4 p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setAddNewDocumentPopUp(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4">{selectedDoc}</h2>

        {/* ✅ Replaced file input with DocumentUploader */}
        <DocumentUploader
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // stops form bubbling
          }}
          onFileSelect={(selectedFile) => setFile(selectedFile)}
          acceptedFormats="application/pdf"
          title="Select a document to upload"
          showReset={true}
          className="mb-4"
        />

        <button
          type="submit"
          onClick={() => SubmitFile()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Upload File
        </button>
      </div>
    </div>
  );
}
