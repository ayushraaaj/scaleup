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

  const [commentsCount, setCommentsCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);

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

  const fetchPost = async () => {
    try {
      const res = await api.get(`/post/${feedId}`);

      setPost(res.data.data);

      setLikes(res.data.data.likesCount);
      setIsLiked(res.data.data.isLiked);

      setCommentsCount(res.data.data.commentsCount);
    } catch (error: any) {
      toast.error("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/post/${feedId}/comments`);
      setComments(res.data.data.comments);
    } catch (error) {
      toast.error("Failed to load comments");
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      setCommentsLoading(true);

      const res = await api.post(`/post/${feedId}/comment`, {
        content: newComment,
      });

      setComments((prev) => [res.data.data, ...prev]);

      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setCommentsLoading(false);
    }
  };

  const redirectToMentor = async () => {
    try {
      // toast.success("Redirecting to mentor page...");
      router.push(`/dashboard/mentors/${post.mentorId.username}`);
    } catch (error) {
      toast.error("Failed to load mentor page");
    }
  };

  useEffect(() => {
    fetchPost();

    fetchComments();
  }, [feedId]);

  if (loading)
    return (
      <div className="p-20 font-black uppercase animate-pulse">
        Loading Article...
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
        <article className="flex-1 px-8 lg:px-20 py-5 border-r border-gray-50">
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

          <div className="flex items-center gap-10 py-8 border-t border-gray-200">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 ${isLiked ? "text-red-600" : "text-gray-500"}`}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              <span className="font-black text-lg">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500">
              <MessageSquare size={24} />
              <span className="font-black text-lg">{commentsCount}</span>
            </button>
          </div>

          <div className="">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3">
              Discussions{" "}
              <span className="text-blue-600 italic">({commentsCount})</span>
            </h3>

            <div className="mb-16 group">
              <div className="relative border-2 border-gray-200 group-focus-within:border-black transition-all bg-[#fcfcfc]">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your analysis or question to this thread..."
                  className="w-full p-6 text-sm font-medium outline-none resize-none h-32 bg-transparent placeholder:text-gray-300"
                />

                <div className="h-1 w-0 bg-blue-600 group-focus-within:w-full transition-all duration-700" />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  disabled={commentsLoading}
                  onClick={addComment}
                  className="bg-black text-white px-10 py-4 font-black uppercase text-[10px] tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:translate-1 hover:shadow-none transition-all flex items-center gap-2 disabled:bg-gray-400"
                >
                  {commentsLoading ? "Syncing..." : "Post Comment"}
                </button>
              </div>
            </div>

            {/* Comments Feed */}
            <div className="space-y-10">
              {comments.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 p-10 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 italic">
                    The discussion is empty. Be the first to scale up.
                  </p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="relative pl-6 border-l-2 border-gray-100 hover:border-black transition-colors pb-2"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 bg-black flex items-center justify-center">
                        <span className="text-[10px] font-black text-white">
                          {comment.userId.fullname.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase leading-none tracking-tight">
                          {comment.userId.fullname}
                        </p>
                        <p className="text-[9px] font-bold text-blue-600 italic">
                          @{comment.userId.username}
                        </p>
                      </div>
                      <span className="ml-auto text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                        {new Date(comment.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-white p-4 border border-gray-100 group-hover:border-gray-200 transition-all">
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
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
            <button
              onClick={redirectToMentor}
              className="w-full bg-white text-black py-4 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
            >
              <Zap size={16} fill="currentColor" /> Book 1:1 Session
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostDetailPage;
