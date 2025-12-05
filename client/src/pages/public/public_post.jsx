import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../App";

// =======================
// Public Post Feed
// =======================
export function PublicPostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const response = await axios.get(`${API_ROUTER}/getPublicPosts`, {
          withCredentials: true,
        });

        const data = Array.isArray(response.data) ? response.data : [];

        // Sort newest first
        const sortedPosts = data.sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );

        setPosts(sortedPosts.slice(0, 4)); // Only show first 4 posts
      } catch (error) {
        console.error("Error fetching public posts:", error);
        setPosts([]); // safe fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();

    // Auto-refresh every 30s
    const interval = setInterval(fetchPublicPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFirstImage = (content, orgId) => {
    if (!Array.isArray(content) || content.length === 0) return null;

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];

    const firstImage = content.find(
      (item) =>
        item?.fileName &&
        imageExtensions.some((ext) => item.fileName.toLowerCase().includes(ext))
    );

    return firstImage
      ? `${DOCU_API_ROUTER}/${orgId || "unknown"}/${firstImage.fileName}`
      : null;
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading public posts...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            LATEST POSTS
          </h2>
          <div className="w-16 h-1 bg-orange-400 mx-auto"></div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {posts.length === 0 ? (
            <div className="col-span-4 text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No posts available</p>
            </div>
          ) : (
            posts.map((post) => {
              const imageUrl = getFirstImage(
                post?.content,
                post?.organizationProfile?._id
              );

              return (
                <div
                  key={post?._id || Math.random()}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image Section */}
                  <div className="h-40 bg-gray-200 relative overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post?.caption || "Post image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML =
                            '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><div class="text-gray-400 text-sm">No Image</div></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-400 text-sm">No Image</div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="h-16 bg-gray-300 p-4 flex items-center">
                    <div className="flex items-center space-x-3">
                      {/* Acronym */}
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {post?.organizationProfile?.orgAcronym || "ORG"}
                        </span>
                      </div>

                      {/* Caption */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 line-clamp-2">
                          {post?.caption || "Untitled Post"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* See More Button */}
        <div className="text-center">
          <button className="px-8 py-3 border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition-all duration-300 rounded-none">
            SEE MORE
          </button>
        </div>
      </div>
    </div>
  );
}

