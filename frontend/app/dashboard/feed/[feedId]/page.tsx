"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/axios";
import { ArrowLeft, Zap, Heart, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import PostView from "@/components/post/PostView";

const PostDetailPage = () => {
  console.log("Component rendered");
  const { feedId } = useParams();

  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = async () => {
    try {
      const res = await api.post(`/post/${feedId}/react`, { type: "like" });
      setIsLiked(!isLiked);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

      toast.success(res.data.message);
    } catch (e) {
      toast.error("Sync failed");
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/post/${feedId}`);
        setPost(res.data.data);
        setLikes(res.data.data.likesCount);
        setIsLiked(res.data.data.isLiked);
      } catch (error: any) {
        toast.error("Failed to load report");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [feedId]);

  if (loading)
    return (
      <div className="p-20 font-black uppercase animate-pulse">
        Analyzing Report...
      </div>
    );
  if (!post)
    return <div className="p-20 uppercase font-black">Report not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Return to Feed
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left: The Editorial Content */}
        <article className="flex-1 px-8 lg:px-20 py-16 border-r border-gray-50">
          <div className="max-w-3xl">
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-2 py-0.5 border border-black text-[9px] font-black uppercase">
                  {post.visibility} Access
                </span>
              </div>
              <h1 className="text-4xl lg:text-4xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>By {post.mentorId.fullname}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </header>
          </div>

          {post.content && <PostView content={post.content} />}

          <div className="flex items-center gap-10 py-12 border-t border-gray-100 mt-12">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 ${isLiked ? "text-red-600" : "text-gray-500"}`}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              <span className="font-black text-lg">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500">
              <MessageSquare size={24} />
              <span className="font-black text-lg">{post.commentsCount}</span>
            </button>
          </div>
        </article>

        {/* Right: Sticky ScaleUp Action */}
        <aside className="w-full lg:w-96 p-8 lg:sticky lg:top-16.25 h-fit bg-[#fcfcfc]">
          <div className="bg-black text-white p-8 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">
              Mentor Actions
            </p>
            <h2 className="text-xl font-black uppercase tracking-tighter mb-6">
              ScaleUp with {post.mentorId.fullname}
            </h2>
            <button className="w-full bg-white text-black py-4 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
              <Zap size={16} fill="currentColor" /> Book 1:1 Session
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetailPage;
