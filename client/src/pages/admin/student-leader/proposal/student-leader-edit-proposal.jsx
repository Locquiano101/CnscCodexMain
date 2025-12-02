import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { useMemo, useState, useEffect } from "react";
import { Upload, FileText, X } from "lucide-react";
import CurrencyInput from "../../../../components/currency-input";
import { Banknote } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function EditProposal({ proposal, onClose, onUpdated, open = true }) {
  console.log(proposal);
  // Pre-fill values with consistent field names
  const [formData, setFormData] = useState({
    activityTitle: proposal.ProposedIndividualActionPlan.activityTitle || "",
    briefDetails: proposal.ProposedIndividualActionPlan.briefDetails || "",
    alignedObjective:
      proposal.ProposedIndividualActionPlan.AlignedObjective || "",
    date: proposal.ProposedIndividualActionPlan.proposedDate
      ? new Date(proposal.ProposedIndividualActionPlan.proposedDate)
          .toISOString()
          .split("T")[0]
      : "",
    budget: proposal.ProposedIndividualActionPlan.budgetaryRequirements || "",
    venue: proposal.ProposedIndividualActionPlan.venue || "",
  otherVenue: "",
  isCustomVenue: false,
    alignedSDG: proposal.ProposedIndividualActionPlan.alignedSDG || [],
    organizationProfile: proposal.organizationProfile || "",
    organization: proposal.organization || "",
    overallStatus: proposal.overallStatus || "Pending",
  });

  console.log(formData);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  // Fetch active rooms for venue select
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        setRoomsError(null);
        const res = await axios.get(`${API_ROUTER}/rooms`, {
          withCredentials: true,
        });
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setRooms(list);
      } catch (err) {
        setRoomsError(err?.response?.data?.message || err.message);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, [API_ROUTER]);

  const roomOptions = useMemo(() => {
    return rooms.map((r) => ({ id: r._id, label: r.name, campus: r.campus }));
  }, [rooms]);

  // If current venue isn't in rooms list, default to Other and prefill otherVenue
  useEffect(() => {
    if (!rooms || rooms.length === 0) return;
    const exists = roomOptions.some((opt) => opt.label === formData.venue);
    if (formData.venue && !exists && !formData.isCustomVenue) {
      setFormData((prev) => ({ ...prev, isCustomVenue: true, otherVenue: prev.venue, venue: "" }));
    }
  }, [rooms, roomOptions]);

  // Existing PDF URL if available
  const [existingPdfUrl] = useState(
    proposal.document?.[0]?.fileName
      ? `${DOCU_API_ROUTER}/${proposal.organizationProfile}/${proposal.document[0].fileName}`
      : null
  );

  // Handle SDG checkbox changes
  const handleSDGChange = (sdgValue) => {
    setFormData((prev) => ({
      ...prev,
      alignedSDG: prev.alignedSDG.includes(sdgValue)
        ? prev.alignedSDG.filter((sdg) => sdg !== sdgValue)
        : [...prev.alignedSDG, sdgValue],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setPdfUrl(URL.createObjectURL(file)); // 👈 generate preview URL
      if (errors.file) {
        setErrors((prev) => ({
          ...prev,
          file: "",
        }));
      }
    } else if (file) {
      setErrors((prev) => ({
        ...prev,
        file: "Please upload a PDF file only",
      }));
    }
  };

  useEffect(() => {
    if (proposal.document?.[0]?.fileUrl) {
      setPdfUrl(proposal.document[0].fileUrl);
    }
  }, [proposal]);

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPdfUrl(null); // 👈 reset preview
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activityTitle.trim()) {
      newErrors.activityTitle = "Activity title is required";
    }

    if (!formData.briefDetails.trim()) {
      newErrors.briefDetails = "Brief details are required";
    }

    if (!formData.alignedObjective.trim()) {
      newErrors.alignedObjective = "Aligned objective is required";
    }

    if (formData.isCustomVenue) {
      if (!formData.otherVenue.trim()) newErrors.venue = "Please specify the venue";
    } else {
      if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.budget || formData.budget <= 0) {
      newErrors.budget = "Budget must be a positive number";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "Organization is required";
    }

    if (!formData.organizationProfile.trim()) {
      newErrors.organizationProfile = "Organization profile is required";
    }

    if (formData.alignedSDG.length === 0) {
      newErrors.alignedSDG = "Please select at least one SDG";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const data = new FormData();

    // Required identifiers
    data.append("ProposedActionPlanSchema", proposal.ProposedActionPlanSchema);
    data.append("organizationProfile", formData.organizationProfile);
    data.append("organization", formData.organization);

    // Editable fields
    data.append("activityTitle", formData.activityTitle);
    data.append("briefDetails", formData.briefDetails);
    data.append("AlignedObjective", formData.alignedObjective);
    data.append("proposedDate", formData.date);
    data.append("budgetaryRequirements", formData.budget);
  data.append("venue", formData.isCustomVenue ? formData.otherVenue : formData.venue);
    formData.alignedSDG.forEach((sdg) => data.append("alignedSDG[]", sdg));
    data.append("overallStatus", formData.overallStatus);

    if (uploadedFile) {
      data.append("file", uploadedFile);
      data.append("label", "Proposal");
    }

    console.log(data);
    try {
      const res = await axios.put(
        `${API_ROUTER}/updateProposalConduct/${proposal._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setShowPopup("success");
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      console.error(err);
      setShowPopup("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl">Edit Proposal</DialogTitle>
          <DialogDescription>
            Update the proposal details below
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Form Fields */}
            <div className="space-y-6">
              {/* Activity Title */}
              <div className="space-y-2">
                <Label htmlFor="activityTitle">
                  Activity Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="activityTitle"
                  name="activityTitle"
                  value={formData.activityTitle}
                  onChange={handleInputChange}
                  className={errors.activityTitle ? "border-red-500" : ""}
                  placeholder="Enter activity title"
                />
                {errors.activityTitle && (
                  <p className="text-red-500 text-sm">{errors.activityTitle}</p>
                )}
              </div>

              {/* Brief Details */}
              <div className="space-y-2">
                <Label htmlFor="briefDetails">
                  Brief Details <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="briefDetails"
                  name="briefDetails"
                  value={formData.briefDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className={errors.briefDetails ? "border-red-500" : ""}
                  placeholder="Provide brief details about the activity"
                />
                {errors.briefDetails && (
                  <p className="text-red-500 text-sm">{errors.briefDetails}</p>
                )}
              </div>

              {/* Aligned Objective */}
              <div className="space-y-2">
                <Label htmlFor="alignedObjective">
                  Aligned Objective <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="alignedObjective"
                  name="alignedObjective"
                  value={formData.alignedObjective}
                  onChange={handleInputChange}
                  rows={3}
                  className={errors.alignedObjective ? "border-red-500" : ""}
                  placeholder="What objectives does this activity align with?"
                />
                {errors.alignedObjective && (
                  <p className="text-red-500 text-sm">{errors.alignedObjective}</p>
                )}
              </div>

              {/* Venue and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">
                    Venue <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.isCustomVenue ? "Other" : formData.venue}
                    onValueChange={(value) => {
                      if (value === "Other") {
                        setFormData((prev) => ({
                          ...prev,
                          isCustomVenue: true,
                          otherVenue: prev.otherVenue || prev.venue || "",
                          venue: "",
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          isCustomVenue: false,
                          venue: value,
                          otherVenue: "",
                        }));
                      }
                      if (errors.venue) setErrors((p) => ({ ...p, venue: "" }));
                    }}
                    disabled={roomsLoading}
                  >
                    <SelectTrigger
                      id="venue"
                      className={errors.venue ? "border-red-500" : ""}
                    >
                      <SelectValue
                        placeholder={
                          roomsLoading ? "Loading rooms…" : "-- Select Venue --"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.label}>
                          {opt.label}
                          {opt.campus ? ` — ${opt.campus}` : ""}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.isCustomVenue && (
                    <Input
                      name="otherVenue"
                      value={formData.otherVenue}
                      onChange={handleInputChange}
                      placeholder="Enter other venue"
                      className="mt-2"
                    />
                  )}

                  {roomsError && (
                    <Alert variant="warning" className="mt-2">
                      <AlertDescription className="text-xs">
                        {roomsError} — showing fallback options if any.
                      </AlertDescription>
                    </Alert>
                  )}
                  {errors.venue && (
                    <p className="text-red-500 text-sm">{errors.venue}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={errors.date ? "border-red-500" : ""}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm">{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <CurrencyInput
                label="Budget *"
                Icon={Banknote}
                type="number"
                inputMode="decimal"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="0.00"
                min={0}
                step={0.01}
                inputClassName={`rounded-lg ${errors.budget ? "border-red-500" : "border-gray-300"} focus:ring-blue-500 focus:border-transparent`}
                error={errors.budget}
              />
            </div>

            {/* Right Side - SDG Selection and File Upload */}
            <div className="space-y-6">
              {/* Aligned SDG */}
              <div>
                <Label className="text-sm font-medium">
                  Aligned SDG <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { value: "SDG 1", label: "SDG 1: No Poverty" },
                    { value: "SDG 2", label: "SDG 2: Zero Hunger" },
                    { value: "SDG 3", label: "SDG 3: Good Health and Well-being" },
                    { value: "SDG 4", label: "SDG 4: Quality Education" },
                    { value: "SDG 5", label: "SDG 5: Gender Equality" },
                    { value: "SDG 6", label: "SDG 6: Clean Water and Sanitation" },
                    { value: "SDG 7", label: "SDG 7: Affordable and Clean Energy" },
                    { value: "SDG 8", label: "SDG 8: Decent Work and Economic Growth" },
                    { value: "SDG 9", label: "SDG 9: Industry, Innovation and Infrastructure" },
                    { value: "SDG 10", label: "SDG 10: Reduced Inequalities" },
                    { value: "SDG 11", label: "SDG 11: Sustainable Cities and Communities" },
                    { value: "SDG 12", label: "SDG 12: Responsible Consumption and Production" },
                    { value: "SDG 13", label: "SDG 13: Climate Action" },
                    { value: "SDG 14", label: "SDG 14: Life Below Water" },
                    { value: "SDG 15", label: "SDG 15: Life on Land" },
                    { value: "SDG 16", label: "SDG 16: Peace, Justice and Strong Institutions" },
                    { value: "SDG 17", label: "SDG 17: Partnerships for the Goals" },
                  ].map((sdg) => (
                    <div
                      key={sdg.value}
                      className="flex items-center space-x-1 bg-muted/30 rounded-full p-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSDGChange(sdg.value)}
                    >
                      <Checkbox
                        id={`edit-${sdg.value}`}
                        checked={formData.alignedSDG.includes(sdg.value)}
                        onCheckedChange={() => handleSDGChange(sdg.value)}
                      />
                      <label
                        htmlFor={`edit-${sdg.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {sdg.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>
                  Proposal Document <span className="text-red-500">*</span>
                </Label>

                {/* Show existing document info if available */}
                {existingPdfUrl &&
                  !uploadedFile &&
                  proposal.document?.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      {proposal.document.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between mb-2 last:mb-0"
                        >
                          <div className="flex items-center text-sm text-blue-700">
                            <div className="text-lg mr-2">📄</div>
                            <span>{doc.fileName}</span>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                {!uploadedFile ? (
                  <Label
                    htmlFor="file-upload-edit"
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors ${
                      errors.file ? "border-red-500" : ""
                    }`}
                  >
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF files only (MAX. 10MB)
                    </p>
                    <Input
                      id="file-upload-edit"
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                    />
                  </Label>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">📄</div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm truncate">
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
                    </div>
                    {/* PDF Preview */}
                    <div className="bg-white rounded-lg border overflow-hidden h-[500px]">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Preview"
                        frameBorder="0"
                      />
                    </div>
                  </div>
                )}

                {errors.file && (
                  <p className="text-red-500 text-sm">{errors.file}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 flex-shrink-0 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="text-white">Update Proposal</Button>
        </DialogFooter>
      </DialogContent>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          message={
            showPopup === "success"
              ? "Proposal updated successfully!"
              : "Something went wrong."
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
