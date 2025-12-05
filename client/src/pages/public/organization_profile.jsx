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
    <div className="max-w-7xl sm:px-6 py-6 sm:py-8">
      <div className="bg-gradient-to-br from-[#500000]/30 to-[#ee8f00]/20 backdrop-blur-sm border-2 border-white/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="text-center px-4 py-6 sm:py-8 bg-gradient-to-b from-black/10 to-transparent">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide">
            <span className="text-[#500000] drop-shadow-[2px_2px_0_white]">
              CNSC{" "}
            </span>
            <span className="text-[#ee8f00] drop-shadow-[2px_2px_0_white]">
              CODEX{" "}
            </span>
            <span className="block sm:inline text-white drop-shadow-[2px_2px_0_#ee8f00] mt-2 sm:mt-0">
              STUDENT ORGANIZATIONS
            </span>
          </h1>
        </div>

        {/* Organizations Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {currentOrgs.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Building2 className="w-16 h-16 mx-auto text-white/40 mb-4" />
                <p className="text-white/70 text-lg">No organizations available</p>
              </div>
            ) : (
              currentOrgs.map((org) => (
                <div
                  key={org?._id}
                  onClick={() => handleOrgClick(org)}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Logo Section */}
                  <div className="h-40 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                    {org?.orgLogo ? (
                      <img
                                              src={`${DOCU_API_ROUTER}/${org?._id}/${org?.orgLogo}`}

                        alt={`${org?.orgName || "Organization"} Logo`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-10 h-10 text-white" />
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#500000]/0 group-hover:bg-[#500000]/10 transition-colors duration-300" />
                  </div>

                  {/* Footer Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-t-2 border-gray-200">
                    <div className="flex items-start gap-3">
                      {/* Acronym Circle */}
                      <div className="w-10 h-10 bg-gradient-to-br from-[#500000] to-[#ee8f00] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-xs font-bold text-white">
                          {org?.orgAcronym ||
                            org?.orgName?.substring(0, 3).toUpperCase() ||
                            "ORG"}
                        </span>
                      </div>

                      {/* Org Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-gray-800 truncate mb-1">
                          {org?.orgName || "Unnamed Organization"}
                        </p>
                        <p className="text-xs text-gray-600 truncate mb-2">
                          {org?.orgDepartment || "No Department"}
                        </p>

                        {/* Status Badge */}
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            org?.orgClass === "System-wide"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : org?.orgClass === "Local"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-green-100 text-green-800 border border-green-200"
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

        {/* Pagination Controls */}
        {totalSections > 1 && (
          <div className="flex justify-center items-center gap-3 sm:gap-6 px-4 py-6 sm:py-8 bg-gradient-to-t from-black/10 to-transparent">
            {/* Left Chevron */}
            <button
              onClick={goToPrevious}
              disabled={currentSection === 0}
              className={`p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 transition-all duration-300 shadow-lg ${
                currentSection === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:opacity-100 hover:bg-white/30 hover:scale-110 active:scale-95"
              }`}
              aria-label="Previous section"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
            </button>

            {/* Indicators */}
            <div className="flex gap-2 sm:gap-3">
              {Array.from({ length: totalSections }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSection(index)}
                  className={`rounded-full transition-all duration-300 shadow-md ${
                    currentSection === index
                      ? "bg-[#ee8f00] w-8 sm:w-10 h-3 sm:h-4 shadow-lg"
                      : "bg-white/50 hover:bg-white/70 w-3 sm:w-4 h-3 sm:h-4"
                  }`}
                  aria-label={`Go to section ${index + 1}`}
                  aria-current={currentSection === index ? "true" : "false"}
                />
              ))}
            </div>

            {/* Right Chevron */}
            <button
              onClick={goToNext}
              disabled={currentSection === totalSections - 1}
              className={`p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 transition-all duration-300 shadow-lg ${
                currentSection === totalSections - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-80 hover:opacity-100 hover:bg-white/30 hover:scale-110 active:scale-95"
              }`}
              aria-label="Next section"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-md" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
