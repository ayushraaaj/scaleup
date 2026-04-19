"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/axios";
import {
  ArrowLeft,
  Zap,
  Star,
  ShieldCheck,
  Video,
  Mic,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

interface MentorData {
  userId: {
    fullname: string;
    username: string;
  };
  bio: string;
  expertise: string[];
  pricing: {
    audio: number;
    video: number;
  };
  ratings: number;
  totalSessions: number;
}

const MentorDetails = () => {
  const { mentorId } = useParams();
  const router = useRouter();

  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMentor = async () => {
    try {
      const res = await api.get(`/mentor/${mentorId}`);
      setMentor(res.data.data);
    } catch (error: any) {
      toast.error("Failed to load mentor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
  }, [mentorId]);

  if (loading)
    return (
      <div className="p-20 font-black uppercase animate-pulse tracking-widest">
        Loading Expert Profile...
      </div>
    );

  if (!mentor)
    return <div className="p-20 uppercase font-black">Mentor not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back to Mentors
        </button>
        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
          ScaleUp / Official Mentor Profile
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Column: Bio & Expertise */}
        <article className="flex-1 px-8 lg:px-20 py-12 border-r border-gray-100">
          <div className="max-w-3xl">
            <header className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-tighter">
                  Verified Expert
                </span>
                <span className="border border-gray-200 px-2 py-1 text-[9px] font-black uppercase tracking-tighter">
                  ID: {mentorId?.toString().slice(-8).toUpperCase()}
                </span>
              </div>

              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-6">
                {mentor.userId.fullname}
              </h1>

              <div className="flex flex-wrap gap-4 items-center">
                <p className="text-blue-600 font-black uppercase tracking-widest text-xs italic">
                  @{mentor.userId.username}
                </p>
                <div className="h-4 w-[1px] bg-gray-200" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < mentor.ratings ? "black" : "none"}
                      className={
                        i < mentor.ratings ? "text-black" : "text-gray-200"
                      }
                    />
                  ))}
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest">
                    ({mentor.ratings}.0)
                  </span>
                </div>
              </div>
            </header>

            {/* Expertise Tags */}
            <section className="mb-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
                Core Competencies
              </h3>
              <div className="flex flex-wrap gap-3">
                {mentor.expertise.map((skill, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-black px-4 py-2 flex items-center gap-2 group hover:bg-black transition-colors"
                  >
                    <Award size={16} className="group-hover:text-white" />
                    <span className="text-xs font-black uppercase group-hover:text-white">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bio Section */}
            <section className="mb-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
                About
              </h3>
              <div className="bg-[#fcfcfc] border-l-4 border-black p-8">
                <p className="text-2xl font-medium leading-relaxed text-gray-800 italic tracking-tight">
                  "{mentor.bio}"
                </p>
              </div>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-2 gap-0 border border-gray-100">
              <div className="p-10 border-r border-gray-100">
                <p className="text-[40px] font-black leading-none mb-2">
                  {mentor.totalSessions}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Total Sessions
                </p>
              </div>
              <div className="p-10">
                <p className="text-[40px] font-black leading-none mb-2">100%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Response Rate
                </p>
              </div>
            </section>
          </div>
        </article>

        {/* Right Column: Pricing & Booking */}
        <aside className="w-full lg:w-[450px] p-8 lg:p-12 bg-[#fcfcfc] lg:sticky lg:top-[65px] h-fit">
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Service Menu
            </h3>

            {/* Video Call Card */}
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Video size={24} />
                </div>
                <span className="text-3xl font-black">
                  ${mentor.pricing.video}
                </span>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter">
                Video Consultation
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">
                Per 60 Minute Session
              </p>
              <button className="w-full bg-black text-white py-4 font-black uppercase text-xs flex items-center justify-center gap-2 tracking-widest group-hover:bg-blue-600 transition-colors">
                <Zap size={14} fill="currentColor" /> Book Video Call
              </button>
            </div>

            {/* Audio Call Card */}
            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Mic size={24} />
                </div>
                <span className="text-3xl font-black">
                  ${mentor.pricing.audio}
                </span>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter">
                Audio Strategy
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">
                Per 30 Minute Session
              </p>
              <button className="w-full border-2 border-black text-black py-4 font-black uppercase text-xs flex items-center justify-center gap-2 tracking-widest hover:bg-black hover:text-white transition-all">
                Reserve Audio Slot
              </button>
            </div>

            {/* Verification Badge */}
            <div className="border-2 border-dashed border-gray-200 p-6 flex items-start gap-4">
              <ShieldCheck className="text-blue-600 shrink-0" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1">
                  Buyer Protection
                </p>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Sessions are held on our secure platform. Payments are only
                  released after the session is completed.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MentorDetails;
