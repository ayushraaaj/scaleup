"use client";
import CreatePostLayout from "@/components/post/CreatePostLayout";
import { api } from "@/services/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { JSONContent } from "@tiptap/react";

const EditPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [loading, setLoading] = useState(false);

  const { postId } = useParams();

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/post/${postId}`);

      setTitle(res.data.data.title);
      setContent(res.data.data.content);

      console.log("Fetchpost: ", res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return null;
  }

  return <CreatePostLayout editTitle={title} editContent={content} />;
};

export default EditPost;
