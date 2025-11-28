import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

import { X, CheckCircle, ChevronDown, Search, Banknote } from "lucide-react";
import CurrencyInput from "../../../../../components/currency-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddProposedActionPlan({
  orgData,
  accreditationData,
  onClose,
  onFinish,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    activityTitle: "",
    briefDetails: "",
    AlignedObjective: "",
    alignedSDG: [],
    budgetaryRequirements: "",
    label: "proposal",
    collaboratingEntities: [],
    venue: "",
    proposalType: "",
    proposalCategory: "",
    proposedDate: "",
    overallStatus: "Pending",
    organizationProfile: orgData._id,
    organization: orgData.organization,
    accreditation: accreditationData._id,
    documents: [],
  });
  const [showPopUp, setShowPopUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);

  const handleOrgSelection = (selectedOrgs) => {
    const selectedOrgIds = selectedOrgs.map((org) => org._id);

    console.log(selectedOrgIds);
    setSelectedOrganizations(selectedOrgs);
    setFormData((prev) => ({
      ...prev,
      collaboratingEntities: selectedOrgIds,
    }));
    console.log("Selected organizations:", selectedOrgs);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle SDG checkbox changes
  const handleSDGChange = (sdgValue) => {
    setFormData((prev) => ({
      ...prev,
      alignedSDG: prev.alignedSDG.includes(sdgValue)
        ? prev.alignedSDG.filter((sdg) => sdg !== sdgValue)
        : [...prev.alignedSDG, sdgValue],
    }));
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation for step 1
  const isStep1Valid = () => {
    return (
      formData.activityTitle.trim() &&
      formData.venue.trim() &&
      formData.proposedDate.trim() &&
      formData.budgetaryRequirements.trim() &&
      formData.alignedSDG.length > 0
    );
  };

  // Submit handler - for final step
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowPopUp(true);
    setUploadSuccess(false);

    console.log("=== PROPOSAL SUBMISSION LOG ===");
    console.log("Form Data:", formData);
    console.log("================================");

    try {
      // Send as regular JSON object
      const response = await axios.post(
        `${API_ROUTER}/postStudentLeaderProposal`,
        formData, // Send formData directly as JSON
        {
          headers: {
            "Content-Type": "application/json", // Specify JSON content type
          },
        }
      );

      console.log("API Response Success:", response.data);
      setUploadSuccess(true);

      setTimeout(() => {
        setShowPopUp(false);
        onClose();
        onFinish();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading.");
      setShowPopUp(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Activity Title */}
        <div>
          <Label htmlFor="activityTitle">Activity Title *</Label>
          <Input
            id="activityTitle"
            type="text"
            name="activityTitle"
            value={formData.activityTitle}
            onChange={handleInputChange}
            required
            placeholder="Enter activity title"
            className="mt-2"
          />
        </div>
        {/* Venue */}
        <div>
          <Label htmlFor="venue">Venue *</Label>
          <Select
            value={formData.venue === "other" ? "other" : formData.venue || ""}
            onValueChange={(value) => {
              if (value === "other") {
                setFormData({
                  ...formData,
                  venue: "",
                  customVenue: "",
                  isCustomVenue: true,
                });
              } else {
                setFormData({
                  ...formData,
                  venue: value,
                  isCustomVenue: false,
                });
              }
            }}
            required
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select a venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Covered Court">Covered Court</SelectItem>
              <SelectItem value="Student Activity Center">
                Student Activity Center
              </SelectItem>
              <SelectItem value="Pavilion">Pavilion</SelectItem>
              <SelectItem value="Student Park">Student Park</SelectItem>
              <SelectItem value="Cafeteria">Cafeteria</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Show custom venue field when 'Other' is selected */}
          {formData.isCustomVenue && (
            <Input
              type="text"
              name="customVenue"
              value={formData.customVenue || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customVenue: e.target.value,
                  venue: e.target.value, // keeps actual venue value updated
                })
              }
              placeholder="Enter other venue"
              className="mt-2"
            />
          )}
        </div>

        <div className="col-span-2 flex gap-4 justify-between">
          {/* Proposed Date */}
          <div className="w-full">
            <Label htmlFor="proposedDate">Proposed Month *</Label>
            <Input
              id="proposedDate"
              type="month"
              name="proposedDate"
              value={formData.proposedDate}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>

          {/* Budgetary Requirements */}
          <div className="w-full">
            <CurrencyInput
              label="Budgetary Requirements *"
              Icon={Banknote}
              name="budgetaryRequirements"
              value={
                formData.budgetaryRequirements
                  ? Number(formData.budgetaryRequirements).toLocaleString()
                  : ""
              }
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^\d]/g, "");
                handleInputChange({
                  target: {
                    name: "budgetaryRequirements",
                    value: rawValue,
                  },
                });
              }}
              required
              placeholder="e.g., 50,000"
              inputClassName="rounded-md focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Internal / External */}
          <div className="w-full">
            <Label htmlFor="proposalCategory">Proposal Category *</Label>
            <div className="mt-2 p-3.5 border flex justify-evenly items-center border-gray-300 rounded-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="proposalCategory"
                  value="internal"
                  checked={formData.proposalCategory === "internal"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">Internal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="proposalCategory"
                  value="external"
                  checked={formData.proposalCategory === "external"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">External</span>
              </label>
            </div>
          </div>
        </div>
        {/* Brief Details */}
        <div className="md:col-span-2">
          <Label htmlFor="briefDetails">Brief Details *</Label>
          <Textarea
            id="briefDetails"
            name="briefDetails"
            value={formData.briefDetails}
            onChange={handleInputChange}
            required
            rows={5}
            placeholder="Short details about the program"
            className="mt-2"
          />
        </div>
        {/* Aligned Org Objectives */}
        <div className="md:col-span-2">
          <Label htmlFor="AlignedObjective">Aligned Org Objectives *</Label>
          <Textarea
            id="AlignedObjective"
            name="AlignedObjective"
            value={formData.AlignedObjective}
            onChange={handleInputChange}
            required
            rows={3}
            placeholder="Details for Aligned Objective"
            className="mt-2"
          />
        </div>
        <div className="md:col-span-2">
          <OrganizationDropdown
            selectedOrgs={selectedOrganizations}
            onSelectOrgs={handleOrgSelection}
            excludeOrgId={orgData?._id}
          />
        </div>

        {/* Aligned SDG */}
        <div className="md:col-span-2 text-black">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Aligned Sustainable Development Goals (SDGs){" "}
            <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { value: "SDG 1", label: "No Poverty" },
              { value: "SDG 2", label: "Zero Hunger" },
              { value: "SDG 3", label: "Good Health and Well-being" },
              { value: "SDG 4", label: "Quality Education" },
              { value: "SDG 5", label: "Gender Equality" },
              { value: "SDG 6", label: "Clean Water and Sanitation" },
              { value: "SDG 7", label: "Affordable and Clean Energy" },
              { value: "SDG 8", label: "Decent Work and Economic Growth" },
              {
                value: "SDG 9",
                label: "Industry, Innovation and Infrastructure",
              },
              { value: "SDG 10", label: "Reduced Inequalities" },
              { value: "SDG 11", label: "Sustainable Cities and Communities" },
              {
                value: "SDG 12",
                label: "Responsible Consumption and Production",
              },
              { value: "SDG 13", label: "Climate Action" },
              { value: "SDG 14", label: "Life Below Water" },
              { value: "SDG 15", label: "Life on Land" },
              {
                value: "SDG 16",
                label: "Peace, Justice and Strong Institutions",
              },
              { value: "SDG 17", label: "Partnerships for the Goals" },
            ].map((sdg) => (
              <label
                key={sdg.value}
                className={`flex flex-col items-start gap-1 p-3 rounded-lg border cursor-pointer transition-all duration-200 shadow-sm
          ${
            formData.alignedSDG.includes(sdg.value)
              ? "border-amber-500 bg-amber-50 text-amber-700 shadow"
              : "border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-gray-100"
          }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.alignedSDG.includes(sdg.value)}
                    onCheckedChange={() => handleSDGChange(sdg.value)}
                    className="h-5 w-5 rounded-full border-gray-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <span className="font-semibold text-sm">{sdg.value}</span>
                </div>
                <span className="text-xs text-gray-600">{sdg.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 ">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Review & Submit
      </h3>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">Activity Details</h4>
          <p className="text-sm text-gray-600">
            Title: {formData.activityTitle}
          </p>
          <p className="text-sm text-gray-600">Venue: {formData.venue}</p>
          <p className="text-sm text-gray-600">Date: {formData.proposedDate}</p>
          <p className="text-sm text-gray-600">
            Budget: {formData.budgetaryRequirements}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Brief Details: {formData.briefDetails}
          </p>
          <p className="text-sm text-gray-600">
            Aligned Objective: {formData.AlignedObjective}
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Aligned SDGs</h4>
          <p className="text-sm text-gray-600">
            {formData.alignedSDG.join(", ")}
          </p>
        </div>

        {selectedOrganizations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900">
              Collaborating Organizations
            </h4>
            <p className="text-sm text-gray-600">
              {selectedOrganizations
                .map((org) => org.orgName || org.organization)
                .join(", ")}
            </p>
          </div>
        )}

        {formData.documents.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900">Documents</h4>
            <p className="text-sm text-gray-600">
              {formData.documents.length} Document(s) uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Proposed Action Plan
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex py-4 items-center justify-evenly gap-4 border-b border-gray-300">
          {[1, 2].map((step) => (
            <div key={step} className="flex items-center flex-col">
              <div
                className={`w-12 aspect-square rounded-full flex items-center justify-center text-lg font-medium ${
                  step <= currentStep
                    ? "bg-amber-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {/* Step description directly under circle */}
              <p className="mt-2 text-sm font-medium text-gray-700">
                {step === 1 && "Basic Information"}
                {step === 2 && "Review & Submit"}
              </p>
              {step < 2 && (
                <div
                  className={`flex${
                    step < currentStep ? "bg-amber-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-between w-full">
            <div>
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>

              {currentStep < 2 ? (
                <Button
                  onClick={nextStep}
                  disabled={currentStep === 1 && !isStep1Valid()}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Submitting..." : "Submit Proposal"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Upload Status Popup */}
      {showPopUp && (
        <Dialog open={showPopUp} onOpenChange={() => {}}>
          <DialogContent className="max-w-sm">
            <div className="flex flex-col items-center justify-center p-4">
              {!uploadSuccess ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                  <p className="text-lg font-medium text-gray-800">
                    Submitting...
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Please wait while we process your proposal
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <p className="text-lg font-medium text-gray-800">
                    Submission Complete!
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Your proposal has been successfully submitted
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function OrganizationDropdown({ selectedOrgs, onSelectOrgs, excludeOrgId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [searchScope, setSearchScope] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Function to fetch data
  const fetchData = async () => {
    try {
      if (searchTerm.trim() !== "") {
        setSearching(true);
      } else {
        setLoading(true);
      }
      const res = await axios.get(
        `${API_ROUTER}/getAllCollaboratingOrganizationProfile?search=${encodeURIComponent(
          searchTerm
        )}&department=${encodeURIComponent(
          selectedDepartment
        )}&program=${encodeURIComponent(
          selectedProgram
        )}&specialization=${encodeURIComponent(
          selectedSpecialization
        )}&scope=${encodeURIComponent(searchScope)}`
      );

      // Filter out the excluded organization
      const filteredOrgs = res.data.filter((org) => org._id !== excludeOrgId);
      setOrgs(filteredOrgs);
    } catch (err) {
      console.error("Error fetching data:", err);
      setOrgs([]);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Effect for search term with debounce
  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const delay = setTimeout(() => {
      fetchData();
    }, 300);

    setTimeoutId(delay);

    return () => {
      if (delay) clearTimeout(delay);
    };
  }, [searchTerm]);

  // Effect for immediate search on dropdown changes and scope changes
  useEffect(() => {
    fetchData();
  }, [
    selectedDepartment,
    selectedProgram,
    selectedSpecialization,
    searchScope,
    excludeOrgId,
  ]);

  // Reset filters when scope changes
  useEffect(() => {
    setSelectedDepartment("");
    setSelectedProgram("");
    setSelectedSpecialization("");
  }, [searchScope]);

  const handleOrgToggle = (org) => {
    const isSelected = selectedOrgs.some(
      (selected) => selected._id === org._id
    );
    let newSelectedOrgs;

    if (isSelected) {
      // Remove from selection
      newSelectedOrgs = selectedOrgs.filter(
        (selected) => selected._id !== org._id
      );
    } else {
      // Add to selection
      newSelectedOrgs = [...selectedOrgs, org];
    }

    onSelectOrgs(newSelectedOrgs);
  };

  const clearAllSelections = () => {
    onSelectOrgs([]);
  };

  const removeOrganization = (orgId) => {
    const newSelectedOrgs = selectedOrgs.filter((org) => org._id !== orgId);
    onSelectOrgs(newSelectedOrgs);
  };

  const getDisplayText = () => {
    if (selectedOrgs.length === 0)
      return "S elect cooperating organizations...";
    if (selectedOrgs.length === 1) return selectedOrgs[0].orgName;
    return `${selectedOrgs.length} organizations selected`;
  };

  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSearchInputClick = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="flex flex-col w-full ">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cooperating Entities
      </label>

      {/* Selected Organizations Display */}
      {selectedOrgs.length > 0 && (
        <div className="bg-amber-50 border border-gray-100 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800">
              Selected Organizations ({selectedOrgs.length})
            </span>
            <button
              type="button"
              onClick={clearAllSelections}
              className="text-xs text-amber-600 hover:text-amber-800 underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedOrgs.map((org) => (
              <div
                key={org._id}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-1"
              >
                {org.orgLogo ? (
                  <img
                    src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                    alt={org.orgName}
                    className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-md font-semibold text-amber-700">
                      {org.orgName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="font-medium text-gray-900 truncate">
                  {org.orgName}
                </div>
                <button
                  type="button"
                  onClick={() => removeOrganization(org._id)}
                  className="text-amber-600 hover:text-amber-800 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organization Dropdown with Integrated Search */}
      <div className="relative rounded-xl">
        {/* Dropdown Button with Search Input */}
        <div
          className="w-full rounded-xl px-4 py-3 border border-gray-300  focus-within:border-gray-500 transition-colors bg-white flex items-center justify-between cursor-pointer"
          onClick={handleDropdownClick}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={handleSearchInputClick}
              placeholder={
                selectedOrgs.length > 0
                  ? getDisplayText()
                  : "Search and select cooperating organizations..."
              }
              className="w-full outline-none bg-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
          <ChevronDown
            size={20}
            className={`text-amber-500 transform transition-transform flex-shrink-0 ml-2 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full bg-white  border-gray-300 shadow-lg max-h-60 overflow-auto ">
            {loading || searching ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-gray-500 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
                  <p className="text-sm">
                    {searching ? "Searching..." : "Loading..."}
                  </p>
                </div>
              </div>
            ) : orgs.length > 0 ? (
              <>
                {/* Organization options with checkboxes */}
                {orgs.map((org) => {
                  const isSelected = selectedOrgs.some(
                    (selected) => selected._id === org._id
                  );
                  return (
                    <label
                      key={org._id}
                      className={`w-full flex items-center justify-center gap-3 px-4 py-3 hover:bg-amber-50 border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                        isSelected ? "bg-amber-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOrgToggle(org)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex gap-3 items-center flex-1 min-w-0">
                        {org.orgLogo ? (
                          <img
                            src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                            alt={org.orgName}
                            className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-amber-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-semibold text-amber-700">
                              {org.orgName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        <div className="font-medium text-gray-900 truncate">
                          {org.orgName}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No organizations found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
