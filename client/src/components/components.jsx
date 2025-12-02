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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
export function OrganizationDropdown({ selectedOrg, onSelectOrg }) {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_ROUTER}/getAllOrganizationProfile`);
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
    <Card className="m-8">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Hammer className="w-16 h-16 text-secondary mb-6 animate-bounce" />
        <h1 className="text-4xl font-bold text-secondary mb-4">
          Under Development
        </h1>
        <p className="text-muted-foreground text-lg">
          This page is currently under development. Please check back later.
        </p>
      </CardContent>
    </Card>
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
      await axios.post(`${API_ROUTER}/logout`, {}, { withCredentials: true });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleLogoutClick}
        className="w-full justify-start gap-3 h-11 px-3 text-sm font-medium rounded-lg text-foreground hover:bg-muted"
      >
        <LogOut className="w-5 h-5" />
        <span className="flex-1 text-left">Logout</span>
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 py-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <LogOut size={24} className="text-destructive" />
            </div>
            <div>
              <p className="font-medium">
                This action will end your current session
              </p>
              <p className="text-sm text-muted-foreground">
                Any unsaved changes may be lost
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
