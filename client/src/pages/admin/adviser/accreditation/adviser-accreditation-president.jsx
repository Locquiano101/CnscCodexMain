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
  MoreHorizontal,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { CurrentPresidentCard } from "../../../../components/president-profile";

export function AdviserPresident({ user, orgData }) {
  const [currentPresident, setCurrentPresident] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [remainingPresidents, setRemainingPresidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const orgId = orgData.organization;
  const [emailData, setEmailData] = useState({
    to: orgData.orgName,
    orgName: orgData.orgName,
    inquirySubject: "President Profile Not Found",
    orgId: orgData._id,
    inquiryText: "",
    userPosition: user.position,
    userName: user.name,
  });

  console.log(user);
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

        if (orgData?.orgPresident?._id) {
          const orgPresidentId = orgData.orgPresident._id;

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
  }, [orgId, orgData?.orgPresident]);

  const handleEdit = (president) => {
    console.log("Edit clicked for:", president.name);
  };

  const handleAdd = () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    console.log("📨 Sending email:", emailData);

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_ROUTER}/accreditationEmailInquiry`,
        emailData
      );
      console.log(response.data);
      setShowEmailModal(false);
    } catch (err) {
      console.error("Failed to fetch roster members:", err);
      setError("Failed to load roster members");
    } finally {
      setLoading(false);
    }
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

        <div className="col-span-4  pt-4">
          {currentPresident ? (
            <CurrentPresidentCard
              currentPresident={currentPresident}
              orgData={orgData}
            />
          ) : (
            <div
              className="bg-white gap-4 flex flex-col justify-center items-center p-6 relative cursor-pointer group"
              onClick={handleAdd}
            >
              <div
                className="border h-full w-full flex flex-col justify-center items-center gap-4 border-dashed p-4
              "
              >
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-400 transition-all duration-300 group-hover:scale-105">
                  <AlertTriangle
                    size={48}
                    className="text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-yellow-800 group-hover:text-yellow-700 transition-colors duration-300">
                    NO CURRENT PRESIDENT FOUND
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                    Click to notify the organization
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-4 flex flex-col gap-4">
          <div className="w-full grid grid-cols-4 gap-4">
            {remainingPresidents.map((president) => (
              <div className="">
                <h1> PRESIDENT</h1>
                <PresidentCard
                  president={president}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions={false} // never show "current" actions
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmailModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Compose Email – President Notification
            </h3>

            <div className="flex flex-col gap-4">
              <label>
                <p>Organization name:</p>
                <input
                  type="email"
                  placeholder="To"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={emailData.to}
                  onChange={(e) =>
                    setEmailData({ ...emailData, to: e.target.value })
                  }
                />
              </label>
              <label>
                <p>Subject:</p>
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={emailData.inquirySubject}
                  onChange={(e) =>
                    setEmailData({
                      ...emailData,
                      inquirySubject: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <p>Message:</p>
                <textarea
                  placeholder="Message"
                  rows={5}
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={emailData.inquiryText}
                  onChange={(e) =>
                    setEmailData({ ...emailData, inquiryText: e.target.value })
                  }
                ></textarea>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSendEmail}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
