"use client";
import PostCard from "@/components/post/PostCard";
import { api } from "@/services/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Feed = () => {
  const [posts, setPosts] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isRemaining, setIsRemaining] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  const getAllPosts = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await api.get("/post/all", {
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
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getAllPosts(nextPage);
  };

  useEffect(() => {
    getAllPosts(page);
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-l border-gray-200 pl-6 w-full">
        {posts.posts &&
          posts.posts.map((post: any) => (
            <Link key={post._id} href={`/dashboard/feed/${post._id}`}>
              <PostCard post={post} />
            </Link>
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

export default Feed;
