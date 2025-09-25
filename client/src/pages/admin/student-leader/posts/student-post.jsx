import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  MessageCircle,
  Clock,
  Badge,
  Pencil, // 🔹 for Edit
} from "lucide-react";

import { StudentLeaderAddPost } from "./add-post";
import { API_ROUTER, DOCU_API_ROUTER } from "../../../../App";
import axios from "axios";

export function StudentPost({ orgData }) {
  const [posts, setPosts] = useState([]);
  const [addNewPost, setAddNewPost] = useState(false);
  const [editPost, setEditPost] = useState(null); // 🔹 track post to edit

  useEffect(() => {
    const fetchPublicPost = async () => {
      if (!orgData._id) return;

      try {
        const response = await axios.get(
          `${API_ROUTER}/getOrgProfilePosts/${orgData._id}`,
          { withCredentials: true }
        );

        // 🔹 sort newest first
        const sortedPosts = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching accreditation info:", error);
      }
    };

    fetchPublicPost();
  }, [orgData._id]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="flex flex-col mx-24 gap-4">
        {/* Org Header */}
        <div className="w-full bg-white shadow">
          <div className="relative w-full h-32 bg-gradient-to-r from-cnsc-primary-color via-amber-500 to-yellow-500 ">
            <div className="absolute -bottom-16 left-6">
              <div className="w-32 h-32 rounded-full ring-white overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center text-white font-bold text-2xl">
                {orgData?.orgLogo ? (
                  <img
                    src={`${DOCU_API_ROUTER}/${orgData._id}/${orgData.orgLogo}`}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  orgData?.orgAcronym || "ORG"
                )}
              </div>
            </div>
          </div>

          <div className="mt-20 px-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {orgData?.orgName || "Organization Name"}
            </h1>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Badge className="w-5 h-5 text-blue-600" />
                About Organization
              </h3>
              <div className="space-y-4 text-sm">
                {orgData?.orgCourse && (
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgCourse}</p>
                      <p className="text-gray-500">Course</p>
                    </div>
                  </div>
                )}
                {orgData?.orgDepartment && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgDepartment}</p>
                      <p className="text-gray-500">Department</p>
                    </div>
                  </div>
                )}
                {orgData?.orgClass && (
                  <div className="flex items-start space-x-3">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgClass}</p>
                      <p className="text-gray-500">Classification</p>
                    </div>
                  </div>
                )}
                {orgData?.orgAcronym && (
                  <div className="flex items-start space-x-3">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgAcronym}</p>
                      <p className="text-gray-500">Acronym</p>
                    </div>
                  </div>
                )}
                {orgData?.orgSpecialization && (
                  <div className="flex items-start space-x-3">
                    <MoreHorizontal className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgSpecialization}</p>
                      <p className="text-gray-500">Specialization</p>
                    </div>
                  </div>
                )}
                {orgData?.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {new Date(orgData.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                      <p className="text-gray-500">Established</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 w-full ">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                onClick={() => setAddNewPost(true)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {orgData?.orgAcronym?.[0] || "O"}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full px-4 py-3 text-gray-500 hover:bg-gray-200 transition-colors">
                      What would you like to share with the community?
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <PostCard
                    post={post}
                    DOCU_API_ROUTER={DOCU_API_ROUTER}
                    orgData={orgData}
                    formatTimeAgo={formatTimeAgo}
                    onEdit={() => setEditPost(post)} // 🔹 pass edit handler
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Add Post Modal */}
      {addNewPost && (
        <StudentLeaderAddPost
          orgData={orgData}
          Modal={() => setAddNewPost(false)}
        />
      )}

      {/* 🔹 Edit Post Modal */}
      {editPost && (
        <StudentLeaderAddPost
          orgData={orgData}
          Modal={() => setEditPost(null)}
        />
      )}
    </div>
  );
}

export function PostCard({
  post,
  DOCU_API_ROUTER,
  formatTimeAgo,
  orgData,
  onEdit,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isDocument = (fileName) => {
    const documentExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".rtf",
      ".odt",
      ".xls",
      ".xlsx",
      ".ppt",
      ".pptx",
    ];
    return documentExtensions.some((ext) =>
      fileName.toLowerCase().includes(ext)
    );
  };

  const isImage = (fileName) => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    return imageExtensions.some((ext) => fileName.toLowerCase().includes(ext));
  };

  return (
    <div className="p-8 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {orgData?.orgLogo ? (
              <img
                src={`${DOCU_API_ROUTER}/${orgData._id}/${orgData.orgLogo}`}
                alt="Logo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              orgData?.orgAcronym || "ORG"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {post.organizationProfile?.orgName || "Organization"}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.organizationProfile?.orgDepartment && (
                <>
                  <span>•</span>
                  <span>{post.organizationProfile.orgDepartment}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3 Dots with Edit */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                className="flex items-center gap-2 px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(post); // 🔹 open edit modal
                }}
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">{post.caption}</p>
      </div>

      {/* Files */}
      {post.content && post.content.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {post.content.map((content) => {
            const fileUrl = `${DOCU_API_ROUTER}/${content.organizationProfile}/${content.fileName}`;

            if (isDocument(content.fileName)) {
              return (
                <iframe
                  key={content._id}
                  src={fileUrl}
                  className="w-full h-60 border rounded-lg"
                  title={content.fileName}
                />
              );
            } else if (isImage(content.fileName)) {
              return (
                <div key={content._id} className="flex-shrink-0">
                  <img
                    src={fileUrl}
                    className="h-60 rounded-lg object-cover"
                    alt={content.fileName}
                  />
                </div>
              );
            } else {
              return (
                <a
                  key={content._id}
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 h-32 bg-gray-100 rounded-lg border flex items-center justify-center hover:bg-gray-200"
                >
                  <p className="text-sm text-gray-700 truncate">
                    {content.fileName}
                  </p>
                </a>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
