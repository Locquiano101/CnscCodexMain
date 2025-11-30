import axios from "axios";
import { API_ROUTER } from "../../../../App";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { DonePopUp } from "../../../../components/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AddProposal({ proposals = [], onClose, open = true }) {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPopup, setShowPopup] = useState(null);
  const [proposedDate, setProposedDate] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      // Create object URL for PDF preview
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  // Handle activity selection and set initial proposed date
  const handleActivitySelection = (activityId) => {
    const activity = proposals.find((a) => a._id === activityId);
    setSelectedActivity(activity || null);

    // Set the initial proposed date from the selected activity
    if (activity && activity.proposedDate) {
      setProposedDate(activity.proposedDate);
    } else {
      setProposedDate("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedActivity || !uploadedFile) return;

    const formData = new FormData();

    // required fields for ProposalConduct
    formData.append(
      "ProposedActionPlanSchema",
      selectedActivity.ProposedActionPlanSchema
    );
    formData.append("ProposedIndividualActionPlan", selectedActivity._id); // if needed
    formData.append(
      "organizationProfile",
      selectedActivity.organizationProfile
    ); // if needed
    formData.append("organization", selectedActivity.organization); // if needed

    formData.append("label", "Proposal");
    formData.append("file", uploadedFile);

    // Add the proposed date to FormData
    formData.append("proposedDate", proposedDate);

    try {
      const res = await axios.post(
        `${API_ROUTER}/postStudentLeaderProposalConduct`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Upload response:", res.data);

      setShowPopup("success");
    } catch (err) {
      console.error(err);
      setShowPopup("error");
    }
  };

  const handleRemoveFile = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setUploadedFile(null);
    setPdfUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">📄</span> Add New Proposal
          </DialogTitle>
          <DialogDescription>
            Select an approved activity and upload the proposal document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-4 flex-1 overflow-y-auto">
          {/* Select Activity */}
          <div className="space-y-2">
            <Label htmlFor="activity-select">Select Activity</Label>
            {proposals.length === 0 ? (
              <div className="border border-dashed border-amber-300 bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-700 font-medium mb-1">
                  No activities available
                </p>
                <p className="text-xs text-amber-600">
                  Please add activities to your Proposed Action Plan first before creating a proposal.
                </p>
              </div>
            ) : (
              <Select
                value={selectedActivity?._id || ""}
                onValueChange={handleActivitySelection}
              >
                <SelectTrigger id="activity-select">
                  <SelectValue placeholder="Choose an approved activity..." />
                </SelectTrigger>
                <SelectContent>
                  {proposals.map((activity) => (
                    <SelectItem key={activity._id} value={activity._id}>
                      {activity.activityTitle || activity.orgName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Proposed Date */}
          {selectedActivity && (
            <div className="space-y-2">
              <Label htmlFor="proposed-date">Proposed Date</Label>
              <Input
                id="proposed-date"
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                required
              />
            </div>
          )}

          {/* Activity & Upload Section */}
          {selectedActivity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left - Activity Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {selectedActivity?.activityTitle && (
                    <div>
                      <p className="font-medium text-muted-foreground">Title</p>
                      <p className="mt-1">{selectedActivity.activityTitle}</p>
                    </div>
                  )}

                  {selectedActivity?.briefDetails && (
                    <div>
                      <p className="font-medium text-muted-foreground">Brief Details</p>
                      <p className="mt-1">{selectedActivity.briefDetails}</p>
                    </div>
                  )}

                  {selectedActivity?.AlignedObjective && (
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Aligned Objectives
                      </p>
                      <p className="mt-1">
                        {selectedActivity.AlignedObjective}
                      </p>
                    </div>
                  )}

                  {proposedDate && (
                    <div>
                      <p className="font-medium text-muted-foreground">Proposed Date</p>
                      <p className="text-blue-700 mt-1">
                        {new Date(proposedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedActivity?.venue && (
                      <div>
                        <p className="font-medium text-muted-foreground">Venue</p>
                        <p className="mt-1">{selectedActivity.venue}</p>
                      </div>
                    )}

                    {selectedActivity?.date && (
                      <div>
                        <p className="font-medium text-muted-foreground">Date</p>
                        <p className="mt-1">{selectedActivity.date}</p>
                      </div>
                    )}
                  </div>

                  {selectedActivity?.budget && (
                    <div>
                      <p className="font-medium text-muted-foreground">Budget</p>
                      <p className="mt-1 font-semibold text-green-700">
                        ₱{selectedActivity.budget.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-muted-foreground">Status</p>
                    <Badge
                      className="mt-1"
                      variant={
                        selectedActivity?.overallStatus === "Approved"
                          ? "approved"
                          : selectedActivity?.overallStatus === "Pending"
                          ? "pending"
                          : selectedActivity?.overallStatus === "Approved For Conduct"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedActivity?.overallStatus}
                    </Badge>
                  </div>

                  {selectedActivity?.alignedSDG?.length > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground">Aligned SDG</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedActivity.alignedSDG.map((sdg, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            SDG {sdg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right - File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Document Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  {!uploadedFile ? (
                    <Label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition"
                    >
                      <Upload className="w-10 h-10 text-blue-500 mb-2" />
                      <p className="text-sm font-medium">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF files only (MAX. 10MB)
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,application/pdf"
                        onChange={handleFileUpload}
                      />
                    </Label>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📄</div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {uploadedFile.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="border rounded-lg overflow-hidden h-[300px]">
                        <iframe
                          src={pdfUrl}
                          className="w-full h-full"
                          title="PDF Preview"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 flex-shrink-0 border-t text-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedActivity || !uploadedFile || !proposedDate}
            className="text-white"
          >
            Submit Proposal
          </Button>
        </DialogFooter>
      </DialogContent>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          message={
            showPopup === "success"
              ? "Proposal uploaded successfully!"
              : showPopup === "error"
              ? "Something went wrong."
              : "Check your input again."
          }
          onClose={() => {
            setShowPopup(null);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}
