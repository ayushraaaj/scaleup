"use client";
import { api } from "@/services/axios";
import { setAccessToken, setUser } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const BecomeMentor = () => {
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [expertiseList, setExpertiseList] = useState<string[]>([]);
  const [audioPrice, setAudioPrice] = useState("");
  const [videoPrice, setVideoPrice] = useState("");

  const router = useRouter();

  const addExpertise = () => {
    if (!expertise.trim()) {
      return;
    }

    setExpertiseList((prev) => [...prev, expertise]);

    setExpertise("");
  };

  const removeExpertise = (index: number) => {
    setExpertiseList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        bio,
        expertise: expertiseList,
        pricing: { audio: Number(audioPrice), video: Number(videoPrice) },
      };

      const res = await api.post("/mentor/profile", payload);

      console.log(res.data);

      toast.success(res.data.message);

      const refreshRes = await api.post("/auth/refresh-token");

      setAccessToken(refreshRes.data.data.newAccessToken);
      setUser(refreshRes.data.data.user);

      router.push("/dashboard/feed");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Become a Mentor</h1>

      <div className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block mb-2 font-medium">Bio</label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full border rounded-lg p-3"
            placeholder="Tell students about yourself..."
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block mb-2 font-medium">Expertise</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="React"
              className="flex-1 border rounded-lg p-3"
            />

            <button
              type="button"
              onClick={addExpertise}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {expertiseList.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <span>{item}</span>

                <button
                  type="button"
                  onClick={() => removeExpertise(index)}
                  className="text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">
              Audio Session Price
            </label>

            <input
              type="number"
              value={audioPrice}
              onChange={(e) => setAudioPrice(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Video Session Price
            </label>

            <input
              type="number"
              value={videoPrice}
              onChange={(e) => setVideoPrice(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="1000"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-3 rounded-lg font-medium"
        >
          Become a Mentor
        </button>
      </div>
    </div>
  );
};

export default BecomeMentor;
