import axios from "axios";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  File,
  FileQuestion,
  TriangleAlert,
  Upload,
  XCircle,
} from "lucide-react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

export function SduMainAccreditationDocumentOverview({ onSelectOrg }) {
  return <> mama mo 2</>;
}

export function SduMainAccreditationDocumentOrganization({ selectedOrg }) {
  const [accreditationData, setAccreditationData] = useState(null);
  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [showRevisionPopup, setShowRevisionPopup] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchAccreditationInfo = async (orgId) => {
    if (!orgId) return;
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getAccreditationInfo/${orgId}`,
        { withCredentials: true }
      );
      console.log(data);
      setAccreditationData(data);
    } catch (err) {
      console.error("Error fetching accreditation info:", err);
    }
  };

  useEffect(() => {
    if (selectedOrg?._id) {
      fetchAccreditationInfo(selectedOrg._id);
    }
  }, [selectedOrg?._id]);

  const handleDropdownAction = (action, doc, label, docKey) => {
    setSelectedDocument({ doc, label, docKey });
    if (action === "update") {
      setShowApprovePopup(true);
    } else if (action === "revision") {
      setShowRevisionPopup(true);
    }
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
          onClick={() => console.log(docKey)}
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
    </>
  );
}
