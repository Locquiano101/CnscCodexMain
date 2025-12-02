import React, { useEffect, useState } from "react";
import { ChevronDown, Search, CheckCircle, X, Banknote } from "lucide-react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import CurrencyInput from "../../../../../components/currency-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditPpa({
  selectedProposal,
  orgData,
  accreditationData,
  onClose,
  onFinish,
}) {
  const [selectedOrganizations, setSelectedOrganizations] = useState(
    selectedProposal?.collaboratingEntities || []
  );
  const [formData, setFormData] = useState({
    activityTitle: selectedProposal?.activityTitle || "",
    briefDetails: selectedProposal?.briefDetails || "",
    AlignedObjective: selectedProposal?.AlignedObjective || "",
    alignedSDG: selectedProposal?.alignedSDG || [],
    budgetaryRequirements: selectedProposal?.budgetaryRequirements || "",
    collaboratingEntities: selectedProposal?.collaboratingEntities || [],
    venue: selectedProposal?.venue || "",
    proposedDate: selectedProposal?.proposedDate
      ? new Date(selectedProposal.proposedDate).toISOString().slice(0, 7) // <-- format to yyyy-MM
      : "",
    overallStatus: selectedProposal?.overallStatus || "Pending",
    organizationProfile: orgData._id,
    organization: orgData.organization,
    accreditation: accreditationData._id,
    documents: selectedProposal?.documents || [],
  });

  console.log(selectedProposal._id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowPopUp(true);
    setUploadSuccess(false);

    try {
      const response = await axios.post(
        `${API_ROUTER}/UpdateStudentLeaderProposal/${selectedProposal._id}`,
        formData
      );
      console.log("Success:", response.data);

      // Show success state
      setUploadSuccess(true);

      // Hide popup after 2 seconds and close modal
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Proposed Action Plan
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
              <Input
                id="venue"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                placeholder="Enter venue location"
                className="mt-2"
              />
            </div>

            {/* Proposed Date */}
            <div>
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
            <CurrencyInput
              label="Budgetary Requirements *"
              Icon={Banknote}
              name="budgetaryRequirements"
              value={formData.budgetaryRequirements}
              onChange={handleInputChange}
              required
              inputMode="text"
              placeholder="e.g., 50,000 - 100,000"
              inputClassName="rounded-md focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Full-width fields */}
          <div className="mt-6 space-y-6">
            {/* Brief Details */}
            <div>
              <Label htmlFor="briefDetails">Brief Details *</Label>
              <Textarea
                id="briefDetails"
                name="briefDetails"
                value={formData.briefDetails}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Enter brief details about the activity"
                className="mt-2"
              />
            </div>

            {/* Aligned Organization Objectives */}
            <div>
              <Label htmlFor="AlignedObjective">Aligned Organization Objectives *</Label>
              <Textarea
                id="AlignedObjective"
                name="AlignedObjective"
                value={formData.AlignedObjective}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe how this aligns with organizational objectives"
                className="mt-2"
              />
            </div>

            {/* Collaborating Entities */}
            <div>
              <Label htmlFor="collaboratingEntities">Collaborating Entities</Label>
              <OrganizationDropdown
                selectedOrgs={selectedOrganizations}
                onSelectOrgs={handleOrgSelection}
                excludeOrgId={formData.organizationProfile}
              />
            </div>
            {/* Aligned SDG */}
            <div className="md:col-span-2">
              <Label className="text-base">Aligned SDG *</Label>
              <div className="flex w-full col-span-2 flex-wrap gap-2 mt-2">
                {[
                  { value: "SDG 1", label: "SDG 1: No Poverty" },
                  { value: "SDG 2", label: "SDG 2: Zero Hunger" },
                  {
                    value: "SDG 3",
                    label: "SDG 3: Good Health and Well-being",
                  },
                  { value: "SDG 4", label: "SDG 4: Quality Education" },
                  { value: "SDG 5", label: "SDG 5: Gender Equality" },
                  {
                    value: "SDG 6",
                    label: "SDG 6: Clean Water and Sanitation",
                  },
                  {
                    value: "SDG 7",
                    label: "SDG 7: Affordable and Clean Energy",
                  },
                  {
                    value: "SDG 8",
                    label: "SDG 8: Decent Work and Economic Growth",
                  },
                  {
                    value: "SDG 9",
                    label: "SDG 9: Industry, Innovation and Infrastructure",
                  },
                  { value: "SDG 10", label: "SDG 10: Reduced Inequalities" },
                  {
                    value: "SDG 11",
                    label: "SDG 11: Sustainable Cities and Communities",
                  },
                  {
                    value: "SDG 12",
                    label: "SDG 12: Responsible Consumption and Production",
                  },
                  { value: "SDG 13", label: "SDG 13: Climate Action" },
                  { value: "SDG 14", label: "SDG 14: Life Below Water" },
                  { value: "SDG 15", label: "SDG 15: Life on Land" },
                  {
                    value: "SDG 16",
                    label: "SDG 16: Peace, Justice and Strong Institutions",
                  },
                  {
                    value: "SDG 17",
                    label: "SDG 17: Partnerships for the Goals",
                  },
                ].map((sdg) => (
                  <div key={sdg.value} className="bg-gray-200 rounded-full">
                    <label className="flex items-center space-x-1 p-2 hover:bg-gray-100 rounded cursor-pointer">
                      <Checkbox
                        checked={formData.alignedSDG.includes(sdg.value)}
                        onCheckedChange={() => handleSDGChange(sdg.value)}
                        className="h-5 w-5 rounded-full border-gray-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <span className="text-sm">{sdg.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Updating Proposal..." : "Save Changes"}
            </Button>
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
                  <div className="animate-spin rounded-full h-12 w-8 border-b-2 border-amber-600 mb-4"></div>
                  <p className="text-lg font-medium text-gray-800">
                    Uploading...
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Please wait while we process your proposal
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <p className="text-lg font-medium text-gray-800">
                    Update Complete!
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Your proposal has been successfully updated
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
