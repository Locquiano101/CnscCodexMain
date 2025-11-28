import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import PlaceholderLogo from "../../../../assets/cnsc-codex.svg";
import axios from "axios";
import { Users } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { DonePopUp } from "../../../../components/components";

export function DeanRosterData({ selectedOrg }) {
  // Replaced three-dots dropdown with visible action buttons
  const [notificationModal, setNotificationModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [incompleteConfirmModal, setIncompleteConfirmModal] = useState(false);
  const [confirmUpdateModal, setConfirmUpdateModal] = useState(false);
  const [popup, setPopup] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Add this new state

  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(
    `Dear ${selectedOrg.orgName},\n\nWe kindly request you to complete your roster list as part of the accreditation process. Please ensure that all required members and details are submitted at the earliest convenience.\n\nThank you for your cooperation.\n\nSincerely,\nAdviser`
  );
  const [subject, setSubject] = useState("Notification for Roster Lists");

  const fetchRosterMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getRosterMembers/${selectedOrg._id}`
      );
      setRosterData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch organization info:", err);
      setError("Failed to load roster members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrg._id) {
      fetchRosterMembers();
    }
  }, []);

  // Removed dropdown click-outside handler

  const sendNotification = async () => {
    if (!message.trim()) {
      alert("Message cannot be empty");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_ROUTER}/sendNotificationRoster`, {
        organizationId: selectedOrg._id,
        subject,
        message,
      });
      setPopup({
        type: "success",
        message: "Your action has been sent successfully!",
      });
      setError(null);
    } catch (err) {
      console.error("Failed to send notification:", err.response?.data);
      setError("Failed to send notification");
      setPopup({
        type: "error",
        message: "Something went wrong while processing your request.",
      });
    } finally {
      setLoading(false);
      setNotificationModal(false);
    }
  };

  const handleApproval = async ({
    status,
    revisionNotes,
    forceApprove = false,
  }) => {
    // If roster incomplete and not forcing approval, open confirmation modal
    if (!rosterData?.roster?.isComplete && !forceApprove) {
      setIncompleteConfirmModal(true);
      return;
    }

    // Proceed with approval (either roster is complete OR user confirmed to proceed)
    try {
      setApprovalLoading(true);
      const payload = { overAllStatus: status };
      if (revisionNotes?.trim()) payload.revisionNotes = revisionNotes;

      const res = await axios.post(
        `${API_ROUTER}/postApproveRoster/${rosterData.roster._id}`,
        payload
      );
      console.log(res);
      setRosterData((prev) => ({
        ...prev,
        roster: { ...prev.roster, overAllStatus: status },
      }));

      setPopup({
        type: "success",
        message: "Your action has been sent successfully!",
      });
      setError(null);

      // Close the approval modal if it's open
      setApprovalModal(false);
      setIncompleteConfirmModal(false);
      setRevisionModal(false);
    } catch (err) {
      console.error("Failed to approve:", err);
      setPopup({
        type: "error",
        message: "Something went wrong while processing your request.",
      });
    } finally {
      setRevisionModal(false);
      setApprovalLoading(false);
    }
  };
  const handleDropdownAction = (id) => {
    const deanStatuses = ["Revision From the Dean", "Approved By the Dean"];
    const adviserStatuses = [
      "Approved by the Adviser",
      "Revision from the Adviser",
    ];

    const currentStatus = rosterData?.roster?.overAllStatus
      ?.toLowerCase()
      .trim();

    const isDeanUpdated = deanStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    const isAdviserValid = adviserStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    if (isDeanUpdated || !isAdviserValid) {
      setPendingAction(id);
      setConfirmMessage(
        isDeanUpdated
          ? "This roster has already been updated by the Dean. Do you want to continue updating it again?"
          : "This roster has not yet been reviewed by the Adviser. Do you want to proceed anyway?"
      );
  setConfirmUpdateModal(true);
  return;
    }

  if (id === "revision") setRevisionModal(true);
  else if (id === "Approval") setApprovalModal(true);
  };

  const rosterMembers = rosterData?.rosterMembers || [];

  const handleExportExcel = async () => {
    const members = rosterData?.rosterMembers || [];
    if (!members.length) {
      alert("No roster data to export.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Roster Members");

      worksheet.columns = [
        { header: "Name", key: "name", width: 25 },
        { header: "Position", key: "position", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Contact Number", key: "contactNumber", width: 20 },
        { header: "Address", key: "address", width: 40 },
        { header: "Birth Date", key: "birthDate", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      members.forEach((m) => {
        worksheet.addRow({
          name: m.name,
          position: m.position,
          email: m.email,
          contactNumber: m.contactNumber,
          address: m.address,
          birthDate: m.birthDate
            ? new Date(m.birthDate).toLocaleDateString()
            : "Not provided",
          status: m.status,
        });
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6F1" } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "RosterMembers.xlsx");
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export. Please try again.");
    }
  };

  const actions = [
    { id: "revision", label: "Request Revision", onClick: () => handleDropdownAction("revision"), tone: "warning" },
    { id: "Approval", label: "Approve Roster", onClick: () => handleDropdownAction("Approval"), tone: "primary" },
    { id: "export", label: "Export Spreadsheet", onClick: handleExportExcel, tone: "ghost" },
  ];

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading roster members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Roster Management
        </h1>
        <p className="text-sm text-gray-600">
          Roster List Status:{" "}
          <span className="font-semibold">{rosterData.roster.isComplete ? "Complete" : "Not Complete"}</span>
        </p>
        <p className="text-sm text-gray-600">
          Roster List Approval Status: <span className="font-semibold">{rosterData.roster.overAllStatus}</span>
        </p>

        {/* Action Buttons (Replaces three-dots menu) */}
        <div className="flex gap-2 items-center justify-end mt-4">
          {actions.map((a) => (
            <button
              key={a.id}
              onClick={a.onClick}
              className={
                a.tone === "primary"
                  ? "px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  : a.tone === "warning"
                  ? "px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  : "px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              }
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {!rosterData || !rosterMembers.length ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg bg-white p-12">
            <p className="text-gray-500 mb-2">
              No roster has been started yet.
            </p>
            <p className="text-gray-400 mb-4">
              Click the Actions button above to begin creating your student
              leader roster.
            </p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => setNotificationModal(true)}
            >
              Notify Organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
            {rosterMembers.map((member) => (
              <RosterMemberCard
                key={member._id}
                member={member}
                orgId={selectedOrg._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Notification Modal (Unified for alert and incomplete) */}
      {notificationModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setNotificationModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h1 className="text-lg font-semibold mb-4">Notify Organization</h1>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
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
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setNotificationModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={sendNotification}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisionModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setRevisionModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={approvalLoading}
            >
              ✕
            </button>
            <h1 className="text-lg font-semibold mb-4">
              Revision: Notify Organization
            </h1>
            <div className="flex flex-col gap-4 w-full">
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
              onClick={async () => {
                setApprovalLoading(true);
                await handleApproval({
                  status: "Revision From the Dean",
                  revisionNotes: message,
                  forceApprove: true,
                });
                setApprovalLoading(false);
              }}
              disabled={approvalLoading}
              className={`mt-6 w-full py-2 rounded-lg text-sm font-medium shadow-md transition ${
                approvalLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {approvalLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      {approvalModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setApprovalModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={approvalLoading}
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">
              Approval: Roster of Organization
            </h1>

            <p className="text-gray-700 mb-6">
              By approving this roster, you confirm that you have reviewed the
              information provided and consent to its approval. Would you like
              to proceed?
            </p>

            <button
              onClick={() => {
                handleApproval({ status: "Approved By the Dean" });
              }}
              disabled={approvalLoading}
              className={`w-full py-2 rounded-lg text-sm font-medium shadow-md transition ${
                approvalLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {approvalLoading ? "Processing..." : "Confirm Approval"}
            </button>
          </div>
        </div>
      )}
      {/* ---------------- Incomplete Confirmation Modal ---------------- */}
      {incompleteConfirmModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setIncompleteConfirmModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">Roster Incomplete</h1>

            <p className="text-gray-700 mb-6">The roster is incomplete.</p>

            <div className=" flex gap-4 ">
              <button
                onClick={() => {
                  handleApproval({
                    status: "Approved by the Dean",
                    forceApprove: true,
                  });
                }}
                disabled={approvalLoading}
                className={`w-full py-2 rounded-lg text-sm font-medium ${
                  approvalLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {approvalLoading ? "Processing..." : "Proceed Anyway (Approve)"}
              </button>

              <button
                onClick={() => {
                  setIncompleteConfirmModal(false);
                  setRevisionModal(true);
                }}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <DonePopUp
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}

      {/* Confirm Update Modal */}
      {confirmUpdateModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center">
          <div className="h-fit bg-white w-1/3 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setConfirmUpdateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h1 className="text-lg font-semibold mb-4">Confirmation</h1>
            <p className="text-sm text-gray-700 mb-4">{confirmMessage}</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmUpdateModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingAction === "revision") setRevisionModal(true);
                  else if (pendingAction === "Approval") setApprovalModal(true);
                  setConfirmUpdateModal(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const RosterMemberCard = ({ member, orgId }) => {
  return (
    <div className="bg-white w-full h-full rounded-lg flex flex-col gap-2 items-center shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <img
          key={
            member.profilePicture
              ? `${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`
              : "placeholder"
          }
          src={
            member.profilePicture
              ? `${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`
              : PlaceholderLogo
          }
          alt="Profile Picture"
          className="max-h-32 aspect-square border object-cover rounded"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = PlaceholderLogo;
          }}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Name: {member.name}
        </h3>
        <p className="text-sm font-medium text-indigo-600">{member.position}</p>
        <p className="text-sm text-gray-600">{member.email}</p>
        <p className="text-sm text-gray-600">{member.contactNumber}</p>
        <p className="text-sm text-gray-500">{member.address}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Birth Date:{" "}
          {member.birthDate
            ? new Date(member.birthDate).toLocaleDateString()
            : "Not provided"}
        </p>
        <p className="text-xs text-gray-500">Status: {member.status}</p>
      </div>
    </div>
  );
};
