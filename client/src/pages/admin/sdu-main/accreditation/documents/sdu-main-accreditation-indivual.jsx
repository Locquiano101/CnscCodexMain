import axios from "axios";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  File,
  TriangleAlert,
  XCircle,
  Icon,
  AlertCircle,
  Bell,
  X,
} from "lucide-react";

import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { EmailModal } from "../../../../../components/accreditation-email";

export function SduMainAccreditationDocumentIndividualOrganization({
  selectedOrg,
  user,
}) {
  const [accreditationData, setAccreditationData] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showRevisionPopup, setShowRevisionPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchAccreditationInfo = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getAccreditationInfo/${selectedOrg._id}`,
        { withCredentials: true }
      );
      console.log(data);
      setAccreditationData(data);
    } catch (err) {
      console.error("Error fetching accreditation info:", err);
    }
  };

  useEffect(() => {
    fetchAccreditationInfo();
  }, []);

  const openDocumentDetails = (doc, label, docKey) => {
    setSelectedDocument({ doc, label, docKey });
    setShowDocumentDetails(true);
  };

  const handleNotifyOrganization = (label, docKey) => {
    setSelectedDocument({ label, docKey });
    setShowNotificationPopup(true);
  };

  // Email success handler
  const handleEmailSuccess = (response) => {
    console.log("Email sent successfully:", response);
    // You can add additional success handling here
    // Maybe show a toast notification or update UI
  };

  // Email error handler
  const handleEmailError = (error) => {
    console.error("Failed to send email:", error);
    // You can add error handling here
    // Maybe show an error toast
  };

  const ApprovePopup = () => {
    const handleUpdateStatus = async ({ documentId, status }) => {
      try {
        // 1. Update the document status
        await axios.post(
          `${API_ROUTER}/UpdateDocument/${documentId}`,
          { status },
          { withCredentials: true }
        );

        // 2. Refresh accreditation data
        const { data } = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${selectedOrg?._id}`,
          { withCredentials: true }
        );

        setAccreditationData(data);
        console.log(`Document ${documentId} status updated to ${status}`);

        // Close popup after success
        setShowApprovePopup(false);
      } catch (err) {
        console.error("Error updating document status:", err);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Approve Document</h3>
          <p className="text-gray-600 mb-4">
            Approve {selectedDocument?.label}?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowApprovePopup(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                handleUpdateStatus({
                  documentId: selectedDocument?.doc?._id,
                  status: "Approved",
                })
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DocumentDetailsPopup = () => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <File className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedDocument?.label}
                </h3>
                <p className="text-sm text-gray-500">
                  Uploaded{" "}
                  {new Date(
                    selectedDocument?.doc?.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusStyle(
                  selectedDocument?.doc?.status
                )}`}
              >
                {getStatusIcon(selectedDocument?.doc?.status)}
                <span>{selectedDocument?.doc?.status}</span>
              </div>
              <button
                onClick={() => setShowDocumentDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Document Viewer */}
          <div className="flex-1 p-6">
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${selectedDocument?.doc?.fileName}`}
                title={`${selectedDocument?.label} PDF Viewer`}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setShowDocumentDetails(false);
                setShowApprovePopup(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve Document
            </button>
            <button
              onClick={() => {
                setShowDocumentDetails(false);
                setShowRevisionPopup(true);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Request Revision
            </button>
            <button
              onClick={() => setShowDocumentDetails(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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

  const RevisionPopup = () => {
    const [revisionNotes, setRevisionNotes] = useState("");

    const handleUpdateRevision = async () => {
      try {
        // 1. Update the document status with revision notes
        await axios.post(
          `${API_ROUTER}/UpdateDocument/${selectedDocument?.doc?._id}`,
          {
            status: "Revision From SDU",
            revisionNotes,
            logs: "revision from the Sdu by the SDU",
          },
          { withCredentials: true }
        );

        // 2. Refresh accreditation data
        const { data } = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${selectedOrg?._id}`,
          { withCredentials: true }
        );

        setAccreditationData(data);
        console.log(
          `Document ${selectedDocument?.doc?._id} status updated to Revision From SDU`
        );

        // Close revision popup after success
        setShowRevisionPopup(false);
      } catch (err) {
        console.error("Error updating document status:", err);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">Create Revision</h3>
          <p className="text-gray-600 mb-4">
            Create a revision for {selectedDocument?.label}
          </p>

          {/* Text box for revision notes */}
          <textarea
            className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter revision notes here..."
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            rows={4}
          />

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowRevisionPopup(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRevision}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Revision
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading or nothing if data not ready yet
  if (!accreditationData) {
    return <div className="p-4 text-gray-500">Loading documents...</div>;
  }

  const DocumentCard = ({ label, doc, docKey }) => {
    return doc?.fileName ? (
      <div
        onClick={() => openDocumentDetails(doc, label, docKey)}
        className="flex-1 h-full transition-all duration-500 hover:bg-amber-100 cursor-pointer rounded-lg"
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
          onClick={() => handleNotifyOrganization(label, docKey)}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-full flex flex-col justify-center items-center p-8 cursor-pointer hover:border-amber-400 hover:bg-amber-100 transition-all duration-500 group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-300 transition-colors">
            <TriangleAlert className="w-8 h-8 text-gray-400 group-hover:text-amber-700 transition-colors" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Not Yet Uploaded: {label}
          </h3>
          <p className="text-sm text-gray-500">Notify Organization</p>
        </div>
      </div>
    );
  };

  const { JointStatement, PledgeAgainstHazing, ConstitutionAndByLaws } =
    accreditationData;

  return (
    <>
      <div className="grid h-full gap-4 p-4 lg:grid-cols-3">
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
      {/* Popups */}
      {showApprovePopup && <ApprovePopup />}
      {showRevisionPopup && <RevisionPopup />}

      <EmailModal
        open={showNotificationPopup}
        onClose={() => setShowNotificationPopup(false)}
        title="Notify Organization About Missing Document"
        description={`Send an email notification to ${selectedOrg?.orgName} regarding the missing ${selectedDocument?.label} document.`}
        sendButtonLabel="Send Notification"
        route="accreditationEmailInquiry" // Adjust this route as needed
        Subject={`Missing Document: ${selectedDocument?.label} Required for Accreditation`}
        onSuccess={handleEmailSuccess}
        onError={handleEmailError}
        orgData={selectedOrg}
        user={user}
      />

      {showDocumentDetails && <DocumentDetailsPopup />}
    </>
  );
}
