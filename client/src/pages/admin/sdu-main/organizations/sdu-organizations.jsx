import { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { ChevronDown } from "lucide-react";

export function SduMainOrganizationsComponent({ selectedOrg, onSelectOrg }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      const orgs = Array.isArray(res.data) ? res.data : [];
      const activeOrgs = orgs.filter((org) => org?.isActive);
      setOrganizations(activeOrgs);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  if (loading) {
    return <div className="p-4">Loading organizations...</div>;
  }

  return (
    <div className="p-4 relative">
      <h1 className="text-xl font-bold mb-4">Active Organizations</h1>
      {organizations.length === 0 ? (
        <p className="text-gray-500">No active organizations found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-left text-sm relative">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Organization</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Accreditation Eligibility</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr
                key={org._id}
                onClick={() => {
                  console.log("Selected org:", org);
                  onSelectOrg?.(org);
                }}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedOrg?._id === org._id ? "bg-blue-100" : ""
                }`}
              >
                {/* Organization */}
                <td className="p-2 border font-semibold">
                  <div className="flex gap-4 items-center">
                    {org.orgLogo ? (
                      <img
                        src={`${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                        alt={org.orgAcronym}
                        className="h-20 w-20 aspect-square object-contain rounded-full"
                      />
                    ) : (
                      <span className="text-gray-400">No Logo</span>
                    )}
                    <div className="flex flex-col text-lg">
                      <h1>{org.orgName}</h1>
                      <h1 className="font-normal italic">{org.orgAcronym}</h1>
                    </div>
                  </div>
                </td>

                {/* Class */}
                <td className="p-2 border">
                  <div className="flex flex-col">
                    <h1 className="font-semibold">Class: {org.orgClass}</h1>

                    {org.orgClass?.toLowerCase() === "system-wide" &&
                      org.orgSpecialization && (
                        <h1>Specialization: {org.orgSpecialization}</h1>
                      )}

                    {org.orgClass?.toLowerCase() === "local" && (
                      <>
                        {org.orgCourse && <h1>Course: {org.orgCourse}</h1>}
                        {org.orgDepartment && (
                          <h1>Department: {org.orgDepartment}</h1>
                        )}
                      </>
                    )}
                  </div>
                </td>

                {/* Eligible for Accreditation */}
                <td
                  className="p-2 border relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === org._id ? null : org._id);
                  }}
                >
                  <div className="flex h-full w-full justify-between items-center">
                    {org.isAllowedForAccreditation ? "Yes" : "No"}
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  {openMenuId === org._id && (
                    <div
                      className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-md z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          console.log("Allow Accreditation for", org.orgName);
                          setOpenMenuId(null);
                        }}
                      >
                        Allow Accreditation
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                        onClick={() => {
                          console.log("Revoke Accreditation for", org.orgName);
                          setOpenMenuId(null);
                        }}
                      >
                        Revoke Accreditation
                      </button>
                    </div>
                  )}
                </td>

                {/* Status */}
                <td
                  className={`p-2 border font-medium ${
                    org.overAllStatus === "Approved"
                      ? "text-green-600"
                      : org.overAllStatus === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {org.overAllStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
