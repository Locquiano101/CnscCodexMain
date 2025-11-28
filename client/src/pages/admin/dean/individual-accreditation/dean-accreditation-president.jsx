import { Edit, Trash2, X, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";

export function DeanPresident({ selectedOrg }) {
  const [currentPresident, setCurrentPresident] = useState(null);
  const [remainingPresidents, setRemainingPresidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ FIX: organization might be an object OR a string
    const orgId = selectedOrg?.organization?._id || selectedOrg?.organization;
    if (!selectedOrg || !orgId) {
      setLoading(false);
      return;
    }

    console.log("✅ Using Org ID:", orgId);

    const fetchPresidents = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_ROUTER}/getPresidents/${orgId}`
        );
        const data = response.data || [];

        // Determine current president
        let current = null;
        if (selectedOrg?.orgPresident?._id) {
          current = data.find((p) => p._id === selectedOrg.orgPresident._id);
        }
        if (!current && selectedOrg?.orgPresident) {
          current = { ...selectedOrg.orgPresident }; // fallback
        }
        if (current) current.isCurrent = true;

        const remaining = data
          .filter((p) => (current ? p._id !== current._id : true))
          .map((p) => ({ ...p, isCurrent: false }));

        setCurrentPresident(current);
        setRemainingPresidents(remaining);
      } catch (err) {
        console.error("Error fetching presidents:", err);
        setError("Failed to load presidents. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPresidents();
  }, [selectedOrg]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Loading Presidents...
            </h3>
            <p className="text-sm text-gray-500">
              Please wait while we fetch the data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center min-h-96">
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
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="grid grid-cols-4 gap-6">
        {/* Current President */}
        <div className="col-span-4">
          <h1 className="text-center font-bold text-xl mb-2">
            CURRENT PRESIDENT
          </h1>
          {currentPresident ? (
            <CurrentPresidentCard currentPresident={currentPresident} />
          ) : (
            <div className="bg-white gap-4 flex flex-col justify-center items-center p-6 border-2 border-dashed border-gray-300">
              <AlertTriangle size={48} className="text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-800">
                No Current President
              </h3>
            </div>
          )}
        </div>

        {/* Former Presidents */}
        {remainingPresidents.length > 0 && (
          <div className="col-span-4 flex flex-col gap-4">
            <h1 className="text-center font-bold text-xl">FORMER PRESIDENTS</h1>
            <div className="w-full grid grid-cols-4 gap-4">
              {remainingPresidents.map((president) => (
                <PresidentCard key={president._id} president={president} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Component ---
function CurrentPresidentCard({ currentPresident }) {
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
    talentSkills = [],
    classSchedule = [],
    organizationProfile,
  } = currentPresident;

  const profilePictureUrl =
    profilePicture && organizationProfile
      ? `${DOCU_API_ROUTER}/${organizationProfile}/${profilePicture}`
      : null;

  const [showPopup, setShowPopup] = useState({
    show: false,
    type: "",
    member: null,
  });

  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const dropdownRef = useRef(null);

  const handleButtonClick = (type) => {
    setShowPopup({ show: true, type, member: currentPresident });
    setManagePresidentProfileOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setManagePresidentProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative  bg-white shadow-md rounded-lg p-6">
      {/* Popup Overlay */}
      {showPopup.show && (
        <div className="fixed top-0 left-0 z-20 w-full h-full flex bg-black/30 items-center justify-center">
          <div className="relative h-fit w-[400px] px-6 py-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Manage President Profile
            </h3>
            <X
              size={20}
              onClick={() =>
                setShowPopup({ show: false, type: "", member: null })
              }
              className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            />
            {showPopup.type === "approve" && (
              <ApprovePresidentProfile
                presidentData={currentPresident}
                setShowPopup={setShowPopup}
              />
            )}
            {showPopup.type === "notes" && (
              <RevisePresidentProfile
                presidentData={currentPresident}
                setShowPopup={setShowPopup}
              />
            )}
          </div>
        </div>
      )}

      {/* Manage Dropdown */}
      <div
        className="absolute right-4 top-4 inline-block text-left mb-4"
        ref={dropdownRef}
      >
        <button
          onClick={() => setManagePresidentProfileOpen((prev) => !prev)}
          className={`px-4 py-2 bg-cnsc-primary-color w-48 text-white transition-colors hover:bg-cnsc-primary-color-dark ${
            isManagePresidentProfileOpen ? "rounded-t-lg" : "rounded-lg"
          }`}
        >
          Manage President Profile
        </button>

        {isManagePresidentProfileOpen && (
          <div className="absolute right-0 w-48 bg-white border rounded-b-lg shadow-lg z-10">
            <button
              onClick={() => handleButtonClick("approve")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleButtonClick("notes")}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Revision Notes
            </button>
          </div>
        )}
      </div>

      {/* President Profile */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-indigo-100 flex items-center justify-center bg-gray-100">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">No Img</span>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <p className="text-lg">{course}</p>
          <p className="text-lg">
            {year} • {department}
          </p>
          <p className="text-gray-600 mt-2">Status: {overAllStatus}</p>
        </div>
      </div>

      {/* Info Section */}
      <InfoSection
        personal={{ age, sex, religion, nationality, contactNo }}
        additional={{
          parentGuardian,
          sourceOfFinancialSupport,
          facebookAccount,
        }}
        address={presentAddress?.fullAddress}
        talentSkills={talentSkills}
        classSchedule={classSchedule}
      />
    </div>
  );
}
// --- Info Section ---
const InfoSection = ({
  personal,
  additional,
  address,
  talentSkills,
  classSchedule,
}) => (
  <div className="p-6 grid md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">
        Personal Information
      </h3>
      <div className="space-y-2 text-sm">
        {Object.entries(personal).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-600 capitalize">{key}:</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">
        Additional Information
      </h3>
      <div className="space-y-2 text-sm">
        {Object.entries(additional).map(([key, value]) =>
          value ? (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">
                {key.replace(/([A-Z])/g, " $1")}:
              </span>
              {key === "facebookAccount" ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Profile
                </a>
              ) : (
                <span className="font-medium">{value}</span>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>

    {address && (
      <div className="col-span-2">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">Address</h3>
        <p className="text-sm text-gray-700">{address}</p>
      </div>
    )}

    {talentSkills.length > 0 && (
      <div className="col-span-2">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Skills & Talents
        </h3>
        <div className="flex flex-wrap gap-2">
          {talentSkills.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {t.skill} ({t.level})
            </span>
          ))}
        </div>
      </div>
    )}

    {classSchedule.length > 0 && (
      <div className="col-span-2">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">
          Class Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-2 border text-left">Subject</th>
                <th className="p-2 border text-left">Place/Room</th>
                <th className="p-2 border text-left">Day</th>
                <th className="p-2 border text-left">Start</th>
                <th className="p-2 border text-left">End</th>
              </tr>
            </thead>
            <tbody>
              {classSchedule.map((s, idx) => (
                <tr key={idx} className="even:bg-white odd:bg-gray-50">
                  <td className="p-2 border">{s.subject || "N/A"}</td>
                  <td className="p-2 border">{s.place || "N/A"}</td>
                  <td className="p-2 border">{s.day || "N/A"}</td>
                  <td className="p-2 border">{s.time?.start || "N/A"}</td>
                  <td className="p-2 border">{s.time?.end || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const PresidentCard = ({
  president,
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
    <div className="bg-white h-full w-full border-12 duration-200 p-4 relative">
      {/* Action buttons - only show for current president */}
      {showActions && (
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
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

export function ApprovePresidentProfile({ presidentData, setShowPopup }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const HandleSubmitApprovalOfPresidentProfile = async () => {
    console.log(
      "Submitting approval for president profile:",
      presidentData._id
    );
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API_ROUTER}/updateStatusPresident/${presidentData._id}`,
        {
          overallStatus: "Approved by the Dean", // ✅ Fixed: Send the correct field name
        }
      );
      console.log("Approval response:", res.data);

      setConfirmationMessage("✅ Approved successfully!");
      setShowConfirmation(true);

      // auto-close popup after 1s
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPopup({ show: false, type: "", member: null });
      }, 1000);
    } catch (error) {
      console.error("Failed to approve president profile", error);

      setConfirmationMessage("❌ Failed to approve president profile.");
      setShowConfirmation(true);

      // auto-close popup after 1s
      setTimeout(() => {
        setShowConfirmation(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const CancelSubmissionOfPresidentProfile = () => {
    console.log("Cancelling submission for president profile");
    setShowPopup({ show: false, type: "", member: null });
  };

  return (
    <div className="flex flex-col gap-2 w-full justify-start">
      <h1 className="text-lg font-semibold text-gray-800">
        Approve President Profile of {presidentData?.name}?
      </h1>

      <button
        onClick={HandleSubmitApprovalOfPresidentProfile}
        className="border px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Approving..." : "Approve"}
      </button>

      <button
        onClick={CancelSubmissionOfPresidentProfile}
        className="border px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        disabled={isLoading}
      >
        Cancel
      </button>

      {/* Confirmation popup */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white flex items-center justify-center min-w-[300px] px-6 py-4 rounded shadow-lg">
            <p className="text-center text-lg">{confirmationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function RevisePresidentProfile({ presidentData, setShowPopup }) {
  const [isLoading, setIsLoading] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const HandleSubmitRevisionOfPresidentProfile = async () => {
    console.log(
      "Submitting revision for president profile:",
      presidentData._id,
      "Notes:",
      revisionNotes
    );
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${API_ROUTER}/updateStatusPresident/${presidentData._id}`,
        {
          overallStatus: "Revision From the Dean", // ✅ Fixed: Send correct field name
          revisionNotes: revisionNotes.trim(), // ✅ Fixed: Send revision notes correctly
        }
      );
      console.log("Revision response:", res.data);

      setConfirmationMessage("✅ Revision notes sent successfully!");
      setShowConfirmation(true);

      // auto-close popup after 1.5s
      setTimeout(() => {
        setShowConfirmation(false);
        setShowPopup({ show: false, type: "", member: null });
      }, 1500);
    } catch (error) {
      console.error("Failed to revise president profile", error);

      setConfirmationMessage("❌ Failed to submit revision notes.");
      setShowConfirmation(true);

      // auto-close popup after 1.5s
      setTimeout(() => {
        setShowConfirmation(false);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const CancelSubmissionOfPresidentProfile = () => {
    console.log("Cancelling revision for president profile");
    setShowPopup({ show: false, type: "", member: null });
  };

  return (
    <div className="flex flex-col gap-3 w-full justify-start">
      <h1 className="text-lg font-semibold text-gray-800">
        Send Revision Notes for {presidentData?.name}
      </h1>

      <textarea
        className="border rounded p-2 w-full min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your revision notes here..."
        value={revisionNotes}
        onChange={(e) => setRevisionNotes(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={HandleSubmitRevisionOfPresidentProfile}
          className="border px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
          disabled={isLoading || !revisionNotes.trim()}
        >
          {isLoading ? "Sending..." : "Send Revision Notes"}
        </button>
        <button
          onClick={CancelSubmissionOfPresidentProfile}
          className="border px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>

      {/* Confirmation popup */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white flex items-center justify-center min-w-[300px] px-6 py-4 rounded shadow-lg">
            <p className="text-center text-lg">{confirmationMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
