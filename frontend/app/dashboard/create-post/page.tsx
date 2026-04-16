"use client";
import Editor from "@/components/editor/Editor";
import { api } from "@/services/axios";
import { getUserRole } from "@/utils/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { JSONContent } from "@tiptap/react";
import { Send, ShieldCheck, ArrowUpRight } from "lucide-react";

const CreatePost = () => {
  const userRole = getUserRole();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const res = await api.post("/post/create", { title, content });
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Post not created");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      {userRole === "mentor" ? (
        <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto">
          {/* Main Writing Column */}
          <div className="flex-1 p-4 lg:p-8 border-r border-gray-100 bg-white">
            <header className="">
              <input
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold outline-none border-b border-gray-300 focus:border-black pb-2 mb-6"
              />
            </header>

            <div className="max-w-4xl">
              <div className="prose prose-zinc max-w-none">
                <Editor content={content} setContent={setContent} />
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <aside className="w-full lg:w-96 px-8 py-10 bg-[#fcfcfc] lg:sticky lg:top-0 h-fit lg:min-h-screen">
            <div className="space-y-6">
              <div className="bg-black text-white p-8 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                  Publish <ArrowUpRight size={24} className="text-blue-500" />
                </h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 leading-relaxed">
                  Finalize your scaling article. Your followers will be notified
                  immediately.
                </p>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-white text-black py-4 font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all transform active:translate-y-1"
                >
                  <Send size={16} /> Publish Article
                </button>
              </div>

              <div className="p-6 border-2 border-black flex items-start gap-4 bg-white">
                <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                    ScaleUp Policy
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Ensure all code blocks are tested. Quality articles rank
                    higher in the community feed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center p-8">
          <div className="max-w-md text-center border-4 border-black p-12 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
              Mentor Profile Required
            </h1>
            <p className="text-gray-500 font-medium mb-8 uppercase text-xs tracking-widest">
              Upgrade your account to start publishing articles on the ScaleUp
              feed.
            </p>
            <button className="bg-black text-white px-10 py-4 font-black uppercase text-xs hover:bg-blue-600 transition-colors">
              Apply for Mentor Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
