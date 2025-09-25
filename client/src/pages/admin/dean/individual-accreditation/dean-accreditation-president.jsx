import {
  Edit,
  Trash2,
  Camera,
  Plus,
  X,
  User,
  Calendar,
  MapPin,
  Award,
  Clock,
  MoreVertical,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { DonePopUp } from "../../../../components/components";

export function DeanPresident({ selectedOrg }) {
  const [presidents, setPresidents] = useState([]);
  const [currentPresident, setCurrentPresident] = useState(null);
  const [remainingPresidents, setRemainingPresidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orgId = selectedOrg.organization._id;

  useEffect(() => {
    const GetAndSetPresidents = async () => {
      if (!orgId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_ROUTER}/getPresidents/${orgId}`
        );
        const data = response.data;

        setPresidents(data);

        if (selectedOrg?.orgPresident?._id) {
          const orgPresidentId = selectedOrg.orgPresident._id;

          const matchedPresident = data.find(
            (president) => president._id === orgPresidentId
          );

          if (matchedPresident) {
            setCurrentPresident(matchedPresident);

            // Remaining presidents (exclude current one)
            const remaining = data.filter(
              (president) => president._id !== orgPresidentId
            );
            setRemainingPresidents(remaining);
          } else {
            // No match found → treat all as previous
            setRemainingPresidents(data);
          }
        } else {
          // No orgPresident → all are previous
          setRemainingPresidents(data);
        }
      } catch (error) {
        console.error("Error fetching presidents:", error);
        setError("Failed to load presidents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    GetAndSetPresidents();
  }, [orgId, selectedOrg?.orgPresident]);

  const handleEdit = (president) => {
    console.log("Edit clicked for:", president.name);
  };

  const handleDelete = (president) => {
    console.log("Delete clicked for:", president.name);
  };

  // Show loading screen while fetching data
  if (loading) {
    <div className="flex flex-col h-full w-full items-center justify-center min-h-96">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150"></div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Presidents...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we fetch the data
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>;
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="flex flex-col  h-full w-full items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-4 h-full w-full gap-4 overflow-auto">
      <div className="grid grid-cols-4 gap-4">
        {/* Current President (2 columns) */}
        <div className="col-span-4">
          <h1 className="text-center font-bold text-xl mb-2 ">
            CURRENT PRESIDENT
          </h1>
          {currentPresident ? (
            <CurrentPresidentCard
              currentPresident={currentPresident}
              selectedOrg={selectedOrg}
            />
          ) : (
            <div className="bg-white gap-4 flex flex-col justify-center items-center p-6 relative cursor-pointer group border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300">
              <AlertTriangle
                size={48}
                className="text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300"
              />
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
                No Current President
              </h3>
            </div>
          )}
        </div>
        {!remainingPresidents && (
          <div className="col-span-4 flex flex-col gap-4">
            <h1 className="text-center font-bold text-xl">FORMER PRESIDENT</h1>
            <div className="w-full grid grid-cols-4 gap-4">
              {remainingPresidents.map((president) => (
                <PresidentCard
                  president={president}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions={false} // never show "current" actions
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CurrentPresidentCard = ({ currentPresident, selectedOrg }) => {
  // Handle empty or missing data gracefully
  const president = currentPresident || {};
  const {
    name,
    course,
    year,
    department,
    age,
    sex,
    religion,
    nationality,
    profilePicture,
    presentAddress,
    contactNo,
    facebookAccount,
    overAllStatus,
    parentGuardian,
    sourceOfFinancialSupport,
    talentSkills,
    classSchedule,
  } = president;

  const [confirmUpdateModal, setConfirmUpdateModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // to store action type
  const [confirmMessage, setConfirmMessage] = useState("");

  console.log(president);
  const profilePictureUrl = `${DOCU_API_ROUTER}/${president.organizationProfile}/${profilePicture}`;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "", message: "" });

  const submitUpdate = async ({ status }) => {
    try {
      const payload = { overallStatus: status };

      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      const response = await axios.post(
        `${API_ROUTER}/updateStatusPresident/${currentPresident._id}`,
        payload
      );

      console.log("✅ Update success:", response.data);

      setShowRevisionModal(false);
      setShowApproveModal(false);

      // ✅ Show success popup
      setPopup({
        open: true,
        type: "success",
        message: `Proposal successfully ${status}`,
      });
    } catch (error) {
      console.log("❌ Update failed:", error);

      setPopup({
        open: true,
        type: "error",
        message: "Failed to update President Profile. Please try again.",
      });
    }
  };

  // Add this inside CurrentPresidentCard component
  const handleDropdownAction = (id) => {
    const deanStatuses = ["Revision from the Dean", "Approved by the Dean"];
    const adviserStatuses = [
      "Approved by the Adviser",
      "Revision from the Adviser",
    ];

    const currentStatus = currentPresident?.overAllStatus?.toLowerCase().trim();

    const isDeanUpdated = deanStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    const isAdviserValid = adviserStatuses.some(
      (status) => status.toLowerCase().trim() === currentStatus
    );

    // Show confirmation modal if:
    if (isDeanUpdated || !isAdviserValid) {
      setPendingAction(id);

      if (isDeanUpdated) {
        setConfirmMessage(
          "This President Profile has already been updated by the Dean. Do you want to continue updating it again?"
        );
      } else if (!isAdviserValid) {
        setConfirmMessage(
          "This President Profile has not yet been reviewed by the Adviser. Do you want to proceed anyway?"
        );
      }

      setConfirmUpdateModal(true);
      setShowDropdown(false);
      return;
    }

    // Otherwise, open modal normally
    if (id === "revision") setShowRevisionModal(true);
    else if (id === "Approval") setShowApproveModal(true);

    setShowDropdown(false);
  };
  console.log(selectedOrg);
  return (
    <div className="bg-white shadow-xl relative">
      {/* Header Section */}
      <div className="">
        <div className="relative p-6 bg-white ">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white flex items-center justify-center bg-gray-100">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="President"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-20 h-20 text-gray-500 flex items-center justify-center">
                  <span>No Img</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{name}</h1>
              <p className="text-lg mb-1">{course}</p>
              <p className="text-lg mb-1">
                {year} • {department}
              </p>
              <p>Status: {overAllStatus}</p>
            </div>
          </div>

          {/* More Options Dropdown */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleDropdownAction("revision")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  View Revision
                </button>
                <button
                  onClick={() => handleDropdownAction("Approval")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Approve
                </button>
              </div>
            )}
          </div>

          {/* Revision Modal */}
          {showRevisionModal && (
            <div className="fixed inset-0 flex items-center backdrop-blur-sm justify-center bg-black/25 z-20">
              <div className="bg-white p-6 relative rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-2">Send for Revision</h2>
                <h3 className="text-lg  mb-4">
                  Revision Notice for: {selectedOrg.orgName}
                </h3>
                <X
                  size={32}
                  className="absolute top-4 right-4 text-red-500"
                  onClick={() => setShowRevisionModal(false)}
                />
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Enter revision notes..."
                  className="w-full p-2 border rounded-lg mb-2 h-32"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      submitUpdate({ status: "Revision from the Dean" })
                    }
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Send Revision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Approve Modal */}
          {showApproveModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-2">Approve Proposal</h2>
                <p className="text-lg  text-gray-600 mb-4">
                  Are you sure you want to approve this President Profile?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      submitUpdate({ status: "Approved by the Dean" })
                    }
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}

          {popup.open && (
            <DonePopUp
              type={popup.type}
              message={popup.message}
              onClose={() => setPopup({ open: false, type: "", message: "" })}
            />
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Personal Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Age:</span>
              <span className="font-medium">{age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sex:</span>
              <span className="font-medium">{sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Religion:</span>
              <span className="font-medium">{religion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nationality:</span>
              <span className="font-medium">{nationality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact:</span>
              <span className="font-medium">{contactNo}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Additional Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Parent/Guardian:</span>
              <span className="font-medium">{parentGuardian}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Financial Support:</span>
              <span className="font-medium">{sourceOfFinancialSupport}</span>
            </div>
            {facebookAccount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Facebook:</span>
                <a
                  href={facebookAccount}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium truncate max-w-32"
                >
                  View Profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      {presentAddress?.fullAddress && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Address
          </h3>
          <p className="text-sm text-gray-700">{presentAddress.fullAddress}</p>
        </div>
      )}

      {/* Skills Section */}
      {talentSkills.length > 0 && (
        <div className="px-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Skills & Talents
          </h3>
          <div className="flex flex-wrap gap-2">
            {talentSkills.map((talent, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {talent.skill} ({talent.level})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Class Schedule */}
      {classSchedule.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
            Class Schedule
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-2 border text-left">Subject</th>
                  <th className="p-2 border text-left">Place</th>
                  <th className="p-2 border text-left">Day</th>
                  <th className="p-2 border text-left">Class Start</th>
                  <th className="p-2 border text-left">Class End</th>
                </tr>
              </thead>
              <tbody>
                {classSchedule.map((schedule, index) => (
                  <tr
                    key={schedule._id || index}
                    className="even:bg-white odd:bg-gray-50"
                  >
                    <td className="p-2 border">{schedule.subject || "N/A"}</td>
                    <td className="p-2 border">{schedule.place || "N/A"}</td>
                    <td className="p-2 border">{schedule.day || "N/A"}</td>
                    <td className="p-2 border">
                      {schedule.time?.start || "N/A"}
                    </td>
                    <td className="p-2 border">
                      {schedule.time?.end || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {confirmUpdateModal && (
        <div className="fixed bg-black/10 backdrop-blur-xs inset-0  flex justify-center items-center">
          <div className="h-fit bg-white w-1/5 flex flex-col px-6 py-6 rounded-2xl shadow-xl relative">
            <button
              onClick={() => setConfirmUpdateModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h1 className="text-xl font-semibold mb-4">Confirmation</h1>
            <p className=" text-gray-700 mb-4">{confirmMessage}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmUpdateModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingAction === "revision") setShowRevisionModal(true);
                  else if (pendingAction === "Approval")
                    setShowApproveModal(true);

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
};

const PresidentCard = ({
  president,
  onEdit,
  onDelete,
  showActions = false, // Default to false
}) => {
  if (!president) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="text-gray-500">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <p>No president assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full w-full duration-200 p-4 relative">
      {/* Action buttons - only show for current president */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={() => onEdit(president)}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(president)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with profile picture */}
      <div className="flex items-center justify-center mb-4 relative">
        {president.profilePicture ? (
          <img
            src={`${DOCU_API_ROUTER}/${president.organizationProfile}/${president.profilePicture}`}
            alt={`${president.name}'s profile`}
            className="w-42 h-auto aspect-square rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback avatar with initials */}
        <div
          className={`min-w-32 h-auto aspect-square bg-indigo-100 rounded-full flex items-center justify-center border-2 border-gray-200 ${
            president.profilePicture ? "hidden" : "flex"
          }`}
        >
          <span className="text-2xl font-bold text-indigo-600">
            {president.name ? president.name.charAt(0).toUpperCase() : "P"}
          </span>
        </div>
      </div>

      {/* Main Info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          {president.name}
        </h3>
        <p
          className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
            president.isCurrent
              ? "text-indigo-600 bg-indigo-50"
              : "text-gray-600 bg-gray-50"
          }`}
        >
          {president.isCurrent ? "Current President" : "Former President"}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{president.courseYear}</p>
          <p>Age: {president.age}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        <div className="text-sm">
          <p className="text-gray-500">Contact:</p>
          <p className="text-gray-700">{president.contactNo}</p>
        </div>

        {president.facebookAccount && (
          <div className="text-sm">
            <p className="text-gray-500">Facebook:</p>
            <a
              href={president.facebookAccount}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs break-all"
            >
              {president.facebookAccount.replace(
                "https://www.facebook.com/",
                "@"
              )}
            </a>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <span className="font-medium">Address:</span>{" "}
            <span>{president.permanentAddress?.fullAddress}</span>
          </p>
          <p>
            <span className="font-medium">Financial Support:</span>{" "}
            {president.sourceOfFinancialSupport}
          </p>
          {president.talentSkills && president.talentSkills.length > 0 && (
            <p>
              <span className="font-medium">Skills:</span>{" "}
              {president.talentSkills.map((skill) => skill.skill).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
