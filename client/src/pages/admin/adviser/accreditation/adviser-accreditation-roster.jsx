import { useEffect, useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import axios from "axios";
import { MoreHorizontal, Search, X } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { DonePopUp } from "../../../../components/components";
import { EmailModal } from "../../../../components/accreditation-email";

export function AdviserRosterData({ orgData, user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [approvalModal, setApprovalModal] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [incompleteModal, setIncompleteModal] = useState(false);
  const [popup, setPopup] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ search state
  // In your AdviserRosterData component, add this state

  // Add loading states
  const [approvalLoading, setApprovalLoading] = useState(false);

  const fetchRosterMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getRosterMembers/${orgData._id}`
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
    if (orgData._id) {
      fetchRosterMembers();
    }
  }, [orgData._id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleApproval = async ({ status, revisionNotes }) => {
    if (!rosterData?.roster?.isComplete) {
      setIncompleteModal(true);
      return;
    }

    try {
      setApprovalLoading(true); // ✅ Set approval loading

      const payload = { overAllStatus: status };
      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      const response = await axios.post(
        `${API_ROUTER}/postApproveRoster/${rosterData.roster._id}`,
        payload
      );

      setPopup({
        type: "success",
        message: "Your action has been sent successfully!",
      });
      setError(null);
    } catch (err) {
      console.error("❌ Failed to approve:", err);
      setPopup({
        type: "error",
        message: "Something went wrong while processing your request.",
      });
    } finally {
      setApprovalLoading(false); // ✅ Reset approval loading
    }
  };

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

  const handleDropdownAction = (id) => {
    setShowDropdown(false);

    if (id === "revision") {
      setRevisionModal(true);
    } else if (id === "Approval") {
      setApprovalModal(true);
    }
  };

  const rosterMembers = rosterData?.rosterMembers || [];

  // ✅ Filter roster based on search query
  const filteredRoster = rosterMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dropdownItems = [
    { id: "revision", label: "Revision of Roster" },
    { id: "Approval", label: "Approval of Roster" },
  ];

  return (
    <div className="flex p-4 flex-col bg-gray-50 h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 w-full bg-gray-200 shadow-md border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Roster Management
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Roster List Status:{" "}
              <span
                className={`${
                  rosterData.roster.isComplete
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {rosterData.roster.isComplete ? "Complete" : "Not Complete"}
              </span>
            </p>
            <p className="text-sm font-medium text-gray-600">
              Approval Status:{" "}
              <span className="text-indigo-600">
                {rosterData.roster.overAllStatus}
              </span>
            </p>
          </div>

          {/* Dropdown Container */}
          <div className="relative dropdown-container">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreHorizontal size={28} className="text-cnsc-primary-color" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border border-gray-300 z-10 rounded-lg overflow-hidden">
                <div className="flex flex-col">
                  {dropdownItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleDropdownAction(item.id)}
                      className="px-4 py-3 text-left hover:bg-amber-200 transition-colors duration-200"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Search Bar */}
        <div className="flex items-center gap-2 w-full max-w-md">
          <Search className="text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search roster by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
      {/* Content */}
      <div className="h-full overflow-auto">
        {!rosterData || filteredRoster.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg bg-white p-6">
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  onClick={() => setAlertModal(true)}
                >
                  Notify Organization
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 overflow-auto">
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
      {/* Revision Modal → EmailModal */}
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

      {/* Incomplete Modal → EmailModal */}
      <EmailModal
        open={incompleteModal}
        onClose={() => setIncompleteModal(false)}
        route="accreditationEmailInquiry"
        title="Compose Email – Roster Incomplete"
        description="The roster is incomplete. Notify the organization to finish their submission."
        sendButtonLabel="Notify Organization"
        orgData={orgData}
        Subject="Incomplete Roster"
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

      {/* Existing Alert Modal → stays the same */}
      <EmailModal
        open={alertModal}
        onClose={() => setAlertModal(false)}
        route="accreditationEmailInquiry"
        Subject="The roster is has not “The roster has not been initiated. Please notify the organization to complete their submission."
        title="Notify Organization About Modal"
        sendButtonLabel="Notify President"
        orgData={orgData}
        user={user}
        onSuccess={() => setPopup({ type: "success", message: "Email sent!" })}
        onError={() =>
          setPopup({ type: "error", message: "Failed to send email" })
        }
      />

      {/* No Roster Email */}
      <EmailModal
        open={alertModal}
        onClose={() => setAlertModal(false)}
        Subject="Roster Initiation"
        route="accreditationEmailInquiry"
        title="Roster List Notification"
        sendButtonLabel="Notify President"
        orgData={orgData} // ✅ pass org data
        user={user} // ✅ pass adviser/user data
        onSuccess={() => setPopup({ type: "success", message: "Email sent!" })}
        onError={() =>
          setPopup({ type: "error", message: "Failed to send email" })
        }
      />
      {approvalModal && (
        <div className="absolute bg-black/10 backdrop-blur-xs inset-0 flex justify-center items-center">
          <div className="h-fit bg-white w-1/4 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            {/* Close Button */}
            <button
              onClick={() => setApprovalModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              disabled={approvalLoading} // ✅ Disable when loading
            >
              ✕
            </button>

            <h1 className="text-lg font-semibold mb-4">
              Approval: Roster of Organization
            </h1>

            <p className="mb-4 text-gray-700">
              By approving this section of the accreditation, you confirm that
              you have reviewed the information provided and consent to its
              approval. Would you like to proceed?
            </p>

            <button
              onClick={() => {
                handleApproval("Approved By the Adviser"); // 👈 call with "Approved"
                setApprovalModal(false);
              }}
              disabled={approvalLoading} // ✅ Disable when loading
              className={`mt-6 px-6 py-2 rounded-lg text-sm font-medium shadow-md transition ${
                approvalLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {approvalLoading ? "Processing..." : "Confirm Approval"}{" "}
              {/* ✅ Loading text */}
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

const RosterMemberCard = ({ member, orgId }) => {
  return (
    <div className="bg-white w-full h-full rounded-lg flex flex-col gap-2 items-center shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <img
          src={
            member.profilePicture
              ? `${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`
              : "/cnsc-logo.png"
          }
          alt="Profile"
          className="max-h-32 aspect-square border object-cover rounded"
        />
      </div>

      <div className="space-y-1 text-center">
        <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
        <p className="text-sm font-medium text-indigo-600">{member.position}</p>
        <p className="text-sm text-gray-600">{member.email}</p>
        <p className="text-sm text-gray-600">{member.contactNumber}</p>
        <p className="text-sm text-gray-500">{member.address}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
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
