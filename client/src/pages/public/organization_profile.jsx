import { useState, useEffect } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../App";
import axios from "axios";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function OrganzationComponent() {
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `${API_ROUTER}/getAllOrganizationProfileCard`
      );

      // Make sure res.data is always an array
      const orgs = Array.isArray(res.data) ? res.data : [];

      // keep only active organizations (safe check)
      const activeOrgs = orgs.filter((org) => org?.isActive);
      setFilteredOrgs(activeOrgs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setFilteredOrgs([]); // fallback to empty
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

  const handleSeeMore = () => {
    setShowAll(!showAll);
  };

  // Show only first 4 organizations initially, or all if showAll is true
  const displayedOrgs = showAll ? filteredOrgs : filteredOrgs.slice(0, 4);

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
    <div className="bg-gray-400 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            STUDENT ORGANIZATIONS
          </h2>
          <div className="w-16 h-1 bg-orange-400 mx-auto"></div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {displayedOrgs.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No organizations available</p>
            </div>
          ) : (
            displayedOrgs.map((org) => (
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

        {/* See More/Less Button */}
        {filteredOrgs.length > 4 && (
          <div className="text-center">
            <button
              onClick={handleSeeMore}
              className="px-8 py-3 border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition-all duration-300 rounded-none"
            >
              {showAll ? "SHOW LESS" : "SEE MORE"}
            </button>
          </div>
        )}

        {/* Extra Info when showing all */}
        {showAll && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Organization Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredOrgs.length}
                </div>
                <div className="text-sm text-gray-600">Total Organizations</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {
                    filteredOrgs.filter(
                      (org) => org?.orgClass === "System-wide"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">System-wide</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {
                    filteredOrgs.filter((org) => org?.orgClass === "Local")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-600">Local</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
