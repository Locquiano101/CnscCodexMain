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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="h-full p-6 overflow-auto" style={{ backgroundColor: '#F5F5F9' }}>
      <div className="w-full">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-7 gap-6">
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
    <div className="h-full p-6 overflow-auto" style={{ backgroundColor: '#F5F5F9' }}>
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
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 w-48 mb-4 animate-pulse rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 w-full animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* President Information Skeleton */}
          <div className="lg:col-span-1 xl:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 w-40 mb-4 animate-pulse rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 w-full animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 w-2/3 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/3 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DocumentDisplayCard Skeleton */}
          <div className="lg:col-span-5 xl:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 w-32 mb-4 animate-pulse rounded"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-gray-200 rounded p-4">
                      <div className="h-4 bg-gray-200 w-32 mb-2 animate-pulse rounded"></div>
                      <div className="h-3 bg-gray-200 w-24 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organization Info Skeleton */}
          <div className="lg:col-span-1 xl:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 w-36 mb-4 animate-pulse rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 w-full animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roster Lists Skeleton */}
          <div className="lg:col-span-2 xl:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 w-32 mb-4 animate-pulse rounded"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 w-3/4 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  const [customStatusMap, setCustomStatusMap] = useState({});
  const [loadingCustom, setLoadingCustom] = useState(true);

  // Fetch visible requirements and custom statuses
  useEffect(() => {
    let ignore = false;
    async function loadCustomRequirements() {
      setLoadingCustom(true);
      try {
        const { data } = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (!ignore) setVisibleRequirements(Array.isArray(data) ? data : []);
        const customs = (Array.isArray(data) ? data : []).filter((r) => r.type === 'custom');
        const orgId = accreditationData.organizationProfile?._id;
        if (!orgId || customs.length === 0) {
          if (!ignore) setLoadingCustom(false);
          return;
        }
        const results = await Promise.all(
          customs.map(async (r) => {
            try {
              const { data: sub } = await axios.get(`${API_ROUTER}/accreditation/requirements/${r.key}/submission/${orgId}`, { withCredentials: true });
              return { key: r.key, status: sub?.submission?.status || 'Not Submitted' };
            } catch (e) {
              return { key: r.key, status: 'Not Submitted' };
            }
          })
        );
        if (!ignore) {
          const map = {};
          results.forEach(({ key, status }) => { map[key] = status; });
          setCustomStatusMap(map);
        }
      } catch (err) {
        console.error("Failed to load custom requirements:", err);
        if (!ignore) setVisibleRequirements([]);
      } finally {
        if (!ignore) setLoadingCustom(false);
      }
    }
    if (accreditationData?.organizationProfile?._id) {
      loadCustomRequirements();
    }
    return () => { ignore = true; };
  }, [accreditationData]);

  // Determine which template requirements are enabled
  const enabledTemplateKeys = new Set(
    (visibleRequirements || [])
      .filter((r) => r.type === "template")
      .map((r) => r.key)
  );

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
      status:
        accreditationData.PresidentProfile?.overAllStatus || "Not Submitted",
    });
  }
  // Financial Report
  if (enabledTemplateKeys.size === 0 || enabledTemplateKeys.has("financial-report")) {
    requirements.push({
      name: "Financial Report",
      status: accreditationData.FinancialReport?.isActive
        ? "Active"
        : "Inactive",
    });
  }

  // Append custom requirements
  const customVisible = (visibleRequirements || []).filter((r) => r.type === "custom");
  for (const req of customVisible) {
    requirements.push({
      name: req.title,
      status: customStatusMap[req.key] || "Not Submitted",
    });
  }

  const completedRequirements = requirements.filter((req) => {
    const s = (req.status || "").toLowerCase();
    return s === "approved" || s === "submitted" || s === "active";
  }).length;
  const progressPercentage = requirements.length > 0
    ? (completedRequirements / requirements.length) * 100
    : 0;

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Accreditation Status
          </h2>
          <div
            className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(
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
        {loadingCustom && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
            <div className="animate-spin">⏳</div>
            <span>Loading custom requirements...</span>
          </div>
        )}
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
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusColor(
                req.status
              )}`}
            >
              {getStatusIcon(req.status)}
              <span>{getDisplayStatus(req.status)}</span>
            </div>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

function PresidentInformation({ accreditationData }) {
  const president = accreditationData.PresidentProfile;

  if (!president) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">President Information</h2>
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No president profile found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          President Information
        </h2>

        <div className="space-y-4">
          {/* Profile Picture Placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-32 aspect-square rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={`${DOCU_API_ROUTER}/${president.organizationProfile}/${president.profilePicture}`}
                alt="President"
                className="w-full h-full object-cover"
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
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-medium">{skill.skill}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Support */}
          <div className="mt-4 p-3 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Financial Support: {president.sourceOfFinancialSupport}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="flex flex-col w-full h-full">
      <CardContent className="p-6">
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
      </CardContent>

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Email – {emailType}</DialogTitle>
            <DialogDescription>
              Send an email regarding this accreditation section.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="recipient@example.com"
                value={emailData.to}
                onChange={(e) =>
                  setEmailData({ ...emailData, to: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                type="text"
                placeholder="Email subject"
                value={emailData.inquirySubject}
                onChange={(e) =>
                  setEmailData({ ...emailData, inquirySubject: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Type your message here..."
                rows={5}
                value={emailData.inquiryText}
                onChange={(e) =>
                  setEmailData({ ...emailData, inquiryText: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
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
    <Card className="h-full">
      <CardContent className="p-6">
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
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Notify organization
          </a>
        </div>
      )}
      </CardContent>
    </Card>
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
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Select and upload your document below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DocumentUploader onFileSelect={onFileSelect} title={title} />
        </div>

        <DialogFooter>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onSubmit} className={buttonClass}>
            {buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "text-green-600 bg-green-50";
    case "advicerapproved":
      return "text-blue-500 bg-blue-50";
    case "deanapproved":
      return "text-indigo-600 bg-indigo-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "rejected":
      return "text-red-600 bg-red-50";
    case "revisionrequested":
      return "text-orange-600 bg-orange-50";
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
    Pending: "Pending",
    AdviserApproved: "Approved by the Adviser",
    DeanApproved: "Approved by the Dean",
    Approved: "Fully Approved",
    RevisionRequested: "Revision Requested",
    Rejected: "Rejected",
    Submitted: "Submitted",
    Active: "Active",
    Incomplete: "Incomplete",
    "Not Submitted": "Not Submitted",
    Inactive: "Inactive",
  };
  return statusMap[status] || status;
}

function getStatusIcon(status) {
  switch (status?.toLowerCase()) {
    case "approved":
    case "advicerapproved":
    case "deanapproved":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "rejected":
    case "revisionrequested":
      return <AlertCircle className="w-4 h-4" />;
    case "submitted":
      return <CheckCircle className="w-4 h-4" />;
    case "active":
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}
