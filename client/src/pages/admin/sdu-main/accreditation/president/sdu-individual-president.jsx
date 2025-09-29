import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../../App";
import { AlertTriangle, X } from "lucide-react";
import {
  ApprovePresidentProfile,
  RevisePresidentProfile,
} from "./sdu-update-status-president";
import { SduHistoryPresidents } from "./sdu-history-president";
import { EmailModal } from "../../../../../components/accreditation-email";

export function SduMainIndividualOrganizationPresident({ selectedOrg }) {
  const [presidentData, setPresidentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [noPresidentFound, setNoPresidentFound] = useState(false);
  const [showPopup, setShowPopup] = useState({
    show: false,
    type: "",
    member: null,
  });

  const [isManagePresidentProfileOpen, setManagePresidentProfileOpen] =
    useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setPresidentData(null);
    setNoPresidentFound(false);

    if (!selectedOrg?.orgPresident) {
      setNoPresidentFound(true);
      return;
    }

    const fetchPresident = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${API_ROUTER}/getPresident/${selectedOrg.orgPresident}`
        );

        console.log(res);
        setPresidentData(res.data);
      } catch (error) {
        console.error("Failed to fetch president data", error);
        setNoPresidentFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresident();
  }, [selectedOrg]);

  const handleButtonClick = (action) => {
    console.log("Button clicked:", action);
    setShowPopup({ show: true, type: action });
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading president data...</p>;
  }

  if (noPresidentFound) {
    return (
      <>
        <div className="bg-white p-4 h-full rounded-xl shadow-xl">
          <div className="border-4 flex flex-col items-center justify-center text-center h-full rounded-2xl border-dashed border-yellow-500 hover:bg-amber-500/50 transition-all duration-300">
            <div className="rounded-full p-6 h-fit w-fit bg-yellow-200 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle size={48} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              No Current President Found
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              [ President Profile ] is not detected for this organization.
              Notify Organization
            </p>
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-300 font-medium"
            >
              Notify Organization
            </button>
          </div>
        </div>

        <EmailModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title="Notify Organization - Missing President Profile"
          description="Send an email to notify the organization about the missing president profile."
          sendButtonLabel="Send Notification"
          Subject="Missing President Profile Notification"
          orgData={selectedOrg}
          user={{
            name: "SDU Admin", // Replace with actual user name
            position: "SDU Administrator", // Replace with actual user position
          }}
          onSuccess={() => {
            console.log("Email sent successfully");
            setShowEmailModal(false);
          }}
          onError={(err) => {
            console.error("Failed to send email:", err);
          }}
        />
      </>
    );
  }

  if (!presidentData) {
    return null;
  }

  const {
    name,
    profilePicture,
    department,
    course,
    year,
    age,
    sex,
    religion,
    nationality,
    birthplace,
    presentAddress,
    parentGuardian,
    sourceOfFinancialSupport,
    talentSkills,
    contactNo,
    overAllStatus,
    addressPhoneNo,
    facebookAccount,
    classSchedule,
  } = presidentData;

  return (
    <div className="p-6 bg-white m-4 mt-0 rounded-xl shadow-xl">
      <div className="border-b pb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Organization President
        </h2>

        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            onClick={() => setManagePresidentProfileOpen((prev) => !prev)}
            className={`px-4 py-2 bg-cnsc-primary-color w-48 text-white transition-colors hover:bg-cnsc-primary-color-dark ${
              isManagePresidentProfileOpen ? "rounded-t-lg" : "rounded-lg"
            }`}
          >
            Manage President Profile
          </button>

          {isManagePresidentProfileOpen && (
            <div className="absolute right-0 w-48 bg-white border rounded-b-lg shadow-lg z-10">
              <button
                onClick={() => handleButtonClick("approve")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleButtonClick("notes")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Revision Notes
              </button>
              <button
                onClick={() => handleButtonClick("history")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                View Previous Presidents
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex mt-2 mb-4 items-center p-4 gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden">
          {profilePicture ? (
            <img
              src={`${DOCU_API_ROUTER}/${selectedOrg._id}/${profilePicture}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover border"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-cnsc-primary-color">
            {name}
          </h3>
          <p className="text-gray-600">{department}</p>
          <p className="text-gray-600">
            {course} • {year}
          </p>
          <h3 className="text-cnsc-primary-color">Status: {overAllStatus}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
        <div>
          <h4 className="text-lg text-cnsc-primary-color font-bold">
            Personal Information
          </h4>
          <p>
            <strong>Age:</strong> {age}
          </p>
          <p>
            <strong>Sex:</strong> {sex}
          </p>
          <p>
            <strong>Religion:</strong> {religion}
          </p>
          <p>
            <strong>Nationality:</strong> {nationality}
          </p>
          <p>
            <strong>Birthplace:</strong> {birthplace || "N/A"}
          </p>
        </div>

        <div>
          <h4 className="text-lg text-cnsc-primary-color font-bold">Address</h4>
          <p>
            <strong>Present:</strong> {presentAddress?.fullAddress || "N/A"}
          </p>
          <p>
            <strong>Contact No.:</strong> {contactNo || "N/A"}
          </p>
          <p>
            <strong>Landline:</strong> {addressPhoneNo || "N/A"}
          </p>
        </div>

        <div>
          <h4 className="text-lg text-cnsc-primary-color font-bold">
            Family / Support
          </h4>
          <p>
            <strong>Parent/Guardian:</strong> {parentGuardian || "N/A"}
          </p>
          <p>
            <strong>Financial Support:</strong>{" "}
            {sourceOfFinancialSupport || "N/A"}
          </p>
        </div>

        <div>
          <h4 className="text-lg text-cnsc-primary-color font-bold">
            Social & Skills
          </h4>
          <p>
            <strong className="text-lg text-cnsc-primary-color font-bold">
              Facebook:
            </strong>{" "}
            {facebookAccount ? (
              <a
                href={facebookAccount}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {facebookAccount}
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <div className="flex flex-wrap">
            <strong className="text-lg text-cnsc-primary-color font-bold">
              Skills:
            </strong>
            <ul className="list-disc ml-5">
              {talentSkills?.length > 0 ? (
                talentSkills.map((skillObj, idx) => (
                  <li key={idx}>
                    {skillObj.skill} ({skillObj.level})
                  </li>
                ))
              ) : (
                <li>No skills listed</li>
              )}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-lg text-cnsc-primary-color font-bold mb-2">
            Class Schedule
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Subject</th>
                  <th className="px-4 py-2 border">Place</th>
                  <th className="px-4 py-2 border">Time Start</th>
                  <th className="px-4 py-2 border">Time End</th>
                  <th className="px-4 py-2 border">Day</th>
                </tr>
              </thead>
              <tbody>
                {classSchedule?.length > 0 ? (
                  classSchedule.map((sched, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 border">{sched.subject}</td>
                      <td className="px-4 py-2 border">{sched.place}</td>
                      <td className="px-4 py-2 border">{sched.time.start}</td>
                      <td className="px-4 py-2 border">{sched.time.end}</td>
                      <td className="px-4 py-2 border">{sched.day}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 border text-center">
                      No schedule available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPopup.show && (
        <div className="absolute top-0 left-0 z-11 w-full h-full flex bg-black/20 items-center justify-center">
          <div className="relative h-fit w-fit px-12 py-6 bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Manage President Profile
            </h3>
            <X
              size={20}
              onClick={() =>
                setShowPopup({ show: false, type: "", member: null })
              }
              className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            />

            {showPopup.type === "approve" && (
              <ApprovePresidentProfile
                presidentData={presidentData}
                setShowPopup={setShowPopup}
              />
            )}

            {showPopup.type === "notes" && (
              <RevisePresidentProfile
                presidentData={presidentData}
                setShowPopup={setShowPopup}
              />
            )}
            {showPopup.type === "history" && (
              <SduHistoryPresidents orgId={selectedOrg.organization} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
