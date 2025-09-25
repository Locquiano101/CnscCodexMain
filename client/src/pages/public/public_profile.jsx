import { useEffect, useState } from "react";
import {
  MoreHorizontal,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  Camera, // 📌 missing
  MessageCircle, // 📌 missing
  Clock, // 📌 missing
  Badge, // 📌 missing
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { API_ROUTER, DOCU_API_ROUTER } from "../../App";
import axios from "axios";

export function PublicProfile() {
  const location = useLocation();
  const { orgData } = location.state || {}; // safely get the data

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPublicPost = async () => {
      if (!orgData._id) return;

      try {
        const response = await axios.get(
          `${API_ROUTER}/getOrgProfilePosts/${orgData._id}`,
          { withCredentials: true }
        );
        setPosts(response.data);
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

  console.log(orgData);

  return (
    <div className="w-screen h-screen  flex flex-col bg-gray-300 overflow-auto">
      {/* Enhanced Header */}
      <div className="flex flex-col mx-24 gap-4">
        <div className="w-full bg-white shadow">
          {/* Cover Photo */}
          <div className="relative w-full h-32 bg-gradient-to-r  from-cnsc-primary-color via-amber-500 to-yellow-500 ">
            {/* Profile Avatar (overlapping bottom) */}
            <div className="absolute -bottom-16 left-6">
              <div className="w-32 h-32 rounded-full  ring-white overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center text-white font-bold text-2xl">
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

          {/* Org Info */}
          <div className="mt-20 px-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {orgData?.orgName || "Organization Name"}
            </h1>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Left Sidebar - Enhanced Organization Info */}

          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Badge className="w-5 h-5 text-blue-600" />
                About Organization
              </h3>

              <div className="space-y-4 text-sm">
                {/* Course / Academic Focus */}
                {orgData?.orgCourse && (
                  <div className="flex items-start space-x-3">
                    <GraduationCap className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgCourse}</p>
                      <p className="text-gray-500">Course</p>
                    </div>
                  </div>
                )}

                {/* Department */}
                {orgData?.orgDepartment && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgDepartment}</p>
                      <p className="text-gray-500">Department</p>
                    </div>
                  </div>
                )}

                {/* Classification */}
                {orgData?.orgClass && (
                  <div className="flex items-start space-x-3">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgClass}</p>
                      <p className="text-gray-500">Classification</p>
                    </div>
                  </div>
                )}

                {/* Acronym */}
                {orgData?.orgAcronym && (
                  <div className="flex items-start space-x-3">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgAcronym}</p>
                      <p className="text-gray-500">Acronym</p>
                    </div>
                  </div>
                )}

                {/* Specialization */}
                {orgData?.orgSpecialization && (
                  <div className="flex items-start space-x-3">
                    <MoreHorizontal className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{orgData.orgSpecialization}</p>
                      <p className="text-gray-500">Specialization</p>
                    </div>
                  </div>
                )}

                {/* Established (using createdAt if you want) */}
                {orgData?.createdAt && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {new Date(orgData.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-gray-500">Established</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-4 w-full ">
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
                  className="bg-white rounded-xl p-4shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <PostCard
                    post={post}
                    DOCU_API_ROUTER={DOCU_API_ROUTER}
                    orgData={orgData}
                    formatTimeAgo={formatTimeAgo}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostCard({ post, DOCU_API_ROUTER, formatTimeAgo, orgData }) {
  // Helper function to check if file is a document
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

  // Helper function to check if file is an image
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
    <div className="p-8">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Org Logo / Acronym */}
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
            {/* Org Name + Status */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {post.organizationProfile?.orgName || "Organization"}
              </h3>
            </div>

            {/* Time + Department */}
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

        {/* More Options Button */}
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 leading-relaxed">{post.caption}</p>
      </div>

      {/* Post Images and Documents */}
      {post.content && post.content.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {post.content.map((content, index) => {
            const fileUrl = `${DOCU_API_ROUTER}/${content.organizationProfile}/${content.fileName}`;

            if (isDocument(content.fileName)) {
              // Render document as iframe
              return (
                <div key={content._id} className="flex flex-col w-full">
                  <iframe
                    src={fileUrl}
                    className="w-full h-300 "
                    title={content.fileName}
                    loading="lazy"
                  />
                </div>
              );
            } else if (isImage(content.fileName)) {
              // Render image with flexible aspect ratio
              return (
                <div key={content._id} className="flex-shrink-0 relative group">
                  <div className="w-auto h-80 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={fileUrl}
                      className="h-full w-auto object-cover text-gray-400"
                      alt={content.fileName}
                      loading="lazy"
                    />
                  </div>
                  {index === 3 && post.content.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{post.content.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              );
            } else {
              // Render other file types as downloadable links
              return (
                <div
                  key={content._id}
                  className="flex-shrink-0 w-64 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center p-4"
                  >
                    <p className="text-sm text-gray-700 font-medium truncate">
                      {content.fileName}
                    </p>
                  </a>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
