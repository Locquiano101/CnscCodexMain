import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Pencil,
  Trash,
  MessageCircle,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../App";
import { useNavigate } from "react-router-dom";

export default function AdviserHomePage({ orgData, accreditationData, user }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen space-y-6 p-6" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <header className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, Adviser {user.name}
        </h1>
        <div className="text-gray-600 text-right">
          <p className="font-medium">{orgData?.orgName}</p>
          <p className="text-sm">{orgData?.orgClass}</p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accreditation Status */}
        <div
          onClick={() => navigate("./accreditation")}
          className="lg:col-span-1 cursor-pointer"
        >
          <AccreditationComponent orgId={orgData._id} />
        </div>

        <div
          onClick={() => navigate("./proposal")}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 cursor-pointer"
        >
          <ProposalsComponent orgData={orgData} />
        </div>
      </div>

      {/* Posts Section */}
      <div
        onClick={() => navigate("./post")}
        className="rounded-lg shadow cursor-pointer"
      >
        <PostComponent orgData={orgData} />
      </div>
    </div>
  );
}

function AccreditationComponent({ orgId }) {
  const [accreditationData, setAccreditationData] = useState(null);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  const [customStatusMap, setCustomStatusMap] = useState({});
  const [loadingCustom, setLoadingCustom] = useState(true);

  useEffect(() => {
    const GetAccreditationInformation = async () => {
      if (!orgId) return;

      try {
        const response = await axios.get(
          `${API_ROUTER}/getAccreditationInfo/${orgId}`,
          { withCredentials: true }
        );
        setAccreditationData(response.data);

        if (response.data?.isActive === false) {
          setShowResetPopup(true);
        }
      } catch (err) {
        console.error("Error fetching accreditation info:", err);
      }
    };

    GetAccreditationInformation();
  }, [orgId]);

  // Fetch visible requirements and custom statuses
  useEffect(() => {
    let ignore = false;
    async function loadCustomRequirements() {
      setLoadingCustom(true);
      try {
        const { data } = await axios.get(`${API_ROUTER}/accreditation/requirements/visible`, { withCredentials: true });
        if (!ignore) setVisibleRequirements(Array.isArray(data) ? data : []);
        const customs = (Array.isArray(data) ? data : []).filter((r) => r.type === 'custom');
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
    loadCustomRequirements();
    return () => { ignore = true; };
  }, [orgId]);

  if (!accreditationData) return null;

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
  const progressPercentage =
    (completedRequirements / requirements.length) * 100;

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (["approved", "submitted", "active"].includes(statusLower)) {
      return "text-emerald-700 bg-emerald-50";
    }
    if (statusLower === "deanapproved") {
      return "text-indigo-700 bg-indigo-50";
    }
    if (statusLower === "adviserapproved") {
      return "text-blue-700 bg-blue-50";
    }
    if (statusLower === "revisionrequested") {
      return "text-orange-700 bg-orange-50";
    }
    if (statusLower === "pending") {
      return "text-amber-700 bg-amber-50";
    }
    if (statusLower === "rejected") {
      return "text-red-700 bg-red-50";
    }
    return "text-slate-700 bg-slate-100";
  };

  const getDisplayStatus = (status) => {
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
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    if (["approved", "submitted", "active", "deanapproved", "adviserapproved"].includes(statusLower)) {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (["pending", "revisionrequested"].includes(statusLower)) {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    if (statusLower === "rejected") {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-500" />;
  };

  const overallStatus = accreditationData?.overallStatus || "Pending";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Accreditation Status
        </h2>
        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          {overallStatus}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-700">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-slate-900">
            {completedRequirements}/{requirements.length} completed
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-right mt-2">
          <span className="text-sm text-slate-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
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
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-medium text-slate-800 text-sm">
                {req.name}
              </span>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusColor(
                req.status
              )}`}
            >
              {getStatusIcon(req.status)}
              <span>{getDisplayStatus(req.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalsComponent({ orgData }) {
  const [proposalsConduct, setProposalsConduct] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProposedPlanConduct = async () => {
    try {
      const { data } = await axios.get(
        `${API_ROUTER}/getStudentLeaderProposalConduct/${orgData._id}`,
        { withCredentials: true }
      );
      setProposalsConduct(data);
    } catch (err) {
      console.error("Error fetching proposals conduct:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposedPlanConduct();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Approved For Conduct": {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      },
      Pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
      },
      "Ready For Accomplishments": {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      },
      default: {
        bg: "bg-slate-100",
        text: "text-slate-800",
        dot: "bg-slate-500",
      },
    };

    const config = statusConfig[status] || statusConfig.default;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dot}`} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">
            Activity Proposals
          </h3>
          <div className="text-sm text-slate-600">
            {proposalsConduct.length} proposals
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-x-auto">
        {proposalsConduct.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-medium text-slate-800 mb-2">
              No proposals yet
            </h4>
            <p className="text-slate-600">
              Create your first proposal to get started with activities
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Budget
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Venue
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proposalsConduct.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 capitalize">
                      {item.ProposedIndividualActionPlan.activityTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(item.ProposedIndividualActionPlan.proposedDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(
                      item.ProposedIndividualActionPlan.budgetaryRequirements
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                    {item.ProposedIndividualActionPlan.venue}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.overallStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PostComponent({ orgData }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const response = await axios.get(
          `${API_ROUTER}/getOrgProfilePosts/${orgData._id}`,
          { withCredentials: true }
        );
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching public posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();
  }, [orgData._id]);

  const getFirstImage = (content, orgId) => {
    if (!content || content.length === 0) return null;
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const firstImage = content.find((item) =>
      imageExtensions.some((ext) => item.fileName.toLowerCase().includes(ext))
    );
    return firstImage
      ? `${DOCU_API_ROUTER}/${orgId}/${firstImage.fileName}`
      : null;
  };

  const parseTags = (tags) => {
    if (!tags || tags.length === 0) return [];
    try {
      const parsed = JSON.parse(tags[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Organization Updates
        </h2>
        <p className="text-slate-600">
          Stay updated with the latest posts and announcements
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-full bg-slate-50 rounded-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              No posts yet
            </h3>
            <p className="text-slate-600">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const imageUrl = getFirstImage(
              post.content,
              post.organizationProfile?._id
            );
            const tags = parseTags(post.tags);
            const hasContent = post.caption && post.caption.trim().length > 0;

            return (
              <div
                key={post._id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image/Content Preview */}
                {imageUrl && (
                  <div className="relative h-48 bg-slate-100">
                    <img
                      src={imageUrl}
                      alt={post.caption || "Post image"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-medium text-slate-800 line-clamp-2 leading-snug">
                    {hasContent ? post.caption : "Untitled Post"}
                  </h3>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          +{tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {post.organizationProfile?.orgAcronym?.[0] || "O"}
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {post.organizationProfile?.orgAcronym || "Organization"}
                      </span>
                    </div>
                    {post.createdAt && (
                      <span className="text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
