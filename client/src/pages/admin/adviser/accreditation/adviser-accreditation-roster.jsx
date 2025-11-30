import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import axios from "axios";
import { Search } from "lucide-react";
import { DonePopUp } from "../../../../components/components";
import { EmailModal } from "../../../../components/accreditation-email";
import { RosterMemberCard } from "../../../../components/roster-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AdviserRosterData({ orgData, user }) {
  const [alertModal, setAlertModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [incompleteModal, setIncompleteModal] = useState(false);
  const [popup, setPopup] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [incompleteConfirmModal, setIncompleteConfirmModal] = useState(false);
  const [pendingApprovalStatus, setPendingApprovalStatus] = useState(null);

  // Fetch roster members
  const fetchRosterMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getRosterMembers/${orgData._id}`
      );
      setRosterData(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch roster members:", err);
      setError("Failed to load roster members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgData._id) fetchRosterMembers();
  }, [orgData._id]);

  // Removed dropdown click-outside handler (replaced with visible buttons)

  const handleApproval = async ({
    status,
    revisionNotes,
    forceApprove = false,
  }) => {
    // If roster incomplete and not forcing approval, open confirmation modal
    if (!rosterData?.roster?.isComplete && !forceApprove) {
      setPendingApprovalStatus(status);
      setIncompleteConfirmModal(true);
      return;
    }

    // Proceed with approval (either roster is complete OR user confirmed to proceed)
    try {
      setApprovalLoading(true);
      const payload = { overAllStatus: status };
      if (revisionNotes?.trim()) payload.revisionNotes = revisionNotes;

      await axios.post(
        `${API_ROUTER}/postApproveRoster/${rosterData.roster._id}`,
        payload
      );

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
    } catch (err) {
      console.error("Failed to approve:", err);
      setPopup({
        type: "error",
        message: "Something went wrong while processing your request.",
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading roster members...</p>
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

  const handleDropdownAction = (id) => {
    if (id === "revision") setRevisionModal(true);
    else if (id === "Approval") setApprovalModal(true);
  };

  const rosterMembers = rosterData?.rosterMembers || [];
  const filteredRoster = rosterMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actions = [
    { id: "revision", label: "Request Revision", tone: "warning" },
    { id: "Approval", label: "Approve Roster", tone: "primary" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ---------------- Header ---------------- */}
      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-5 m-6 mb-4 flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Roster Management
          </h1>

          <div className="flex flex-wrap items-center gap-6">
            <p className="text-sm font-medium text-gray-700">
              Roster List Status:{" "}
              <span
                className={`${
                  rosterData.roster.isComplete
                    ? "text-green-600"
                    : "text-red-600"
                } font-semibold`}
              >
                {rosterData.roster.isComplete ? "Complete" : "Not Complete"}
              </span>
            </p>

            <p className="text-sm font-medium text-gray-700">
              Approval Status:{" "}
              <span className="text-indigo-600 font-semibold">
                {rosterData.roster.overAllStatus || "Pending"}
              </span>
            </p>

            {/* Action Buttons (Replaces dropdown) */}
            <div className="flex gap-2 items-center">
              {actions.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleDropdownAction(a.id)}
                  className={
                    a.tone === "primary"
                      ? "px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                      : "px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Search Section ---------------- */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5 w-full max-w-lg mb-4 mx-6 flex-shrink-0">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Roster Member
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search roster by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <Search className="text-gray-500" size={20} />
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      <div className="flex-1 overflow-y-auto mx-6 mb-6">
        {!rosterData || filteredRoster.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-8">
            <p className="text-gray-500 mb-2">
              {searchQuery
                ? "No members match your search."
                : "No roster has been started yet."}
            </p>

            {!searchQuery && (
              <>
                <p className="text-gray-400 mb-4">
                  Click the Actions button above to begin creating your student
                  leader roster.
                </p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition-colors"
                  onClick={() => setAlertModal(true)}
                >
                  Notify Organization
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 py-4">
            {filteredRoster.map((member) => (
              <RosterMemberCard
                key={member._id}
                member={member}
                orgId={orgData._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Modals ---------------- */}
      <EmailModal
        open={revisionModal}
        onClose={() => setRevisionModal(false)}
        route="accreditationEmailInquiry"
        title="Compose Email – Revision Notice"
        description="Send a revision request to the organization."
        sendButtonLabel="Send Revision Request"
        orgData={orgData}
        user={user}
        onSuccess={() =>
          setPopup({ type: "success", message: "Revision email sent!" })
        }
        onError={() =>
          setPopup({ type: "error", message: "Failed to send revision email" })
        }
      />

      <EmailModal
        open={incompleteModal}
        onClose={() => setIncompleteModal(false)}
        route="accreditationEmailInquiry"
        title="Compose Email – Roster Incomplete"
        description="The roster is incomplete. Notify the organization to finish their submission."
        sendButtonLabel="Notify Organization"
        orgData={orgData}
        user={user}
        onSuccess={() =>
          setPopup({
            type: "success",
            message: "Incomplete roster notification sent!",
          })
        }
        onError={() =>
          setPopup({
            type: "error",
            message: "Failed to send incomplete roster email",
          })
        }
      />

      <EmailModal
        open={alertModal}
        onClose={() => setAlertModal(false)}
        route="accreditationEmailInquiry"
        title="Roster List Notification"
        sendButtonLabel="Notify President"
        orgData={orgData}
        user={user}
        onSuccess={() => setPopup({ type: "success", message: "Email sent!" })}
        onError={() =>
          setPopup({ type: "error", message: "Failed to send email" })
        }
      />

      <Dialog open={approvalModal} onOpenChange={setApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approval: Roster of Organization</DialogTitle>
            <DialogDescription>
              By approving this roster, you confirm that you have reviewed the
              information provided and consent to its approval. Would you like
              to proceed?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => setApprovalModal(false)}
              variant="outline"
              disabled={approvalLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleApproval({ status: "Approved By the Adviser" });
              }}
              disabled={approvalLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {approvalLoading ? "Processing..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------- Incomplete Confirmation Modal ---------------- */}
      <Dialog open={incompleteConfirmModal} onOpenChange={setIncompleteConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Roster Incomplete</DialogTitle>
            <DialogDescription>
              The roster is incomplete.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-4 sm:justify-start">
            <Button
              onClick={() => {
                handleApproval({
                  status: pendingApprovalStatus,
                  forceApprove: true,
                });
              }}
              disabled={approvalLoading}
              className="bg-indigo-600 hover:bg-indigo-700 flex-1"
            >
              {approvalLoading ? "Processing..." : "Proceed Anyway (Approve)"}
            </Button>

            <Button
              onClick={() => {
                setIncompleteConfirmModal(false);
                setRevisionModal(true);
              }}
              variant="outline"
              className="flex-1"
            >
              Send Revision Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
