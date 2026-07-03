// "use client";
// import PostCard from "@/components/post/PostCard";
// import { api } from "@/services/axios";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// const MyPosts = () => {
//   const [posts, setPosts] = useState<any>({});
//   const [loading, setLoading] = useState(false);
//   const [isRemaining, setIsRemaining] = useState(false);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(4);

//   const getAllPosts = async (pageNumber: number) => {
//     try {
//       setLoading(true);

//       const res = await api.get("/mentor/my-posts", {
//         params: { page: pageNumber, limit: limit },
//       });

//       const postsData = res.data.data;

//       setPosts((prev: any) => {
//         if (!prev || pageNumber == 1) {
//           return postsData;
//         }

//         const existingIds = new Set(prev.posts.map((post: any) => post._id));
//         const uniqueItems = postsData.posts.filter(
//           (post: any) => !existingIds.has(post._id),
//         );

//         return {
//           ...prev,
//           posts: [...prev.posts, ...uniqueItems],
//         };
//       });

//       if (postsData.totalPages > pageNumber) {
//         setIsRemaining(true);
//       } else {
//         setIsRemaining(false);
//       }
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMore = () => {
//     const nextPage = page + 1;
//     setPage(nextPage);
//     getAllPosts(nextPage);
//   };

//   useEffect(() => {
//     getAllPosts(page);
//   }, []);

//   return (
//     <div className="p-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-l border-gray-200 pl-6 w-full">
//         {posts.posts &&
//           posts.posts.map((post: any) => (
//             <Link key={post._id} href={`/dashboard/feed/${post._id}`}>
//               <PostCard post={post} />
//             </Link>
//           ))}
//       </div>

//       {isRemaining && (
//         <div className="p-6 border-t border-zinc-100 flex justify-center">
//           <button
//             className="cursor-pointer text-sm font-bold text-zinc-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-xl transition-all disabled:opacity-50"
//             onClick={() => {
//               loadMore();
//             }}
//             disabled={loading}
//           >
//             {loading ? "Loading more..." : "Load More Activity"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyPosts;

"use client";
import PostCard from "@/components/post/PostCard";
import { api } from "@/services/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MyPosts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isRemaining, setIsRemaining] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  // Track which post's 3-dot menu is currently open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getAllPosts = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await api.get("/mentor/my-posts", {
        params: { page: pageNumber, limit: limit },
      });

      const postsData = res.data.data;

      setPosts((prev: any) => {
        if (!prev || pageNumber == 1) {
          return postsData;
        }

        const existingIds = new Set(prev.posts.map((post: any) => post._id));
        const uniqueItems = postsData.posts.filter(
          (post: any) => !existingIds.has(post._id),
        );

        return {
          ...prev,
          posts: [...prev.posts, ...uniqueItems],
        };
      });

      if (postsData.totalPages > pageNumber) {
        setIsRemaining(true);
      } else {
        setIsRemaining(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getAllPosts(nextPage);
  };

  const handleEdit = (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    // Redirect to your edit page route (adjust this path to match your project structure)
    router.push(`/dashboard/my-posts/${postId}`);
  };

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      // Send delete request to backend (verify your backend route matches this endpoint)
      await api.delete(`/post/${postId}`);
      toast.success("Post deleted successfully");

      // Filter out the deleted post from UI state
      setPosts((prev: any) => ({
        ...prev,
        posts: prev.posts.filter((post: any) => post._id !== postId),
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  // Close dropdown menu if user clicks anywhere else on the screen
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    getAllPosts(page);
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-l border-gray-200 pl-6 w-full">
        {posts.posts &&
          posts.posts.map((post: any) => (
            <div key={post._id} className="relative group">
              {/* 3 Dots Menu Button Container */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveMenuId(
                      activeMenuId === post._id ? null : post._id,
                    );
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 bg-white shadow-sm border border-gray-100 cursor-pointer transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Dropdown Options */}
                {activeMenuId === post._id && (
                  <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                    <button
                      onClick={(e) => handleEdit(post._id, e)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(post._id, e)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Main Post Card Link */}
              <Link
                href={`/dashboard/feed/${post._id}`}
                className="block h-full"
              >
                <PostCard post={post} />
              </Link>
            </div>
          ))}
      </div>

      {isRemaining && (
        <div className="p-6 border-t border-zinc-100 flex justify-center">
          <button
            className="cursor-pointer text-sm font-bold text-zinc-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-xl transition-all disabled:opacity-50"
            onClick={() => {
              loadMore();
            }}
            disabled={loading}
          >
            {loading ? "Loading more..." : "Load More Activity"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
