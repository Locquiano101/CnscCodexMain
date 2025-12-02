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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StudentHomePage({ orgData, accreditationData }) {
  return (
    <div className="h-full overflow-auto space-y-6 p-6" style={{ backgroundColor: '#F5F5F9' }}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Welcome, Student!</CardTitle>
              <CardDescription className="mt-1">Manage your organization's activities</CardDescription>
            </div>
            <div className="text-right">
              <p className="font-medium">{orgData?.orgName}</p>
              <p className="text-sm text-muted-foreground">{orgData?.orgClass}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accreditation Status */}
        <div className="lg:col-span-1">
          <AccreditationComponent accreditationData={accreditationData} />
        </div>

        <div className="lg:col-span-2">
          <ProposalsComponent orgData={orgData} />
        </div>
      </div>

      {/* Posts Section */}
      <PostComponent orgData={orgData} />
    </div>
  );
}

function AccreditationComponent({ accreditationData }) {
  const { overallStatus } = accreditationData;
  const [visibleRequirements, setVisibleRequirements] = useState([]);
  const [customStatusMap, setCustomStatusMap] = useState({});
  const [loadingCustom, setLoadingCustom] = useState(true);
  const orgId = accreditationData?.organizationProfile?._id;

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

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Accreditation Status</CardTitle>
          <Badge variant="secondary">{overallStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-foreground">
              {completedRequirements}/{requirements.length} completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-right mt-2">
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            Requirements Checklist
          </h3>
          {requirements.map((req, index) => {
            const displayStatus = getDisplayStatus(req.status);
            const badgeVariant = 
              req.status === "Approved" || req.status === "Submitted" || req.status === "Active" ? "approved" :
              req.status === "Pending" ? "pending" :
              req.status === "Rejected" || req.status === "For Revision" ? "rejected" :
              "default";
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {req.name}
                  </span>
                </div>
                <Badge variant={badgeVariant} className="gap-1.5">
                  {getStatusIcon(req.status)}
                  <span>{displayStatus}</span>
                </Badge>
              </div>
            );
          })}
          {loadingCustom && (
            <div className="flex items-center justify-center p-3 bg-secondary/10 rounded-lg text-sm text-secondary">
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Loading custom requirements...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
    const statusMap = {
      "Approved For Conduct": "approved",
      "Pending": "pending",
      "Ready For Accomplishments": "secondary",
    };
    return statusMap[status] || "default";
  };

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Proposals</CardTitle>
          <Badge variant="outline">{proposalsConduct.length} proposals</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {proposalsConduct.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium mb-2">
              No proposals yet
            </h4>
            <p className="text-sm text-muted-foreground">
              Create your first proposal to get started with activities
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">₱</span>
                      Budget
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Venue
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {proposalsConduct.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium capitalize">
                        {item.ProposedIndividualActionPlan.activityTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(item.ProposedIndividualActionPlan.proposedDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(
                        item.ProposedIndividualActionPlan.budgetaryRequirements
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                      {item.ProposedIndividualActionPlan.venue}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadge(item.overallStatus)} className="text-white whitespace-nowrap">
                        {item.overallStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
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
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Organization Updates</CardTitle>
        <CardDescription>
          Stay updated with the latest posts and announcements
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.length === 0 ? (
            <div className="col-span-full bg-muted rounded-lg p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted-foreground/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                No posts yet
              </h3>
              <p className="text-sm text-muted-foreground">
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
                <Card
                  key={post._id}
                  className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-1"
                >
                  {/* Image/Content Preview */}
                  {imageUrl && (
                    <div className="relative h-48 bg-muted">
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

                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-medium line-clamp-2 leading-snug">
                      {hasContent ? post.caption : "Untitled Post"}
                    </h3>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {post.organizationProfile?.orgAcronym?.[0] || "O"}
                        </div>
                        <span className="text-sm font-medium">
                          {post.organizationProfile?.orgAcronym || "Organization"}
                        </span>
                      </div>
                      {post.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
