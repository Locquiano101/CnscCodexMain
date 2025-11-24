import { useState, useEffect } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";

export function OrganizationComponent() {
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

  const ORGS_PER_PAGE = 8;

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${API_ROUTER}/getAllOrganizationProfileCard`
      );
      const orgs = Array.isArray(res.data) ? res.data : [];
      const activeOrgs = orgs.filter((org) => org?.isActive);
      setFilteredOrgs(activeOrgs);
      setLoading(false);
    } catch (e) {
      setFilteredOrgs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrgClick = (org) => {
    if (!org) return;
    navigate(`/profile/${org?.orgName || "unknown"}`, {
      state: { orgData: org },
    });
  };


  // --- PAGINATION LOGIC ---
  const totalSections = Math.ceil(filteredOrgs.length / ORGS_PER_PAGE);
  const currentOrgs = filteredOrgs.slice(
    currentSection * ORGS_PER_PAGE,
    currentSection * ORGS_PER_PAGE + ORGS_PER_PAGE
  );

  const goToPrevious = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentSection((prev) => Math.min(prev + 1, totalSections - 1));
  };

  const goToSection = (index) => {
    setCurrentSection(index);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full flex flex-col justify-between min-h-7/10 py-6  px-4 mx-auto relative h-fit bg-cnsc-primary-color/25 border-2 border-white/50  rounded-xl shadow-md">
      {/* Header */}
      <div className="text-center ">
        {/* CNSC CODEX Title */}
        <div className="flex flex-wrap items-center justify-center text-center">
          <h1 className="text-xl md:text-4xl font-extrabold tracking-wide">
            <span className="text-[#500000] drop-shadow-[1px_1px_0_white]">
              CNSC{" "}
            </span>
            <span className="text-[#ee8f00] mr-2 drop-shadow-[1px_1px_0_white]">
              CODEX{" "}
            </span>
            <span className="text-white drop-shadow-[1px_1px_0_#ee8f00]">
              STUDENT ORGANIZATIONS
            </span>
          </h1>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="h-full py-4">
        <div className="grid grid-cols-4 gap-6">
          {currentOrgs.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No organizations available</p>
            </div>
          ) : (
            currentOrgs.map((org) => (
              console.log(
                      `${DOCU_API_ROUTER}/${org?._id}/${org?.orgLogo}`

              ),
              <div
                key={org?._id || Math.random()}
                onClick={() => handleOrgClick(org)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                {/* Logo Section */}
                <div className="h-40 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                  {org?.orgLogo ? (
                    <img
                      src={`${DOCU_API_ROUTER}/${org?._id}/${org?.orgLogo}`}
                      alt={`${org?.orgName || "Organization"} Logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML =
                          '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div></div>';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="h-16 bg-gray-300 p-4 flex items-center">
                  <div className="flex items-center space-x-3 w-full">
                    {/* Acronym */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        {org?.orgAcronym ||
                          org?.orgName?.substring(0, 3).toUpperCase() ||
                          "ORG"}
                      </span>
                    </div>

                    {/* Org name & department */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {org?.orgName || "Unnamed Organization"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {org?.orgDepartment || "No Department"}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          org?.orgClass === "System-wide"
                            ? "bg-amber-100 text-amber-700"
                            : org?.orgClass === "Local"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {org?.orgClass || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Circular Indicators with Chevrons */}
      {totalSections > 1 && (
        <div className="flex justify-center items-center gap-4 ">
          {/* Left Chevron */}
          <button
            onClick={goToPrevious}
            disabled={currentSection === 0}
            className={`p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
              currentSection === 0
                ? "opacity-30 cursor-not-allowed"
                : "opacity-70 hover:opacity-100 hover:bg-white/20"
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Indicators */}
          <div className="flex gap-3">
            {Array.from({ length: totalSections }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSection(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSection === index
                    ? "bg-yellow-300 w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to section ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Chevron */}
          <button
            onClick={goToNext}
            disabled={currentSection === totalSections - 1}
            className={`p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 ${
              currentSection === totalSections - 1
                ? "opacity-30 cursor-not-allowed"
                : "opacity-70 hover:opacity-100 hover:bg-white/20"
            }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
