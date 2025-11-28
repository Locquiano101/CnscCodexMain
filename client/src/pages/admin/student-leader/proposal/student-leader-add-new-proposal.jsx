import { useEffect, useMemo, useState } from "react";
import { Upload, Banknote, X } from "lucide-react";
import { DonePopUp } from "../../../../components/components";
import CurrencyInput from "../../../../components/currency-input";
import { API_ROUTER } from "../../../../App";
import axios from "axios";
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

export function AddNewProposal({ onClose, orgData, open = true }) {
  const [formData, setFormData] = useState({
    activityTitle: "",
    briefDetails: "",
    alignedObjective: "",
    venue: "",
    otherVenue: "",
    date: "",
    budget: "",
    alignedSDG: [],
    organizationProfile: orgData._id || "",
    organization: orgData.organization || "",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  // Fetch active rooms (optionally could be filtered by campus)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        setRoomsError(null);
        const res = await axios.get(`${API_ROUTER}/rooms`, {
          withCredentials: true,
          params: {},
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
  }, []);

  const roomOptions = useMemo(() => {
    return rooms.map((r) => ({ id: r._id, label: r.name, campus: r.campus }));
  }, [rooms]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "date" && value) {
      const date = new Date(value);
      processedValue = date.toISOString();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSDGChange = (sdg) => {
    setFormData((prev) => ({
      ...prev,
      alignedSDG: prev.alignedSDG.includes(sdg)
        ? prev.alignedSDG.filter((item) => item !== sdg)
        : [...prev.alignedSDG, sdg],
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
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

  const handleRemoveFile = () => {
    setUploadedFile(null);
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

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    } else if (formData.venue === "Other" && !formData.otherVenue.trim()) {
      newErrors.venue = "Please specify the venue";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    const budgetValue = parseFloat(formData.budget.replace(/,/g, ""));
    if (!formData.budget.trim() || isNaN(budgetValue) || budgetValue <= 0) {
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

    if (!uploadedFile) {
      newErrors.file = "Please upload a proposal document";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const fd = new FormData();

      fd.append("activityTitle", formData.activityTitle);
      fd.append("briefDetails", formData.briefDetails);
      fd.append("alignedObjective", formData.alignedObjective);
      fd.append(
        "venue",
        formData.venue === "Other" ? formData.otherVenue : formData.venue
      );
      fd.append("date", formData.date);
      fd.append("budget", parseFloat(formData.budget.replace(/,/g, "")));
      fd.append("alignedSDG", JSON.stringify(formData.alignedSDG));
      fd.append("organization", formData.organization);
      fd.append("organizationProfile", formData.organizationProfile);
      fd.append("overallStatus", "Pending");
      fd.append("submittedAt", new Date().toISOString());

      if (uploadedFile) {
        fd.append("file", uploadedFile);
      }

      const res = await axios.post(
        `${API_ROUTER}/postStudentLeaderNewProposalConduct`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ Upload response:", res.data);
      setShowPopup("success");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setShowPopup("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Proposal</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new proposal
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side */}
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
                {/* Venue */}
                <div className="space-y-2">
                  <Label htmlFor="venue">
                    Venue <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.venue}
                    onValueChange={(value) =>
                      handleInputChange({ target: { name: "venue", value } })
                    }
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

                  {formData.venue === "Other" && (
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

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    name="date"
                    value={formData.date ? formData.date.split("T")[0] : ""}
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
                name="budget"
                value={formData.budget}
                onChange={(e) => {
                  let rawValue = e.target.value.replace(/,/g, "");
                  if (!isNaN(rawValue) && rawValue !== "") {
                    const formatted = parseFloat(rawValue).toLocaleString("en-US");
                    setFormData((prev) => ({ ...prev, budget: formatted }));
                  } else {
                    setFormData((prev) => ({ ...prev, budget: "" }));
                  }
                  if (errors.budget) {
                    setErrors((prev) => ({ ...prev, budget: "" }));
                  }
                }}
                placeholder="0.00"
                inputClassName={`${errors.budget ? "border-red-500" : "border-gray-300"} focus:ring-blue-500 focus:border-transparent`}
                error={errors.budget}
              />
            </div>

            {/* Right Side - SDG Selection and File Upload */}
            <div className="space-y-6">
              {/* SDG Section */}
              <div>
                <Label className="text-sm font-semibold">
                  Aligned Sustainable Development Goals (SDGs){" "}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-lg p-4 mt-3">
                  {[
                    { value: "SDG 1", label: "No Poverty" },
                    { value: "SDG 2", label: "Zero Hunger" },
                    { value: "SDG 3", label: "Good Health & Well-being" },
                    { value: "SDG 4", label: "Quality Education" },
                    { value: "SDG 5", label: "Gender Equality" },
                    { value: "SDG 6", label: "Clean Water & Sanitation" },
                    { value: "SDG 7", label: "Affordable & Clean Energy" },
                    { value: "SDG 8", label: "Decent Work & Economic Growth" },
                    { value: "SDG 9", label: "Industry, Innovation & Infrastructure" },
                    { value: "SDG 10", label: "Reduced Inequalities" },
                    { value: "SDG 11", label: "Sustainable Cities & Communities" },
                    { value: "SDG 12", label: "Responsible Consumption & Production" },
                    { value: "SDG 13", label: "Climate Action" },
                    { value: "SDG 14", label: "Life Below Water" },
                    { value: "SDG 15", label: "Life on Land" },
                    { value: "SDG 16", label: "Peace, Justice & Strong Institutions" },
                    { value: "SDG 17", label: "SDG 17: Partnerships for the Goals" },
                  ].map((sdg) => (
                    <div
                      key={sdg.value}
                      className="flex items-center space-x-2 bg-muted/30 rounded-lg p-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSDGChange(sdg.value)}
                    >
                      <Checkbox
                        id={sdg.value}
                        checked={formData.alignedSDG.includes(sdg.value)}
                        onCheckedChange={() => handleSDGChange(sdg.value)}
                      />
                      <label
                        htmlFor={sdg.value}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {sdg.label}
                      </label>
                    </div>
                  ))}
                </div>

                {errors.alignedSDG && (
                  <p className="text-red-500 text-sm mt-2">{errors.alignedSDG}</p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label>
                  Proposal Document <span className="text-red-500">*</span>
                </Label>

                {!uploadedFile ? (
                  <Label
                    htmlFor="file-upload"
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
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                    />
                  </Label>
                ) : (
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
                )}

                {errors.file && (
                  <p className="text-red-500 text-sm">{errors.file}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Proposal</Button>
        </DialogFooter>
      </DialogContent>

      {showPopup && (
        <DonePopUp
          type={showPopup}
          onClose={() => {
            setShowPopup(null);
            if (showPopup === "success") {
              onClose();
            }
          }}
        />
      )}
    </Dialog>
  );
}
