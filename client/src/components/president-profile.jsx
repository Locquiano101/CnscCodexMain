import {
  MoreHorizontal,
  Mail,
  MapPin,
  Award,
  Calendar,
  User,
  Facebook,
} from "lucide-react";
import { useState } from "react";
import { API_ROUTER, DOCU_API_ROUTER } from "../App";

export const CurrentPresidentCard = ({ currentPresident }) => {
  const president = currentPresident || {};
  const {
    name,
    course,
    year,
    department,
    age,
    sex,
    religion,
    nationality,
    profilePicture,
    presentAddress,
    contactNo,
    facebookAccount,
    overAllStatus,
    parentGuardian,
    sourceOfFinancialSupport,
    talentSkills,
    classSchedule,
  } = president;

  const profilePictureUrl = `${DOCU_API_ROUTER}/${president.organizationProfile}/${profilePicture}`;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "", message: "" });

  const submitUpdate = async ({ status }) => {
    try {
      const payload = { overallStatus: status };
      if (revisionNotes && revisionNotes.trim() !== "") {
        payload.revisionNotes = revisionNotes;
      }

      console.log("Update payload:", payload);

      setShowRevisionModal(false);
      setShowApproveModal(false);
      setPopup({
        open: true,
        type: "success",
        message: `Proposal successfully ${status}`,
      });
    } catch (error) {
      console.log("Update failed:", error);
      setPopup({
        open: true,
        type: "error",
        message: "Failed to update proposal. Please try again.",
      });
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Approved by the Adviser")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Revision from the Adviser")
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="mx-auto p-4">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center w-full relative border-b pb-2 p-4 mb-2">
          <h1 className="text-xl font-bold text-center flex-1">
            CURRENT PRESIDENT
          </h1>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreHorizontal size={32} className=" text-cnsc-primary-color" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowRevisionModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                >
                  Send for Revision
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                >
                  Approve Proposal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header with Profile */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-slate-100 via-slate-50 to-white"></div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-lg">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <User className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Basic Info */}
              <div className="flex-1 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {name || "N/A"}
                    </h1>
                    <p className="text-slate-600 font-medium">
                      {course || "N/A"}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {year} • {department}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                      overAllStatus
                    )}`}
                  >
                    {overAllStatus || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-6 pb-6 space-y-6">
          {/* Info Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Personal Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Personal Info
              </h3>
              <div className="space-y-2">
                <InfoRow label="Age" value={age} />
                <InfoRow label="Sex" value={sex} />
                <InfoRow label="Religion" value={religion} />
                <InfoRow label="Nationality" value={nationality} />
                <InfoRow label="Contact" value={contactNo} />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Additional Info
              </h3>
              <div className="space-y-2">
                <InfoRow label="Parent/Guardian" value={parentGuardian} />
                <InfoRow
                  label="Financial Support"
                  value={sourceOfFinancialSupport}
                />
                {facebookAccount && (
                  <div className="flex items-center gap-2 py-1.5">
                    <Facebook className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={facebookAccount}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      View Facebook Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          {presentAddress?.fullAddress && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                {presentAddress.fullAddress}
              </p>
            </div>
          )}

          {/* Skills */}
          {talentSkills?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Award className="w-4 h-4" />
                Skills & Talents
              </h3>
              <div className="flex flex-wrap gap-2">
                {talentSkills.map((talent, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    {talent.skill} · {talent.level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Class Schedule */}
          {classSchedule?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Class Schedule
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Subject
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Place
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Day
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classSchedule.map((schedule, index) => (
                      <tr
                        key={schedule._id || index}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 text-slate-900">
                          {schedule.subject || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {schedule.place || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {schedule.day || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {schedule.time?.start && schedule.time?.end
                            ? `${schedule.time.start} - ${schedule.time.end}`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRevisionModal && (
        <Modal onClose={() => setShowRevisionModal(false)}>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Send for Revision
          </h2>
          <textarea
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Enter revision notes..."
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
            rows="4"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRevisionModal(false)}
              className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                submitUpdate({ status: "Revision from the Adviser" })
              }
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium"
            >
              Send Revision
            </button>
          </div>
        </Modal>
      )}

      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Approve Proposal
          </h2>
          <p className="text-slate-600 mb-6">
            Are you sure you want to approve this proposal?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowApproveModal(false)}
              className="px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                submitUpdate({ status: "Approved by the Adviser" })
              }
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
            >
              Approve
            </button>
          </div>
        </Modal>
      )}

      {/* Success/Error Popup */}
      {popup.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              popup.type === "success" ? "bg-emerald-600" : "bg-red-600"
            } text-white`}
          >
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm text-slate-900 font-medium">{value || "N/A"}</span>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      {children}
    </div>
  </div>
);
