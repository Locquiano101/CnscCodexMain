import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  CheckCircle,
  Clock,
  X,
  File,
  Eye,
  Calendar,
  Copy,
  FileText,
  Download,
} from "lucide-react";

import DocumentUploader, {
  DocumentDisplayCard,
} from "../../../../components/document_uploader";

export function AccreditationDocuments({ orgData }) {
  const [accreditationData, setAccreditationData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const orgId = orgData?._id;

  useEffect(() => {
    const fetchAccreditationInfo = async () => {
      if (!orgId) return;
      try {
        const { data } = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${orgId}`,
          {
            withCredentials: true,
          }
        );
        console.log(data);
        setAccreditationData(data);
      } catch (err) {
        console.error("Error fetching accreditation info:", err);
      }
    };
    fetchAccreditationInfo();
  }, [orgId]);

  const handleUpload = async () => {
    if (!selectedFile || !uploadingDocType || !accreditationData) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append(
      "organizationProfile",
      accreditationData.organizationProfile._id
    );
    formData.append(
      "organization",
      accreditationData.organizationProfile.organization
    );
    formData.append("file", selectedFile);
    formData.append("accreditationId", accreditationData._id);
    formData.append("docType", uploadingDocType);

    try {
      await axios.post(`${API_ROUTER}/addAccreditationDocument`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAccreditationData((prev) => ({
        ...prev,
        [uploadingDocType]: {
          fileName: selectedFile.name,
          status: "Pending",
          createdAt: new Date().toISOString(),
        },
      }));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowPopup(false);
        setUploadingDocType(null);
        setSelectedFile(null);
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setUploadingDocType(null);
    setSelectedFile(null);
    setIsUploading(false);
  };

  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedDocumentDetails(null);
  };

  const openUpload = (docType) => {
    setUploadingDocType(docType);
    setSelectedFile(null);
    setShowPopup(true);
  };

  const openDocumentDetails = (doc, label, docKey) => {
    setSelectedDocumentDetails({
      ...doc,
      label,
      docKey,
      url: `${DOCU_API_ROUTER}/${accreditationData.organizationProfile._id}/${doc.fileName}`,
    });
    setShowDetailsPopup(true);
  };

  const getStatusStyle = (status) => {
    const styles = {
      Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      Pending: "bg-amber-50 text-amber-700 border border-amber-200",
      default: "bg-gray-50 text-gray-500 border border-gray-200",
    };
    return styles[status] || styles.default;
  };

  const getStatusIcon = (status) => {
    return status === "Approved" ? (
      <CheckCircle className="w-4 h-4" />
    ) : status === "Pending" ? (
      <Clock className="w-4 h-4" />
    ) : null;
  };

  const formatDocumentName = (docKey) => {
    return docKey.replace(/([A-Z])/g, " $1").trim();
  };

  const DocumentCard = ({ label, doc, docKey }) =>
    doc?.fileName ? (
      <div
        onClick={() => openDocumentDetails(doc, label, docKey)}
        className="flex-1 h-full  transition-all duration-500 hover:bg-amber-100"
      >
        <div className=" h-full shadow-sm hover:shadow-md transition-all duration-300">
          {/* Header */}
          <div className="p-6 border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <File className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-lg text-gray-900">
                    {label}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Uploaded{" "}
                  {new Date(doc.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center ">
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusStyle(
                    doc.status
                  )}`}
                >
                  {getStatusIcon(doc.status)}
                  <span>{doc.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="h-[calc(100%-100px)]">
            <div className="w-full h-full bg-gray-50 border border-gray-200  overflow-hidden">
              <iframe
                src={`${DOCU_API_ROUTER}/${accreditationData.organizationProfile._id}/${accreditationData[docKey]?.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
                title={`${label} PDF Viewer`}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex-1 h-full min-h-0">
        <div
          onClick={() => openUpload(docKey)}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col justify-center items-center p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload {label}
          </h3>
          <p className="text-sm text-gray-500">Click to select PDF file</p>
        </div>
      </div>
    );

  if (!accreditationData) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} classNadme="h-96 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { JointStatement, PledgeAgainstHazing, ConstitutionAndByLaws } =
    accreditationData;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 p-6 gap-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Accreditation Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 rounded-xl p-4 text-center shadow-sm border border-emerald-100">
            <div className="text-3xl font-extrabold text-emerald-600">
              {
                [
                  JointStatement,
                  ConstitutionAndByLaws,
                  PledgeAgainstHazing,
                ].filter((doc) => doc?.status === "Approved").length
              }
            </div>
            <div className="text-sm text-emerald-700 mt-1">
              Approved Documents
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 text-center shadow-sm border border-amber-100">
            <div className="text-3xl font-extrabold text-amber-500">
              {
                [
                  JointStatement,
                  ConstitutionAndByLaws,
                  PledgeAgainstHazing,
                ].filter((doc) => doc?.status === "Pending").length
              }
            </div>
            <div className="text-sm text-amber-700 mt-1">Pending Review</div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-3xl font-extrabold text-gray-700">
              {
                [
                  JointStatement,
                  ConstitutionAndByLaws,
                  PledgeAgainstHazing,
                ].filter((doc) => doc === null).length
              }
            </div>
            <div className="text-sm text-gray-600 mt-1">Missing Documents</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
        Accreditation Documents
      </h2>

      {/* Documents Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 h-full">
        <DocumentCard
          label="Joint Statement"
          doc={JointStatement}
          docKey="JointStatement"
        />
        <DocumentCard
          label="Constitution and By-Laws"
          doc={ConstitutionAndByLaws}
          docKey="ConstitutionAndByLaws"
        />
        <DocumentCard
          label="Pledge Against Hazing"
          doc={PledgeAgainstHazing}
          docKey="PledgeAgainstHazing"
        />
      </div>

      {/* Upload Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            {showSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-700">
                  Upload Complete!
                </h3>
                <p className="text-gray-600 mt-2">
                  Your document has been successfully uploaded and is now
                  pending review.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Upload {formatDocumentName(uploadingDocType)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Please select a PDF file for review
                  </p>
                </div>

                <DocumentUploader
                  onFileSelect={setSelectedFile}
                  acceptedFormats="application/pdf"
                  title={`Select PDF for ${formatDocumentName(
                    uploadingDocType
                  )}`}
                />

                {selectedFile && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </div>
                      ) : (
                        "Upload Document"
                      )}
                    </button>
                    <button
                      onClick={closePopup}
                      disabled={isUploading}
                      className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsPopup && selectedDocumentDetails && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col relative">
            <button
              onClick={closeDetailsPopup}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex h-full">
              {/* Left Info Panel */}
              <div className="w-80 bg-gray-50 p-6 border-r overflow-y-auto space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Document Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Document Type
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedDocumentDetails.label}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      File Name
                    </label>
                    <p className="text-gray-900 break-words">
                      {selectedDocumentDetails.fileName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(
                        selectedDocumentDetails.status
                      )}`}
                    >
                      {getStatusIcon(selectedDocumentDetails.status)}
                      <span>{selectedDocumentDetails.status}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Upload Date
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(
                          selectedDocumentDetails.createdAt
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <a
                    href={selectedDocumentDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </a>
                </div>
              </div>

              {/* Right PDF Panel */}
              <div className="flex-1 bg-white">
                <iframe
                  src={`${selectedDocumentDetails.url}#toolbar=1&navpanes=1`}
                  title={`${selectedDocumentDetails.label} PDF Viewer`}
                  className="w-full h-full rounded-r-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Documents({ accreditationData, orgId }) {
  const { JointStatement, PledgeAgainstHazing, ConstituionAndByLaws } =
    accreditationData || {};

  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleAddClick = (docType) => {
    setUploadingDocType(docType);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadingDocType) {
      console.warn("No file or document type selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "organizationProfile",
        accreditationData.organizationProfile
      );
      formData.append("organization", orgId);
      formData.append("file", selectedFile);
      formData.append("accreditationId", accreditationData._id);
      formData.append("docType", uploadingDocType); // <- Important
    } catch (error) {
      console.error("Upload error:", error.message);
    }
  };

  const renderOrUploadBox = (label, doc, key) => {
    if (uploadingDocType === key) {
      return (
        <UploadDocument
          title={`Upload ${label}`}
          onFileSelect={handleFileSelect}
          onSubmit={handleUploadSubmit}
          onCancel={() => {
            setUploadingDocType(null);
            setSelectedFile(null);
          }}
        />
      );
    }

    if (doc) {
      return (
        <DocumentDisplayCard
          name={label}
          downloadUrl={doc.downloadUrl}
          size={doc.size}
        />
      );
    }

    return (
      <div
        onClick={() => handleAddClick(key)}
        className="border border-dashed border-gray-400 p-6 rounded-xl cursor-pointer hover:bg-gray-50 flex items-center gap-4"
      >
        <Upload className="text-gray-600" />
        <span className="text-gray-600 italic">Click to upload {label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4 p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold">Organization Documents</h2>

      {renderOrUploadBox("Joint Statement", JointStatement, "JointStatement")}
      {renderOrUploadBox(
        "Constitution and By-Laws",
        ConstituionAndByLaws,
        "Constitution and By-Laws"
      )}
      {renderOrUploadBox(
        "Pledge Against Hazing",
        PledgeAgainstHazing,
        "PledgeAgainstHazing"
      )}
    </div>
  );
}

export function UploadDocument({
  title = "Upload a Document",
  buttonLabel = "Submit",
  buttonClass = "bg-blue-600 hover:bg-blue-700",
  onFileSelect,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="absolute inset-0 h-full flex items-center justify-center 1w-full bg-black/50 backdrop-blur-sm">
      <div className=" bg-white min-w-xl mx-auto p-6 border border-gray-300 rounded-xl">
        <h3 className="text-lg font-medium">{title}</h3>
        <DocumentUploader onFileSelect={onFileSelect} title={title} />

        <div className="flex justify-end mt-4 gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`${buttonClass} text-white px-6 py-2 rounded-lg transition-colors font-medium`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
