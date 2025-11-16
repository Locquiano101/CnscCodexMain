import { useEffect, useState } from "react";
import AddRosterForm from "./add-roster-member";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { X, Search } from "lucide-react";

export default function StudentLeaderRosters({ orgData }) {
  const [activeModal, setActiveModal] = useState(null); // 'add', 'edit', 'import', etc.
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(""); // 🔍 search state

  const fetchRosterMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getRosterMembers/${orgData._id}`
      );
      console.log(response.data);
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

  const handleMemberAdded = () => {
    setActiveModal(null);
    fetchRosterMembers(); // Refresh the roster data
  };

  const handleAction = (action) => {
    setActiveModal(action);
  };

  const handleExportExcel = async () => {
    const rosterMembers = rosterData?.rosterMembers || [];
    if (!rosterMembers || rosterMembers.length === 0) {
      alert("No roster data to export.");
      return;
    }

    try {
      // Create workbook & worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Roster Members");

      // Define headers
      worksheet.columns = [
        { header: "Name", key: "name", width: 25 },
        { header: "Position", key: "position", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Contact Number", key: "contactNumber", width: 20 },
        { header: "Address", key: "address", width: 40 },
        { header: "Birth Date", key: "birthDate", width: 15 },
        { header: "Status", key: "status", width: 15 },
      ];

      // Add data rows
      rosterMembers.forEach((member) => {
        worksheet.addRow({
          name: member.name,
          position: member.position,
          email: member.email,
          contactNumber: member.contactNumber,
          address: member.address,
          birthDate: member.birthDate
            ? new Date(member.birthDate).toLocaleDateString()
            : "Not provided",
          status: member.status,
        });
      });

      // Style header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFDCE6F1" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Generate buffer and save file
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "RosterMembers.xlsx");
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export. Please try again.");
    } finally {
      setActiveModal(null);
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

  const rosterMembers = rosterData?.rosterMembers || [];

  // 🔍 Filter members based on search query
  const filteredMembers = rosterMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.position?.toLowerCase().includes(query) ||
      member.contactNumber?.toLowerCase().includes(query) ||
      member.address?.toLowerCase().includes(query)
    );
  });

  const actions = [
    { id: "add", label: "Add Roster Member", onClick: () => handleAction("add"), tone: "primary" },
    { id: "Completion", label: "Submit For Completion", onClick: () => handleAction("Completion"), tone: "secondary" },
    { id: "export", label: "Export Spreadsheet", onClick: () => handleAction("export"), tone: "ghost" },
  ];

  return (
    <div className="p-4 flex flex-col bg-gray-cnsc- min-h-screen">
      {/* Outer Container for Roster Management */}
      <div className="rounded-xl shadow-md p-6 bg-gray-100 border-gray-400">
        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Roster Management
            </h1>
            <h1 className="text-sm font-bold text-gray-900">
              Status:{" "}
              {rosterData.roster.isComplete ? "Complete" : "Not Complete"}
            </h1>
          </div>

          {/* Action Buttons (Replaces three-dots menu) */}
          <div className="flex flex-wrap gap-2 items-center justify-end">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={a.onClick}
                className={
                  a.tone === "primary"
                    ? "px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    : a.tone === "secondary"
                    ? "px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                    : "px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🔍 Search Bar */}
        {rosterMembers.length > 0 && (
          <div className="mt-4 flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
            <Search className="text-gray-500 mr-2" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none text-gray-700"
            />
          </div>
        )}
      </div>

      {!rosterData || rosterMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No roster has been started yet.</p>
          <p className="text-gray-400 mb-4">
            Click the Actions button above to begin creating your student leader
            roster.
          </p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setActiveModal("add")}
          >
            Start Roster
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 overflow-auto">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <RosterMemberCard
                key={member._id}
                member={member}
                orgId={orgData._id}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No members match your search.
            </p>
          )}
        </div>
      )}

      {/* Modal Rendering */}
      {activeModal === "add" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <AddRosterForm
            orgData={orgData}
            onClose={() => setActiveModal(null)}
            onMemberAdded={handleMemberAdded}
          />
        </div>
      )}

      {activeModal === "Completion" && (
        <SubmitForCompletion
          rosterId={rosterData.roster._id}
          onFinish={() => setActiveModal(null)}
          onClose={() => setActiveModal(null)}
        /> // closes when user cancels
      )}

      {activeModal === "export" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="h-fit relative w-full max-w-md px-6 py-6 bg-white flex flex-col justify-center rounded-xl shadow-xl">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h1 className="text-lg font-semibold mb-2">Export Roster</h1>
            <p className="text-sm text-gray-600 mb-6">
              Do you want to export the roster members into an Excel file?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SubmitForCompletion = ({ rosterId, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Send form data to backend
      const response = await axios.post(
        `${API_ROUTER}/CompleteStudentRoster/${rosterId}`
      );
      console.log("Success:", response);

      // Wait 1 second before refreshing/closing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
    } catch (error) {
      console.error("Error during submit:", error);
      alert("Error processing submission. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="h-fit relative w-fit px-12 py-6 max-w-xl bg-white flex flex-col justify-center items-center rounded-xl ">
        <h1 className="text-lg font-semibold mb-6">Submit for completion?</h1>
        <X className="absolute top-4 right-4" />
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const RosterMemberCard = ({ member, orgId }) => {
  console.log(`${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`);
  return (
    <div className="bg-white rounded-lg flex flex-col gap-2 items-center shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <img
          src={
            member.profilePicture
              ? `${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`
              : "/cnsc-logo.png"
          }
          alt="Profile Picture"
          className="max-h-32 aspect-square border object-cover rounded"
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
