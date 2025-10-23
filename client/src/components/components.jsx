import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../App";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Hammer,
  AlertTriangle,
  X,
  ChevronDown,
  Search,
  LogOut,
} from "lucide-react";
export function OrganizationDropdown({ selectedOrg, onSelectOrg }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
      console.log(res.data);
      setOrgs(res.data);
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
  }, []);

  const handleOrgSelect = (org) => {
    onSelectOrg(org);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onSelectOrg(null);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Organization Dropdown */}
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left border-2 border-amber-400 rounded-lg focus:outline-none focus:border-amber-500 transition-colors bg-white flex items-center justify-between"
        >
          <span className={selectedOrg ? "text-gray-900" : "text-gray-500"}>
            {selectedOrg ? selectedOrg.orgName : "Select an organization..."}
          </span>
          <ChevronDown
            size={20}
            className={`text-amber-500 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full  bg-white border-2 border-amber-400 rounded-lg shadow-lg max-h-60 overflow-auto">
            {loading || searching ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-gray-500 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto mb-2"></div>
                  <p className="text-sm">
                    {searching ? "Searching..." : "Loading..."}
                  </p>
                </div>
              </div>
            ) : orgs.length > 0 ? (
              <>
                {/* Clear selection option */}
                {selectedOrg && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 border-b border-gray-200 text-red-600 font-medium"
                  >
                    Clear Selection
                  </button>
                )}
                {/* Organization options */}
                {orgs.map((org) => (
                  <button
                    key={org._id}
                    type="button"
                    onClick={() => handleOrgSelect(org)}
                    className={`w-full flex items-start  gap-6  px-4 py-3 text-left hover:bg-amber-50 border-b border-gray-200 last:border-b-0 transition-colors ${
                      selectedOrg?._id === org._id
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-900"
                    }`}
                  >
                    <div className="flex gap-4 items-center justify-center ">
                      <img
                        src={` ${DOCU_API_ROUTER}/${org._id}/${org.orgLogo}`}
                        alt="President"
                        className="w-24 aspect-square rounded-full "
                      />
                      <div className="font-medium mb-1 line-clamp-1">
                        {org.orgName}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center p-6 text-gray-500">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No organizations found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function DonePopUp({
  type = "success", // "success" | "error" | "warning"
  message = "Action completed successfully!",
  onClose,
}) {
  // Auto close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      bg: "bg-green-100 border-green-500",
    },
    error: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      bg: "bg-red-100 border-red-500",
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
      bg: "bg-yellow-100 border-yellow-500",
    },
  };

  const { icon, bg } = styles[type] || styles.success;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div
        className={`flex flex-col items-center p-6 rounded-2xl shadow-lg border ${bg} max-w-sm w-full`}
      >
        {icon}
        <p className="mt-3 text-center text-lg font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100"
        >
          Close
        </button>
        <p className="text-xs text-gray-500 mt-2">(Auto closes in 3s)</p>
      </div>
    </div>
  );
}

export function UnderDevelopment() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center px-6">
      <Hammer className="w-16 h-16 text-amber-500 mb-6 animate-bounce" />
      <h1 className="text-4xl font-bold text-amber-500 mb-4">
        Under Development
      </h1>
      <p className="text-gray-600 text-lg">
        This page is currently under development. Please check back later.
      </p>
    </div>
  );
}

export function LogoutButton() {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 0)); // Simulated API call
      await axios.post(`${API_ROUTER}/logout`, {}, { withCredentials: true });

      // Optional: redirect or update UI after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  const handleCancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Logout Button */}
      <div
        onClick={handleLogoutClick}
        className=" rounded-2xl flex gap-2 items-center justify-center text-2xl text-white font-bold px-4 w-full   border-cnsc-primary-color py-2  hover:text-cnsc-secondary-color transition-all duration-500 cursor-pointer  hover:bg-red-700 "
      >
        <LogOut size={16} />
        Logout
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Modal Content */}
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
              <button
                onClick={handleCancelLogout}
                className="text-gray-400 text-2xl hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                <X />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    Are you sure you want to log out?
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    You'll need to sign in again to access your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={handleCancelLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
