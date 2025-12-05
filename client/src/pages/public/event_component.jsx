import { useState, useEffect } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { API_ROUTER, DOCU_API_ROUTER } from "../../App";


// =======================
// Event Component
// =======================
export function EventComponent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicPosts = async () => {
      try {
        const response = await axios.get(`${API_ROUTER}/getPublicPosts`, {
          withCredentials: true,
        });

        const data = Array.isArray(response.data) ? response.data : [];

        const sortedPosts = data.sort(
          (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
        );

        setPosts(sortedPosts.slice(0, 4));
      } catch (error) {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPosts();
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

  const renderContentPreview = (post, imageUrl) => {
    return (
      <div className="relative h-40 bg-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post?.caption || "Post image"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-gray-400 text-sm">No Image</div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading public posts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        {/* CNSC CODEX Title */}
        <div className="flex flex-wrap items-center justify-center  text-center">
          <h1 className="text-xl md:text-4xl font-extrabold tracking-wide">
            <span className="text-[#500000] drop-shadow-[1px_1px_0_white]">
              CNSC{" "}
            </span>
            <span className=" text-[#ee8f00] mr-2 drop-shadow-[1px_1px_0_white]">
              CODEX {"    "}
              {"    "}
            </span>
            <span className="text-white drop-shadow-[1px_1px_0_#ee8f00]">
              LATEST POSTS & UPDATES
            </span>
          </h1>
        </div>

        <p className="text-gray-200 mt-3 text-sm">
          Stay informed with the most recent posts and news.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {posts.length === 0 ? (
          <div className="col-span-4 text-center py-20 bg-white/10 rounded-lg border border-gray-300 backdrop-blur-sm">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-200 font-medium text-lg">
              No posts available
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const imageUrl = getFirstImage(
              post?.content,
              post?.organizationProfile?._id
            );
            const hasContent = post?.caption && post.caption.trim().length > 0;
            const firstContent =
              Array.isArray(post?.content) && post.content.length > 0
                ? post.content[0]
                : null;

            return (
              <div
                key={post?._id || Math.random()}
                className="bg-white/95 rounded-xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-44">
                  {firstContent ? (
                    renderContentPreview(post, imageUrl, firstContent)
                  ) : (
                    <div className="h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Content</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-4 flex items-center">
                  {/* Acronym */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-semibold text-gray-700">
                      {post?.organizationProfile?.orgAcronym || "ORG"}
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {hasContent ? post.caption : "Untitled Post"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* See More Button */}
      <div className="text-center">
        <button className="px-10 py-3.5 border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition-all duration-300 rounded-md shadow-md hover:shadow-lg">
          SEE MORE
        </button>
      </div>
    </div>
  );
}
