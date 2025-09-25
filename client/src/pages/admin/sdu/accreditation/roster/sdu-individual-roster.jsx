import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { formatDistanceToNow } from "date-fns";
import { Users, Clock3, StickyNote, UserSquare } from "lucide-react";

export function SduIndividualOrganizationRoster({ selectedOrg }) {
  const [isManageRosterOpen, setManageRosterOpen] = useState(false);
  const [rosterMembers, setRosterMembers] = useState([]);
  const [rosterInfo, setRosterInfo] = useState([]);
  const [RosterId, setRosterId] = useState();
  const [loading, setLoading] = useState(true);
  const [hoveredMember, setHoveredMember] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState({
    show: false,
    type: "",
    member: null,
  });
  const dropdownRef = useRef();

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleRowHover = (member) => {
    setHoveredMember(member);
  };

  const handleRowLeave = () => {
    setHoveredMember(null);
  };

  const handleButtonClick = (type, member = null) => {
    setShowPopup({ show: true, type, member });
    setManageRosterOpen(false);
  };

  useEffect(() => {
    if (!selectedOrg?._id) return;

    const fetchRoster = async () => {
      try {
        const res = await axios.get(
          `${API_ROUTER}/getRosterByOrg/${selectedOrg._id}`
        );
        console.log("Fetched Roster:", res.data);
        setRosterInfo(res.data.roster);
        setRosterId(res.data.roster._id);
        setRosterMembers(res.data.rosterMembers);
      } catch (error) {
        console.error("Failed to fetch roster members", error);
        setRosterMembers([]); // clear if error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedOrg]);

  return (
    <div className="p-6">
      <div className="flex  justify-between mb-4 items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Roster of Members - {selectedOrg.orgName}
          </h1>
          <p>Total Roster Members: {rosterMembers.length}</p>
          <p>Status: {rosterInfo.overAllStatus}</p>
        </div>
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setManageRosterOpen((prev) => !prev)}
            className={`px-4 py-2 bg-cnsc-primary-color w-48 text-white transition-colors hover:bg-cnsc-primary-color-dark ${
              isManageRosterOpen ? "rounded-t-lg" : "rounded-lg"
            }`}
          >
            Manage Roster
          </button>

          {isManageRosterOpen && (
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
                Add Notes
              </button>
              <button
                onClick={() => handleButtonClick("statistics")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                View Statistics
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {loading ? (
          <p className="text-gray-600">Loading roster members...</p>
        ) : rosterMembers.length === 0 ? (
          <p className="text-gray-500">
            No members found for this organization.
          </p>
        ) : (
          <table className="min-w-full bg-white border rounded-lg shadow-sm">
            <thead>
              <tr className="bg-indigo-100 text-left">
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Profile Picture
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Position
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {rosterMembers.map((member) => (
                <tr
                  key={member._id}
                  className="border-t hover:bg-indigo-50 cursor-pointer"
                  onMouseEnter={() => handleRowHover(member)}
                  onMouseLeave={handleRowLeave}
                  onMouseMove={handleMouseMove}
                >
                  <td className=" py-2 text-sm text-gray-800">
                    <div className="flex items-center justify-center">
                      <img
                        src={
                          member.profilePicture
                            ? `${DOCU_API_ROUTER}/${selectedOrg._id}/${member.profilePicture}`
                            : "/cnsc-logo.png"
                        }
                        alt="Profile Picture"
                        className="max-h-32 aspect-square border object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {member.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {member.email}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {member.position}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {member.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hover Card */}
      {hoveredMember && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - (2 / 3) * 100,
            maxWidth: "280px",
          }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <img
              src={
                hoveredMember.profilePicture
                  ? `${DOCU_API_ROUTER}/${selectedOrg._id}/${hoveredMember.profilePicture}`
                  : "/cnsc-logo.png"
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {hoveredMember.name}
              </h3>
              <p className="text-sm text-gray-600">{hoveredMember.position}</p>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <p>
              <strong>Email:</strong> {hoveredMember.email}
            </p>
            <p>
              <strong>Status:</strong> {hoveredMember.status}
            </p>
          </div>
        </div>
      )}

      {showPopup.show && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow w-full max-w-sm relative">
            <button
              onClick={() =>
                setShowPopup({ show: false, type: "", member: null })
              }
              className="absolute top-2 right-3 text-gray-500 text-xl"
            >
              ×
            </button>

            {showPopup.type === "approve" && (
              <ApprovedRosterLists
                rosterId={RosterId}
                setShowPopup={setShowPopup}
              />
            )}

            {showPopup.type === "notes" && (
              <RevisionNotesLists
                rosterId={RosterId}
                setShowPopup={setShowPopup}
              />
            )}

            {showPopup.type === "statistics" && (
              <ViewRostersStatistics
                rosterMembers={rosterMembers}
                roster={rosterInfo}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovedRosterLists({ rosterId, setShowPopup }) {
  const [loading, setLoading] = useState(false);

  console.log(rosterId);
  console.log("Roster ID:", `${API_ROUTER}/ApproveRosterList/${rosterId}`);
  const handleApprove = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_ROUTER}/ApproveRosterList/${rosterId}`,
        { overAllStatus: "Approved" }
      );
      console.log(res.data);
      setShowPopup({ show: false, type: "", member: null });
    } catch (error) {
      console.error("Error approving roster:", error);
      alert("Failed to approve roster.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Approve Roster</h2>
      <p>Are you sure you want to approve this roster?</p>
      <button
        onClick={handleApprove}
        disabled={loading}
        className={`mt-4 w-full py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Approving..." : "Approve"}
      </button>
    </>
  );
}

function RevisionNotesLists({ rosterId, setShowPopup }) {
  const [revisionNote, setRevisionNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!revisionNote.trim()) {
      alert("Please enter a revision note before submitting.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_ROUTER}/RevisionRosterList/${rosterId}`,
        {
          revisionNotes: revisionNote,
          position: "SDU",
        }
      );

      console.log("✅ Backend Response:", response.data);
      alert("Revision note submitted successfully!");

      // Optionally close popup
      setShowPopup({ show: false, type: "", member: null });
    } catch (error) {
      console.error("❌ Error submitting revision note:", error);
      alert("Failed to submit revision note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Send for Revision</h2>
      <p className="mb-2">Please enter your revision notes below:</p>
      <textarea
        value={revisionNote}
        onChange={(e) => setRevisionNote(e.target.value)}
        rows={4}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        placeholder="Enter revision note..."
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Revision Note"}
      </button>
    </>
  );
}

function ViewRostersStatistics({ roster, rosterMembers }) {
  const totalMembers = rosterMembers.length;
  const activeCount = rosterMembers.filter((m) => m.status === "Active").length;
  const inactiveCount = totalMembers - activeCount;

  const officers = rosterMembers.filter((m) =>
    m.position.toLowerCase().includes("officer")
  ).length;
  const members = totalMembers - officers;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Users className="text-indigo-600 w-5 h-5" />
        Roster Statistics
      </h2>

      <ul className="mb-4 space-y-1 text-sm">
        <li>
          <strong>Total Members:</strong> {totalMembers}
        </li>
        <li>
          <strong>Active:</strong> {activeCount}
        </li>
        <li>
          <strong>Inactive:</strong> {inactiveCount}
        </li>
        <li>
          <strong>Officers:</strong> {officers}
        </li>
        <li>
          <strong>Members:</strong> {members}
        </li>
      </ul>

      <div className="mb-4 p-3 border rounded bg-yellow-50">
        <p className="text-sm text-gray-700 flex gap-2 items-start">
          <StickyNote className="w-5 h-5 mt-0.5 text-yellow-700" />
          <span>
            <strong>Revision Notes:</strong>{" "}
            {roster.revisionNotes || "No notes available."}
          </span>
        </p>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p className="flex gap-1 items-center">
          <UserSquare className="w-4 h-4" />
          <strong>Status:</strong> {roster.overAllStatus}
        </p>
        <p className="flex gap-1 items-center">
          <Clock3 className="w-4 h-4" />
          <strong>Created:</strong>{" "}
          {formatDistanceToNow(new Date(roster.createdAt), {
            addSuffix: true,
          })}
        </p>
        <p className="flex gap-1 items-center">
          <Clock3 className="w-4 h-4" />
          <strong>Last Updated:</strong>{" "}
          {formatDistanceToNow(new Date(roster.updatedAt), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
}
