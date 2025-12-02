import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Clock3,
  StickyNote,
  UserSquare,
  User,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export function SduMainIndividualRosterView({ selectedOrg }) {
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium";

    switch (status?.toLowerCase()) {
      case "active":
        return `${baseClasses} bg-green-50 text-green-700 border border-green-200`;
      case "inactive":
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
      case "pending":
        return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };
  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
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
    <div className="p-6" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="p-6 bg-white shadow-xl rounded-2xl">
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

        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading roster members...
                </p>
              </div>
            </div>
          ) : rosterMembers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No members found
              </h3>
              <p className="text-gray-500">
                No members found for this organization.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Contact
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Position
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rosterMembers.map((member, index) => (
                      <tr
                        key={member._id}
                        className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 cursor-pointer group ${
                          hoveredMember?._id === member._id ? "shadow-md" : ""
                        }`}
                        onMouseEnter={() => handleRowHover(member)}
                        onMouseLeave={handleRowLeave}
                        onMouseMove={handleMouseMove} // 👈 add this
                      >
                        {/* Member Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="relative">
                                <img
                                  className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-indigo-300 transition-colors"
                                  src={
                                    member.profilePicture
                                      ? `${DOCU_API_ROUTER}/${selectedOrg._id}/${member.profilePicture}`
                                      : "/cnsc-logo.png"
                                  }
                                  alt={`${member.name}'s profile`}
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-white rounded-full flex items-center justify-center">
                                  {getStatusIcon(member.status)}
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                {member.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Member #{index + 1}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.email}
                          </div>
                        </td>

                        {/* Position */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.position}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(member.status)}>
                            {getStatusIcon(member.status)}
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                <p className="text-sm text-gray-600">
                  {hoveredMember.position}
                </p>
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
