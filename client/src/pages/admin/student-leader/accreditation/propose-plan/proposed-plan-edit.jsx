import React, { useEffect, useState } from "react";
import { ChevronDown, Search, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full flex flex-col max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between px-4 p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Proposed Action Plan
          </h2>
          <X size={24} onClick={onClose} />
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activity Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title *
              </label>
              <input
                type="text"
                name="activityTitle"
                value={formData.activityTitle}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter activity title"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter venue location"
              />
            </div>

            {/* Proposed Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Month *
              </label>
              <input
                type="month"
                name="proposedDate"
                value={formData.proposedDate}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Budgetary Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budgetary Requirements *
              </label>
              <input
                type="text"
                name="budgetaryRequirements"
                value={formData.budgetaryRequirements}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g., ₱50,000 - ₱100,000"
              />
            </div>
          </div>

          {/* Full-width fields */}
          <div className="mt-6 space-y-6">
            {/* Brief Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brief Details *
              </label>
              <textarea
                name="briefDetails"
                value={formData.briefDetails}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter brief details about the activity"
              />
            </div>

            {/* Aligned Organization Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aligned Organization Objectives *
              </label>
              <textarea
                name="AlignedObjective"
                value={formData.AlignedObjective}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Describe how this aligns with organizational objectives"
              />
            </div>

            {/* Collaborating Entities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collaborating Entities
              </label>
              <OrganizationDropdown
                selectedOrgs={selectedOrganizations}
                onSelectOrgs={handleOrgSelection}
                excludeOrgId={formData.organizationProfile}
              />
            </div>
            {/* Aligned SDG */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aligned SDG *
              </label>
              <div className="flex w-full col-span-2 flex-wrap gap-2">
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
                      <input
                        type="checkbox"
                        checked={formData.alignedSDG.includes(sdg.value)}
                        onChange={() => handleSDGChange(sdg.value)}
                        className="appearance-none h-5 w-5 rounded-full border border-gray-400 checked:bg-amber-500 cursor-pointer"
                      />
                      <span className="text-sm">{sdg.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 rounded-md font-medium ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                } text-white transition duration-200`}
              >
                {isSubmitting ? "Updating Proposal..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Upload Status Popup */}
      {showPopUp && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center justify-center max-w-sm w-full mx-4">
            {!uploadSuccess ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
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
        </div>
      )}
    </div>
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
