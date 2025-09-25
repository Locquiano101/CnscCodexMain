import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import {
  File,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  FileText,
  Calendar,
  Download,
  MoreHorizontal,
  Triangle,
  TriangleAlert,
  CircleCheck,
  CircleX,
  Pen,
} from "lucide-react";

import axios from "axios";
import { DonePopUp } from "../../../../components/components";

export function DeanAccreditationDocument({ selectedOrg }) {
  const [accreditationDocumentData, setAccreditationDocumentData] =
    useState(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [revisionModal, setRevisionModal] = useState(false);
  const [message, setMessage] = useState("");
  const [popup, setPopup] = useState(null);

  const [approvalModal, setApprovalModal] = useState(false);
  useEffect(() => {
    const fetchAccreditationInfo = async () => {
      if (!selectedOrg._id) return;
      try {
        const { data } = await axios.get(
          `${API_ROUTER}/getAccreditatationDocuments/${selectedOrg._id}`,
          {
            withCredentials: true,
          }
        );
        console.log("+++++++++++");
        console.log(data);
        setAccreditationDocumentData(data);
      } catch (err) {
        console.error("Error fetching accreditation info:", err);
      }
    };
    fetchAccreditationInfo();
  }, [selectedOrg._id]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApproval = async ({ status, revisionNotes }) => {
    try {
      const response = await axios.post(
        `${API_ROUTER}/UpdateDocument/${selectedDocumentDetails._id}`,
        { status, revisionNotes }
      );

      console.log("✅ Success:", response.data);

      setPopup({
        type: "success",
        message: "Your action has been sent successfully!",
      });
    } catch (error) {
      console.log("❌ Approval failed:", error);

      setPopup({
        type: "error",
        message: "Something went wrong while processing your request.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const openDocumentDetails = (doc, label, docKey) => {
    if (!doc) return;
    console.log(doc);
    setSelectedDocumentDetails({
      ...doc,
      label,
      docKey,
      url: `${DOCU_API_ROUTER}/${selectedOrg._id}/${doc.fileName}`,
    });
    setShowDetailsPopup(true);
  };
  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedDocumentDetails(null);
  };
  const openUpload = (docKey) => {
    console.log("Opening upload for:", docKey);
    // Add your upload logic here
  };

  const DocumentCard = ({ label, doc, docKey }) => {
    return doc?.fileName ? (
      <div
        onClick={() => openDocumentDetails(doc, label, docKey)}
        className="flex-1 h-full  transition-all duration-500 hover:bg-amber-100 cursor-pointer rounded-lg"
      >
        <div className=" h-full flex flex-col  bg-white rounded-lg shadow-md  hover:shadow-md transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-gray-100">
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
              <div className="flex flex-col  gap-2 items-end justify-between h-full  ">
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
          </div>

          {/* PDF Viewer */}
          <div className="flex-1  overflow-hidden">
            <iframe
              src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${doc.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
              title={`${label} PDF Viewer`}
              className="w-full h-full"
            />
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
            <TriangleAlert className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Not Yet Uploaded: {label}
          </h3>
          <p className="text-sm text-gray-500">Notify Organization</p>
        </div>
      </div>
    );
  };

  if (!accreditationDocumentData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full  p-4 gap-4 flex flex-col h-full bg-gray-200">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Accreditation Summary
        </h2>
        <div className="flex items-center justify-evenly gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                [
                  accreditationDocumentData.JointStatement,
                  accreditationDocumentData.ConstitutionAndByLaws,
                  accreditationDocumentData.PledgeAgainstHazing,
                  accreditationDocumentData.PresidentProfile,
                ].filter((doc) => doc?.status === "Approved").length
              }
            </div>
            <div className="text-sm text-gray-600">Approved Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                [
                  accreditationDocumentData.JointStatement,
                  accreditationDocumentData.ConstitutionAndByLaws,
                  accreditationDocumentData.PledgeAgainstHazing,
                  accreditationDocumentData.PresidentProfile,
                ].filter((doc) => doc?.status === "Pending").length
              }
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {
                [
                  accreditationDocumentData.JointStatement,
                  accreditationDocumentData.ConstitutionAndByLaws,
                  accreditationDocumentData.PledgeAgainstHazing,
                  accreditationDocumentData.PresidentProfile,
                ].filter((doc) => doc === null).length
              }
            </div>
            <div className="text-sm text-gray-600">Missing Documents</div>
          </div>
        </div>
      </div>
      {/* Documents Grid */}
      <div className="grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Joint Statement */}
        <DocumentCard
          label="Joint Statement"
          doc={accreditationDocumentData.JointStatement}
          docKey="JointStatement"
        />

        {/* Constitution and By-Laws */}
        <DocumentCard
          label="Constitution & By-Laws"
          doc={accreditationDocumentData.ConstitutionAndByLaws}
          docKey="ConstitutionAndByLaws"
        />

        {/* Pledge Against Hazing */}
        <DocumentCard
          label="Pledge Against Hazing"
          doc={accreditationDocumentData.PledgeAgainstHazing}
          docKey="PledgeAgainstHazing"
        />
      </div>
      {/* Document Details Modal */}
      {showDetailsPopup && selectedDocumentDetails && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3/4 max-h-11/12 w-full h-full overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            <button
              onClick={closeDetailsPopup}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 bg-white/80 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex h-full ">
              {/* Left Panel - Document Info */}
              <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Document Details
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        Document Type
                      </label>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedDocumentDetails.label}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
                        File Name
                      </label>
                      <p className="text-gray-900 break-all">
                        {selectedDocumentDetails.fileName}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">
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
                      <label className="text-sm font-medium text-gray-600 block mb-1">
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

                    {selectedDocumentDetails.status === "Pending" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <p className="font-medium text-amber-800">
                            Pending Review
                          </p>
                        </div>
                        <p className="text-sm text-amber-700">
                          This document is currently being reviewed by
                          administrators. You will be notified once the review
                          is complete.
                        </p>
                      </div>
                    )}

                    {selectedDocumentDetails.status === "Approved" && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <p className="font-medium text-emerald-800">
                            Approved
                          </p>
                        </div>
                        <p className="text-sm text-emerald-700">
                          This document has been reviewed and approved by
                          administrators.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
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
                  <div className="flex gap-4 ">
                    <button
                      onClick={() => {
                        setApprovalModal(true);
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <CircleCheck className="w-4 h-4" />
                      Approve Document
                    </button>
                    <button
                      onClick={() => {
                        setRevisionModal(true);
                      }}
                      className="w-full bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Pen className="w-4 h-4" />
                      Revision Document
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel - PDF Viewer */}
              <div className="flex-1 bg-white">
                <div className="h-full">
                  <iframe
                    src={`${selectedDocumentDetails.url}#toolbar=1&navpanes=1`}
                    title={`${selectedDocumentDetails.label} PDF Viewer`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisionModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center z-100">
          <div className="h-fit bg-white w-1/6 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setRevisionModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">Revision:</h1>

            <div className="flex flex-col gap-4 w-full">
              {/* Message */}
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="border rounded-lg w-full h-28 p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                handleApproval({
                  status: "Revision From the Dean",
                  revisionNotes: message,
                }); // 👈 call with "Revision"
                setRevisionModal(false);
              }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center z-100">
          <div className="h-fit bg-white w-1/4 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setApprovalModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">
              Approval: {selectedDocumentDetails.fileName} of Organization
            </h1>

            <p className="mb-4 text-gray-700">
              By approving this section of the accreditation, you confirm that
              you have reviewed the information provided and consent to its
              approval. Would you like to proceed?
            </p>

            <button
              onClick={() => {
                handleApproval({
                  status: "Approved by the Dean",
                }); // 👈 call with "Revision" // 👈 call with "Approved"
                setApprovalModal(false);
              }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
            >
              Confirm Approval
            </button>
          </div>
        </div>
      )}
      {popup && (
        <DonePopUp
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
