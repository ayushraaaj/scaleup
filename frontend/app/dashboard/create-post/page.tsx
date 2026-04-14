"use client";
import Editor from "@/components/editor/Editor";
import { api } from "@/services/axios";
import { getUserRole } from "@/utils/auth";
import { useState } from "react";
import toast from "react-hot-toast";
import { JSONContent } from "@tiptap/react";

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
    <div>
      {userRole === "mentor" ? (
        <>
          <h1>Create Post</h1>
          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold outline-none border-b border-gray-300 focus:border-black pb-2 mb-6"
          />

          <div className="prose">
            <Editor content={content} setContent={setContent} />
          </div>

          <button onClick={handleSubmit}>Publish</button>
        </>
      ) : (
        <h1>Upgrade to mentor profile to publish your post</h1>
      )}
    </div>
  );
};

export default CreatePost;
