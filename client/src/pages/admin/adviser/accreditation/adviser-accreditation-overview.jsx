import { useState, useEffect } from "react";

import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Users,
  Building,
  Phone,
  MapPin,
  Award,
  Star,
  OrigamiIcon,
} from "lucide-react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import { FileText, Upload, Mail, X } from "lucide-react";

export function AdviserAccreditationMainComponent({ user, orgId }) {
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [accreditationData, setAccreditationData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for "reset popup"
  const [showResetPopup, setShowResetPopup] = useState(false);

  useEffect(() => {
    const GetAccreditationInformation = async () => {
      if (!orgId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${orgId}`,
          { withCredentials: true }
        );
        console.log(response);

        setAccreditationData(response.data);
      } catch (err) {
        console.error("Error fetching accreditation info:", err);
        setError("Failed to load accreditation information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    GetAccreditationInformation();
  }, [orgId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState error={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="h-full mt-4 overflow-auto">
      <div className="w-full">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-7 gap-2">
          <div className="lg:col-span-2 xl:col-span-3">
            <OverallStatus accreditationData={accreditationData} />
          </div>

          <div className="lg:col-span-2 ">
            <PresidentInformation accreditationData={accreditationData} />
          </div>

          <div className="col-span-2">
            <DocumentDisplayCard
              user={user}
              accreditationData={accreditationData}
              uploadingDocType={uploadingDocType}
              setUploadingDocType={setUploadingDocType}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          </div>

          <div className="lg:col-span-7">
            <RosterLists accreditationData={accreditationData} />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadingDocType && (
        <UploadDocument
          title={`Upload ${uploadingDocType.replace(/([A-Z])/g, " $1").trim()}`}
          onFileSelect={setSelectedFile}
          onSubmit={handleUploadSubmit}
          onCancel={() => {
            setUploadingDocType(null);
            setSelectedFile(null);
          }}
          buttonLabel="Upload"
          buttonClass="bg-blue-600 hover:bg-blue-700"
        />
      )}
    </div>
  );
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200  w-96 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200  w-64 animate-pulse"></div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Overall Status Skeleton */}
          <div className="lg:col-span-2 xl:col-span-3">
            <div className="bg-white  shadow-sm p-6">
              <div className="h-6 bg-gray-200  w-48 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200  w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200  w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200  w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* President Information Skeleton */}
          <div className="lg:col-span-1 xl:col-span-2">
            <div className="bg-white  shadow-sm p-6">
              <div className="h-6 bg-gray-200  w-40 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200  w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200  w-2/3 animate-pulse"></div>
                <div className="h-4 bg-gray-200  w-1/3 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* DocumentDisplayCard Skeleton */}
          <div className="lg:col-span-5 xl:col-span-2">
            <div className="bg-white  shadow-sm p-6">
              <div className="h-6 bg-gray-200  w-32 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-gray-200  p-4">
                    <div className="h-4 bg-gray-200  w-32 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200  w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organization Info Skeleton */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="bg-white  shadow-sm p-6">
              <div className="h-6 bg-gray-200  w-36 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200  w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200  w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Roster Lists Skeleton */}
          <div className="lg:col-span-2 xl:col-span-2">
            <div className="bg-white  shadow-sm p-6">
              <div className="h-6 bg-gray-200  w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 -full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200  w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }) {
  <div className="h-full bg-gray-50 p-6 overflow-auto">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Organization Accreditation
        </h1>
        <p className="text-gray-600">
          Manage and track your organization's accreditation status
        </p>
      </div>

      <div className="bg-white  shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 -full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Data
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent  shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>;
}

function OverallStatus({ accreditationData }) {
  const { overallStatus } = accreditationData;
  const requirements = [
    {
      name: "Joint Statement",
      status: accreditationData.JointStatement?.status || "Not Submitted",
    },
    {
      name: "Pledge Against Hazing",
      status: accreditationData.PledgeAgainstHazing?.status || "Not Submitted",
    },
    {
      name: "Constitution And By-Laws",
      status:
        accreditationData.ConstitutionAndByLaws?.status || "Not Submitted",
    },

    {
      name: "Roster Members",
      status: accreditationData.Roster?.overAllStatus || "Incomplete",
    },
    {
      name: "President Profile",
      status: accreditationData.PresidentProfile?.overAllStatus,
    },
    {
      name: "Finacial Report",
      status: accreditationData.FinancialReport?.isActive
        ? "Active"
        : "Inactive",
    },
  ];

  const completedRequirements = requirements.filter((req) =>
    ["approved", "submitted", "active"].includes(req.status?.toLowerCase())
  ).length;
  const progressPercentage =
    (completedRequirements / requirements.length) * 100;

  return (
    <div className="bg-white  border border-gray-400 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Accreditation Status
        </h2>
        <div
          className={`px-4 py-2 -full flex items-center gap-2 ${getStatusColor(
            overallStatus
          )}`}
        >
          {getStatusIcon(overallStatus)}
          <span className="font-medium">{overallStatus}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {completedRequirements}/{requirements.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 -full h-3">
          <div
            className="bg-blue-600 h-3 -full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requirements Checklist
        </h3>
        {requirements.map((req, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 "
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">{req.name}</span>
            </div>
            <div
              className={`px-3 py-1 -full text-sm flex items-center gap-2 ${getStatusColor(
                req.status
              )}`}
            >
              {getStatusIcon(req.status)}
              <span>{req.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PresidentInformation({ accreditationData }) {
  const president = accreditationData.PresidentProfile;

  if (!president) {
    return (
      <div className="bg-white  border border-gray-400 p-6 h-full">
        <h2 className="text-xl font-semibold mb-4">President Information</h2>
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No president profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  border border-gray-400 p-6 h-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        President Information
      </h2>

      <div className="space-y-4">
        {/* Profile Picture Placeholder */}
        <div className="flex justify-center mb-4">
          <div className="w-32 aspect-square -full  bg-gray-200  flex items-center justify-center">
            <img
              src={`${DOCU_API_ROUTER}/${president.organizationProfile}/${president.profilePicture}`}
              alt="President"
              className="w-full h-full -full"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {president.name}
          </h3>
          <p className="text-gray-600">{president.course}</p>
          <p className="text-gray-600">{president.year}</p>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{president.contactNo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {president.presentAddress.city},{" "}
              {president.presentAddress.province}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{president.department}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Skills & Talents
          </h4>
          <div className="space-y-2">
            {president.talentSkills.map((skill, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 "
              >
                <span className="text-sm font-medium">{skill.skill}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 -full">
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Support */}
        <div className="mt-4 p-3 bg-green-50 ">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Financial Support: {president.sourceOfFinancialSupport}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentDisplayCard({ user, accreditationData }) {
  const { JointStatement, PledgeAgainstHazing, ConstitutionAndByLaws } =
    accreditationData;
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState(null);
  const [emailData, setEmailData] = useState({
    to: accreditationData.organizationProfile.orgName,
    orgName: accreditationData.organizationProfile.orgName,
    inquirySubject: "",
    orgId: accreditationData.organizationProfile._id,
    inquiryText: "",
    userPosition: user.Adviser,
    userName: user.name,
  });
  const openEmailModal = (key, label, docId) => {
    setEmailType(label);
    setEmailData({
      to: accreditationData.organizationProfile.orgName,
      orgName: accreditationData.organizationProfile.orgName,
      inquirySubject: `Regarding ${label}`,
      orgId: accreditationData.organizationProfile._id,
      inquiryText: "",
      userPosition: user.position,
      userName: user.name,
    });
    console.log(emailData);
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    console.log("📨 Sending email:", emailData);

    try {
      const response = await axios.post(
        `${API_ROUTER}/accreditationEmailInquiry`,
        emailData
      );
      console.log(response.data);
      setShowEmailModal(false);
    } catch (err) {
      console.error("Failed to fetch roster members:", err);
    }
  };

  const renderDocumentCard = (label, doc, key) => {
    if (doc && doc.fileName) {
      return (
        <div className="border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors">
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900">{label}</h3>
              <p
                className="text-sm text-gray-500 truncate"
                title={doc.fileName}
              >
                {doc.fileName}
              </p>
              <p className="text-xs text-gray-400">
                Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
              </p>

              {/* Status Footer */}
              <div
                className={`mt-3 w-fit px-3 py-1 rounded-md text-xs flex ml-18 gap-1 bg-gray-100 text-gray-600`}
              >
                {getStatusIcon(doc.status)}
                <span>{doc.status}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => openEmailModal(key, label, doc?._id)}
        className="border-2 border-dashed border-gray-300 p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <div className="text-center">
          <Mail className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">Email about {label}</p>
          <p className="text-sm text-gray-500">Click to compose</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex  flex-col  w-full  bg-white  border border-gray-400 p-6 h-full">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Required DocumentDisplayCard
      </h2>
      <div className="space-y-4">
        {renderDocumentCard(
          "Joint Statement",
          JointStatement,
          "JointStatement"
        )}
        {renderDocumentCard(
          "Constitution and By-Laws",
          ConstitutionAndByLaws,
          "ConstitutionAndByLaws"
        )}
        {renderDocumentCard(
          "Pledge Against Hazing",
          PledgeAgainstHazing,
          "PledgeAgainstHazing"
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmailModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Compose Email – {emailType}
            </h3>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="To"
                className="w-full border rounded px-3 py-2 text-sm"
                value={emailData.to}
                onChange={(e) =>
                  setEmailData({ ...emailData, to: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full border rounded px-3 py-2 text-sm"
                value={emailData.inquirySubject}
                onChange={(e) =>
                  setEmailData({ ...emailData, inquirySubject: e.target.value })
                }
              />
              <textarea
                placeholder="Message"
                rows={5}
                className="w-full border rounded px-3 py-2 text-sm"
                value={emailData.inquiryText}
                onChange={(e) =>
                  setEmailData({ ...emailData, inquiryText: e.target.value })
                }
              ></textarea>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSendEmail}
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RosterLists({ accreditationData }) {
  const [rosterData, setRosterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRosterMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ROUTER}/getRosterMembers/${accreditationData.organizationProfile._id}`
      );
      setRosterData(response.data.rosterMembers || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch roster members:", err);
      setError("Failed to load roster members");
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (accreditationData?.organizationProfile?._id) {
      fetchRosterMembers();
    }
  }, [accreditationData]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 rounded-full";
      case "inactive":
        return "bg-red-100 text-red-800 rounded-full";
      default:
        return "bg-gray-100 text-gray-800 rounded-full";
    }
  };
  return (
    <div className="bg-white border border-gray-400 p-6 h-full">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Organization Roster
      </h2>

      {loading ? (
        <p>Loading roster...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : rosterData.length > 0 ? (
        <div className="space-y-4">
          {rosterData.map((member) => (
            <div
              key={member._id}
              className="flex items-center justify-between p-4 bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <img
                    src={
                      member.profilePicture
                        ? `${DOCU_API_ROUTER}/${accreditationData.organizationProfile._id}/${member.profilePicture}`
                        : "/cnsc-logo.png"
                    }
                    alt="Profile Picture"
                    className="max-h-32 aspect-square border object-cover rounded"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">
                    {member.position} • {member.year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs ${getStatusColor(
                    member.status
                  )}`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Roster Submitted
          </h3>
          <p className="text-gray-500 mb-4">
            Upload your organization roster to continue with accreditation
          </p>
          <a
            href="./accreditation/roster-of-members"
            className="bg-yellow-500 text-white px-6 py-2 hover:bg-blue-700 transition-colors"
          >
            Notify organization
          </a>
        </div>
      )}
    </div>
  );
}

function UploadDocument({
  title = "Upload a Document",
  buttonLabel = "Submit",
  buttonClass = "bg-blue-600 hover:bg-blue-700",
  onFileSelect,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="absolute inset-0 h-full flex items-center justify-center 1w-full bg-black/50 backdrop-blur-sm">
      <div className=" bg-white min-w-xl mx-auto p-6 border border-gray-300 -xl">
        <h3 className="text-lg font-medium">{title}</h3>
        <DocumentUploader onFileSelect={onFileSelect} title={title} />

        <div className="flex justify-end mt-4 gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-5 py-2  hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className={`${buttonClass} text-white px-6 py-2  transition-colors font-medium`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "text-green-600 bg-green-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "rejected":
      return "text-red-600 bg-red-50";
    case "submitted":
      return "text-blue-600 bg-blue-50";
    case "active":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "rejected":
      return <AlertCircle className="w-4 h-4" />;
    case "submitted":
      return <CheckCircle className="w-4 h-4" />;
    case "active":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}
