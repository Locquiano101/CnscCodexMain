/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";

import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
} from "lucide-react";
import axios from "axios";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import DocumentUploader from "../../../../components/document_uploader";

export default function StudentAccreditationMainComponent({ orgId }) {
  console.log("🎯 StudentAccreditationMainComponent mounted with orgId:", orgId);
  const [accreditationData, setAccreditationData] = useState(null);
  const [visibleRequirements, setVisibleRequirements] = useState([]); // enabled templates + custom
  const [customStatusMap, setCustomStatusMap] = useState({}); // { key: status }
  const [loadingCustom, setLoadingCustom] = useState(true); // track custom requirements loading
  const [uploadingDocType, setUploadingDocType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

        console.log(response.data);
        setAccreditationData(response.data);

        // If inactive → show reset popup
        if (response.data?.isActive === false) {
          setShowResetPopup(true);
        }
      } catch (err) {
        console.error("Error fetching accreditation info:", err);
        setError("Failed to load accreditation information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    GetAccreditationInformation();
  }, [orgId]);

  // Load visible requirements and current student's submission statuses for custom ones
  useEffect(() => {
    console.log("🚀 Starting to load visible requirements, orgId:", orgId);
    let ignore = false;
    async function loadVisibleAndStatuses() {
      setLoadingCustom(true);
      try {
        console.log("🌐 Fetching from:", `${API_ROUTER}/accreditation/requirements/visible`);
        const { data } = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        console.log("📋 Visible requirements fetched:", data);
        if (!ignore) setVisibleRequirements(Array.isArray(data) ? data : []);
        const customs = (Array.isArray(data) ? data : []).filter((r) => r.type === 'custom');
        console.log("🔧 Custom requirements found:", customs);
        if (!orgId || customs.length === 0) {
          console.log("⚠️ No orgId or no custom requirements, skipping submission fetch");
          if (!ignore) setLoadingCustom(false);
          return;
        }
        const results = await Promise.all(
          customs.map(async (r) => {
            try {
              const { data: sub } = await axios.get(`${API_ROUTER}/accreditation/requirements/${r.key}/submission/${orgId}`, { withCredentials: true });
              console.log(`✅ Submission for ${r.key}:`, sub);
              return { key: r.key, status: sub?.submission?.status || 'Not Submitted' };
            } catch (e) {
              console.warn(`❌ Failed to fetch submission for ${r.key}:`, e.message);
              return { key: r.key, status: 'Not Submitted' };
            }
          })
        );
        if (!ignore) {
          const map = {};
          results.forEach(({ key, status }) => { map[key] = status; });
          console.log("🗺️ Custom status map:", map);
          setCustomStatusMap(map);
        }
      } catch (err) {
        console.error("❌ Failed to load visible requirements:", err);
        if (!ignore) {
          setVisibleRequirements([]);
        }
      } finally {
        if (!ignore) setLoadingCustom(false);
      }
    }
    loadVisibleAndStatuses();
    return () => { ignore = true; };
  }, [orgId]);

  // Create new accreditation for this org
  const handleCreateNewAccreditation = async () => {
    try {
      const res = await axios.get(
        `${API_ROUTER}/getAccreditationInfo/${orgId}`,
        { withCredentials: true }
      );

      console.log("New accreditation created:", res.data);
      setAccreditationData(res.data);
      setShowResetPopup(false);
    } catch (err) {
      console.error("Error creating new accreditation:", err);
      alert("Failed to create new accreditation.");
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !uploadingDocType) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append(
      "organizationProfile",
      accreditationData.organizationProfile._id
    );
    formData.append(
      "organization",
      accreditationData.organizationProfile.organization
    );
    formData.append("file", selectedFile);
    formData.append("accreditationId", accreditationData._id);
    formData.append("docType", uploadingDocType);

    let progressInterval;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await axios.post(
        `${API_ROUTER}/addAccreditationDocument`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload success:", response.data);
      setUploadProgress(100);

      setAccreditationData((prev) => ({
        ...prev,
        [uploadingDocType]: {
          fileName: selectedFile.name,
          status: "Pending",
          createdAt: new Date().toISOString(),
        },
      }));

      setTimeout(() => {
        setUploadingDocType(null);
        setSelectedFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-7 gap-1">
          <div className="lg:col-span-2 xl:col-span-3 p-1">
            <OverallStatus
              accreditationData={accreditationData}
              visibleRequirements={visibleRequirements}
              customStatusMap={customStatusMap}
              loadingCustom={loadingCustom}
            />
          </div>

          <div className="lg:col-span-2 p-1 ">
            <PresidentInformation accreditationData={accreditationData} />
          </div>

          <div className="col-span-2 p-1">
            <DocumentDisplayCard
              accreditationData={accreditationData}
              uploadingDocType={uploadingDocType}
              setUploadingDocType={setUploadingDocType}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleUploadSubmit={handleUploadSubmit}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
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

      {/* Reset Accreditation Popup */}
      {showResetPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Accreditation Reset
            </h2>
            <p className="text-gray-600 mb-6">
              The accreditation records for this organization have been
              deactivated. To proceed, you need to create a new accreditation.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={handleCreateNewAccreditation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create New Accreditation
              </button>
            </div>
          </div>
        </div>
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

function OverallStatus({ accreditationData, visibleRequirements = [], customStatusMap = {}, loadingCustom = false }) {
  const { overallStatus } = accreditationData ?? {};
  
  console.log("📊 OverallStatus received:", {
    visibleRequirements,
    customStatusMap,
    loadingCustom,
    accreditationData
  });

  // Determine which template requirements are enabled (by key)
  const enabledTemplateKeys = new Set(
    (visibleRequirements || [])
      .filter((r) => r.type === "template")
      .map((r) => r.key)
  );

  console.log("🔑 Enabled template keys:", Array.from(enabledTemplateKeys));

  const requirements = [];
  // Only include document trio if template 'accreditation-documents' is enabled
  if (enabledTemplateKeys.size === 0 || enabledTemplateKeys.has("accreditation-documents")) {
    requirements.push(
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
      }
    );
  }
  // Roster
  if (enabledTemplateKeys.size === 0 || enabledTemplateKeys.has("roster")) {
    requirements.push({
      name: "Roster Members",
      status: accreditationData.Roster?.overAllStatus || "Incomplete",
    });
  }
  // President profile
  if (enabledTemplateKeys.size === 0 || enabledTemplateKeys.has("president-info")) {
    requirements.push({
      name: "President Profile",
      status: accreditationData.PresidentProfile?.overAllStatus || "Not Submitted",
    });
  }
  // Financial Report
  if (enabledTemplateKeys.size === 0 || enabledTemplateKeys.has("financial-report")) {
    requirements.push({
      name: "Finacial Report",
      status: accreditationData.FinancialReport?.isActive ? "Active" : "Inactive",
    });
  }

  // Append custom requirements (enabled ones only)
  const customVisible = (visibleRequirements || []).filter((r) => r.type === "custom");
  console.log("🎨 Custom visible requirements to add:", customVisible);
  for (const req of customVisible) {
    requirements.push({
      name: req.title,
      status: customStatusMap[req.key] || "Not Submitted",
    });
  }

  console.log("📝 Final requirements list:", requirements);

  const completedRequirements = requirements.filter((req) => {
    const s = (req.status || "").toLowerCase();
    return s === "approved" || s === "submitted" || s === "active";
  }).length;
  const progressPercentage =
    (completedRequirements / requirements.length) * 100;

  return (
    <div className="bg-white  border shadow-2xl border-gray-200 p-6 h-full rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Accreditation Status
        </h2>
        <div className={`px-4 py-2 -full flex items-center gap-2 `}>
          <span className="font-medium">{overallStatus || "N/A"}</span>
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
        {requirements.map((req, index) => {
          const displayStatus = getDisplayStatus(req.status);
          const statusColor = getStatusColor(req.status);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{req.name}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${statusColor}`}>
                {getStatusIcon(req.status)}
                <span>{displayStatus}</span>
              </div>
            </div>
          );
        })}
        {loadingCustom && (
          <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Loading custom requirements...
          </div>
        )}
      </div>
    </div>
  );
}

function PresidentInformation({ accreditationData }) {
  const president = accreditationData.PresidentProfile;

  if (!president) {
    return (
      <div className="bg-white  border border-gray-200 p-6 h-full rounded-2xl">
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

function DocumentDisplayCard({ accreditationData }) {
  const { JointStatement, PledgeAgainstHazing, ConstitutionAndByLaws } =
    accreditationData;

  const renderDocumentCard = (label, doc) => {
    if (doc && doc.fileName) {
      return (
        <div className="flex flex-col  gap-4 border-2 border-gray-200 bg-white shadow-md p-4 justify-between rounded-2xl">
          <div className="flex items-center gap-3">
            <FileText className="min-w-8 min-h-8 text-blue-600" />
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
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <div
              className={`px-2 py-1 -full text-xs flex items-center gap-1 ${getStatusColor(
                doc.status
              )}`}
            >
              {getStatusIcon(doc.status)}
              <span>{doc.status}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <a
        href="./accreditation/documents"
        className="border-2 border-dashed border-gray-300 p-8 bg-gray-50 cursor-pointer"
      >
        <div className="text-center">
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">{label} Placeholder</p>
          <p className="text-sm text-gray-500">No file uploaded</p>
        </div>
      </a>
    );
  };

  return (
    <div className="flex  flex-col  w-full  bg-white  border border-gray-200 p-6 h-full rounded-2xl">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Required Documents
      </h2>

      <div className="flex  flex-col space-y-4">
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
    </div>
  );
}

function RosterLists({ accreditationData }) {
  const [rosterData, setRosterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRosterMembers = useCallback(async () => {
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
  }, [accreditationData?.organizationProfile?._id]);

  useEffect(() => {
    if (accreditationData?.organizationProfile?._id) {
      fetchRosterMembers();
    }
  }, [accreditationData, fetchRosterMembers]);

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
    <div className="bg-white border border-gray-200 p-6 h-full rounded-2xl">
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
            className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors"
          >
            Upload Roster
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
    case "deanapproved":
      return "text-indigo-700 bg-indigo-50";
    case "adviserapproved":
      return "text-blue-700 bg-blue-50";
    case "revisionrequested":
      return "text-orange-700 bg-orange-50";
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

function getDisplayStatus(status) {
  const statusMap = {
    "DeanApproved": "Approved by the Dean",
    "AdviserApproved": "Approved by the Adviser",
    "RevisionRequested": "Revision Requested",
    "Not Submitted": "Not Submitted",
    "Incomplete": "Incomplete",
    "Approved": "Approved",
    "Pending": "Pending",
    "Rejected": "Rejected",
    "Submitted": "Submitted",
    "Active": "Active",
    "Inactive": "Inactive"
  };
  return statusMap[status] || status;
}

function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "deanapproved":
      return <CheckCircle className="w-4 h-4" />;
    case "adviserapproved":
      return <CheckCircle className="w-4 h-4" />;
    case "revisionrequested":
      return <AlertCircle className="w-4 h-4" />;
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
