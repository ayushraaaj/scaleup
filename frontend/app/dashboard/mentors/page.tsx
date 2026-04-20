"use client";
import MentorCard from "@/components/mentor/MentorCard";
import PostCard from "@/components/post/PostCard";
import { api } from "@/services/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Mentors = () => {
  const [mentors, setMentors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isRemaining, setIsRemaining] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(4);

  const getAllMentors = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await api.get("/mentor/all", {
        params: { page: pageNumber, limit: limit },
      });

      const mentorsData = res.data.data;

      setMentors((prev: any) => {
        if (!prev || pageNumber == 1) {
          return mentorsData;
        }

        const existingIds = new Set(
          prev.mentors.map((mentor: any) => mentor._id),
        );
        const uniqueItems = mentorsData.mentors.filter(
          (mentor: any) => !existingIds.has(mentor._id),
        );

        return {
          ...prev,
          mentors: [...prev.mentors, ...uniqueItems],
        };
      });

      if (mentorsData.totalPages > pageNumber) {
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
    getAllMentors(nextPage);
  };

  useEffect(() => {
    getAllMentors(page);
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-l border-gray-200 pl-6 w-full">
        {mentors.mentors &&
          mentors.mentors.map((mentor: any) => (
            <Link
              key={mentor._id}
              href={`/dashboard/mentors/${mentor.userId.username}`}
            >
              <MentorCard mentor={mentor} />
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

export default Mentors;
