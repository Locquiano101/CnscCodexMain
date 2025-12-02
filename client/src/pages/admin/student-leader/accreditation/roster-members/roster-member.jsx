import { useEffect, useState } from "react";
import AddRosterForm from "./add-roster-member";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
      <div className="p-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F9' }}>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading roster members...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F9' }}>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
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
    <div className="h-full overflow-auto p-6 flex flex-col" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Outer Container for Roster Management */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex w-full justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Roster Management</CardTitle>
              <Badge variant={rosterData.roster.isComplete ? "default" : "secondary"} className="mt-2 text-white whitespace-nowrap">
                Status: {rosterData.roster.isComplete ? "Complete" : "Not Complete"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {actions.map((a) => (
                <Button
                  key={a.id}
                  onClick={a.onClick}
                  variant={a.tone === "primary" ? "default" : a.tone === "secondary" ? "default" : "outline"}
                  className={
                    a.tone === "primary"
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : a.tone === "secondary"
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : ""
                  }
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        {/* 🔍 Search Bar */}
        {rosterMembers.length > 0 && (
          <CardContent>
            <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-300">
              <Search className="text-gray-500 mr-2" size={20} />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {!rosterData || rosterMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">No roster has been started yet.</p>
          <p className="text-gray-400 mb-4">
            Click the Actions button above to begin creating your student leader
            roster.
          </p>
          <Button
            onClick={() => setActiveModal("add")}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Start Roster
          </Button>
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
        <Dialog open={activeModal === "add"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
            <AddRosterForm
              orgData={orgData}
              onClose={() => setActiveModal(null)}
              onMemberAdded={handleMemberAdded}
            />
          </DialogContent>
        </Dialog>
      )}

      {activeModal === "Completion" && (
        <SubmitForCompletion
          rosterId={rosterData.roster._id}
          onFinish={() => setActiveModal(null)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "export" && (
        <Dialog open={activeModal === "export"} onOpenChange={() => setActiveModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Roster</DialogTitle>
              <DialogDescription>
                Do you want to export the roster members into an Excel file?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Submit for completion?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RosterMemberCard = ({ member, orgId }) => {
  console.log(`${DOCU_API_ROUTER}/${orgId}/${member.profilePicture}`);
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex flex-col gap-2 items-center">
        <div className="flex items-center justify-center w-full">
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

        <div className="space-y-1 w-full">
          <h3 className="text-lg font-semibold text-gray-900 break-words">
            Name: {member.name}
          </h3>
          {/* Position displayed as plain text instead of badge */}
          <p className="text-sm font-semibold text-indigo-600 break-words">
            {member.position}
          </p>

          <p className="text-sm text-gray-600 break-words">{member.email}</p>
          <p className="text-sm text-gray-600 break-words">{member.contactNumber}</p>
          <p className="text-sm text-gray-500 break-words">{member.address}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 w-full">
          <p className="text-xs text-gray-500 break-words">
            Birth Date:{" "}
            {member.birthDate
              ? new Date(member.birthDate).toLocaleDateString()
              : "Not provided"}
          </p>
          <p className="text-xs text-gray-500 break-words">Status: {member.status}</p>
        </div>
      </CardContent>
    </Card>
  );
};
