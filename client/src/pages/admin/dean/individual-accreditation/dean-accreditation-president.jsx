import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";

export function DeanPresident({ selectedOrg }) {
  console.log("president", selectedOrg);

  const [presidents, setPresidents] = useState([]);
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
        const response = await axios.get(`${API_ROUTER}/getPresidents/${orgId}`);
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
        setPresidents(data);
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Presidents...</h3>
            <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
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
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="flex flex-col mt-4 h-full w-full gap-4 overflow-auto">
      <div className="grid grid-cols-4 gap-4">
        {/* Current President */}
        <div className="col-span-4">
          <h1 className="text-center font-bold text-xl mb-2">CURRENT PRESIDENT</h1>
          {currentPresident ? (
            <CurrentPresidentCard currentPresident={currentPresident} />
          ) : (
            <div className="bg-white gap-4 flex flex-col justify-center items-center p-6 border-2 border-dashed border-gray-300">
              <AlertTriangle size={48} className="text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-800">No Current President</h3>
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

// --- Current President Card ---
const CurrentPresidentCard = ({ currentPresident }) => {
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

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-indigo-100 flex items-center justify-center bg-gray-100">
          {profilePictureUrl ? (
            <img src={profilePictureUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">No Img</span>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold mb-2">{name}</h1>
          <p className="text-lg">{course}</p>
          <p className="text-lg">{year} • {department}</p>
          <p className="text-gray-600 mt-2">Status: {overAllStatus}</p>
        </div>
      </div>

      <InfoSection
        personal={{ age, sex, religion, nationality, contactNo }}
        additional={{ parentGuardian, sourceOfFinancialSupport, facebookAccount }}
        address={presentAddress?.fullAddress}
        talentSkills={talentSkills}
        classSchedule={classSchedule}
      />
    </div>
  );
};

// --- Info Section ---
const InfoSection = ({ personal, additional, address, talentSkills, classSchedule }) => (
  <div className="p-6 grid md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
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
      <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
      <div className="space-y-2 text-sm">
        {Object.entries(additional).map(([key, value]) =>
          value ? (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{key.replace(/([A-Z])/g, " $1")}:</span>
              {key === "facebookAccount" ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">Skills & Talents</h3>
        <div className="flex flex-wrap gap-2">
          {talentSkills.map((t, i) => (
            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {t.skill} ({t.level})
            </span>
          ))}
        </div>
      </div>
    )}

    {classSchedule.length > 0 && (
      <div className="col-span-2">
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">Class Schedule</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-2 border text-left">Subject</th>
                <th className="p-2 border text-left">Place</th>
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

// --- Former President Card ---
const PresidentCard = ({ president }) => {
  const profilePictureUrl =
    president.profilePicture && president.organizationProfile
      ? `${DOCU_API_ROUTER}/${president.organizationProfile}/${president.profilePicture}`
      : null;

  return (
    <div className="bg-white border p-4 rounded-xl shadow-md flex flex-col items-center gap-2">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
        {profilePictureUrl ? (
          <img src={profilePictureUrl} alt={president.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 flex items-center justify-center h-full">No Img</span>
        )}
      </div>
      <h3 className="font-bold text-center">{president.name}</h3>
      <p className="text-sm text-gray-500">{president.course}</p>
    </div>
  );
};
