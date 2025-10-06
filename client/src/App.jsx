import "./main.css";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Route,
  Routes,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/public/home_page";
import { AlertTriangle, X, LogOut } from "lucide-react";
import { NotFoundPage, UnauthorizedPage } from "./components/error";
import StudentLeaderMainPage from "./pages/admin/student-leader/student-leader-main";
import PhilippineAddressForm from "./sandbox";
import { AdviserPage } from "./pages/admin/adviser/adviser_main";
import { DeanPage } from "./pages/admin/dean/dean-main";
import { SduCoordinatorPage } from "./pages/admin/sdu-coordinator/sdu-coor-main";
import { PublicPostFeed } from "./pages/public/public_post";
import { PublicProfile } from "./pages/public/public_profile";
import { SduMainPage } from "./pages/admin/sdu-main/sdu-main";

const MAIN_API_ROUTER = import.meta.env.VITE_API_URL;
export const API_ROUTER = `${MAIN_API_ROUTER}`;
export const DOCU_API_ROUTER = `${MAIN_API_ROUTER}/server/uploads`;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sandbox" element={<PhilippineAddressForm />} />

      <Route element={<ProtectedRoute allowedRoles={["student-leader"]} />}>
        <Route path="/student-leader/*" element={<StudentLeaderMainPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["SDU", "sdu", "Sdu"]} />}>
        <Route path="/SDU/*" element={<SduMainPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["adviser", "Adviser", "ADVISER"]} />
        }
      >
        <Route path="/adviser/*" element={<AdviserPage />} />
      </Route>
      <Route
        element={<ProtectedRoute allowedRoles={["dean", "Dean", "DEAN"]} />}
      >
        <Route path="/dean/*" element={<DeanPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "sdu-coordinator",
              "sdu coordinator",
              "Sdu coordinator",
              "Sdu Coordinator",
              "SDU COORDINATOR",
            ]}
          />
        }
      >
        <Route path="/sdu-coordinator/*" element={<SduCoordinatorPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/post/:orgName" element={<PublicPostFeed />} />
      <Route path="/profile/:orgName" element={<PublicProfile />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Check if user had a previous session before making the request
      const hadPreviousSession = sessionStorage.getItem("userData");

      try {
        const res = await axios.get(`${API_ROUTER}/session-check`, {
          withCredentials: true,
        });

        // if (res.data.rickroll) {
        //   // 🚀 Redirect user to YouTube (or whatever you want)
        //   window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        //   return;
        // }

        if (res.data.loggedIn) {
          const userRole = res.data.user.position;

          if (allowedRoles.includes(userRole)) {
            setUser(res.data.user);
            setShowSessionExpired(false);
          } else {
            // User is logged in but doesn't have permission
            setUser(null);
            navigate("/unauthorized", { replace: true });
          }
        } else {
          // Not logged in - show popup if had previous session
          setUser(null);
          if (hadPreviousSession) {
            setShowSessionExpired(true);
            sessionStorage.removeItem("userData");
          } else {
            // No previous session, redirect to login
            navigate("/", { replace: true });
          }
        }
      } catch (err) {
        // Handle session check errors
        setUser(null);
        if (
          hadPreviousSession &&
          (err.response?.status === 401 || err.response?.status === 403)
        ) {
          setShowSessionExpired(true);
          sessionStorage.removeItem("userData");
        } else if (!hadPreviousSession) {
          // Only redirect if no previous session
          navigate("/", { replace: true });
        }
        // If there was a previous session but error isn't 401/403, show popup anyway
        else {
          setShowSessionExpired(true);
          sessionStorage.removeItem("userData");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [location.pathname, allowedRoles, navigate]);

  // Update sessionStorage when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("userData", JSON.stringify(user));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSessionExpiredRedirect = () => {
    setShowSessionExpired(false);
    sessionStorage.clear();
    navigate("/", { replace: true });
  };

  return (
    <>
      {user ? (
        <Outlet context={{ user }} />
      ) : showSessionExpired ? (
        <SessionExpiredPopup
          isOpen={showSessionExpired}
          onClose={() => setShowSessionExpired(false)}
          onRedirect={handleSessionExpiredRedirect}
        />
      ) : (
        // Show loading or nothing while checking/redirecting
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </>
  );
};

const SessionExpiredPopup = ({ isOpen, onClose, onRedirect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Session Expired
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Your session has expired for security reasons. Please log in again
            to continue.
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onRedirect}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign In Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
