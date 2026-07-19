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
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

interface MentorData {
  _id: string;
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
  availability: Availability[];
  consultationTypes: {
    audio: boolean;
    video: boolean;
  };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Availability {
  date: string;
  slots: TimeSlot[];
}

interface SlotTime {
  startTime: string;
  endTime: string;
}

const MentorDetails = () => {
  const { username } = useParams();
  const router = useRouter();

  const [mentor, setMentor] = useState<MentorData | null>(null);
  const [loading, setLoading] = useState(true);

  const [slots, setSlots] = useState<TimeSlot[] | null>(null);
  const [sessionType, setSessionType] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotTime | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const fetchMentor = async () => {
    try {
      const res = await api.get(`/mentor/${username}`);
      setMentor(res.data.data);

      console.log(res.data.data);

      await getAvailability("video");
    } catch (error: any) {
      toast.error("Failed to load mentor data");
    } finally {
      setLoading(false);
    }
  };

  const getAvailability = (type: string) => {
    if (!mentor) {
      return;
    }

    setSessionType(type);

    const dates = mentor.availability.map((a) => a.date) ?? null;

    setAvailableDates(dates);
  };

  const getSlots = async (date: string) => {
    if (!mentor) {
      return;
    }

    try {
      setSelectedDate(date);
      setSelectedSlot(null);
      console.log(date);
      const res = await api.get(`/mentor/${mentor._id}/availability`, {
        params: { date },
      });
      setSlots(res.data.data);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message ?? "Failed to load slots");
    }
  };

  const setSlot = async (startTime: string, endTime: string) => {
    setSelectedSlot({ startTime, endTime });
    console.log(`Slots: ${startTime} ${endTime}`);
  };

  const confirmBooking = async () => {
    if (!mentor || !sessionType || !selectedSlot) {
      toast.error("Please complete your slot selection first.");
      return;
    }
    if (!termsAccepted) {
      toast.error(
        "You must agree to the terms and conditions before confirming.",
      );
      return;
    }

    try {
      const res = await api.post(`booking/${mentor._id}`, {
        sessionType,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      toast.success(res.data.message);

      setSlots((prev) => {
        if (!prev) {
          return null;
        }
        return prev.filter((p) => p.startTime !== selectedSlot.startTime);
      });
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Failed to book");
    }
  };

  useEffect(() => {
    fetchMentor();
  }, [username]);

  useEffect(() => {
    getAvailability("video");
  }, [mentor]);

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
        <article className="flex-1 px-8 lg:px-20 py-12 border-r border-gray-100">
          <div className="max-w-3xl">
            <header className="mb-16">
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-tighter">
                  Verified Expert
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

            <section className="mt-16 border-t border-gray-100 pt-16">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
                1. Select Available Date
              </h3>

              <div className="flex flex-wrap gap-3 mb-12">
                {availableDates && availableDates.length > 0 ? (
                  availableDates.map((date) => {
                    const isSelected = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => getSlots(date)}
                        className={`px-5 py-3 border-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                          isSelected
                            ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]"
                            : "bg-white text-black border-black hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Calendar size={14} />
                          {date}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    No matching dates available.
                  </p>
                )}
              </div>

              {selectedDate && (
                <>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">
                    2. Choose Strategy Time Window
                  </h3>

                  {slots && slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
                      {slots.map((slot) => {
                        const isSlotSelected =
                          selectedSlot?.startTime === slot.startTime;
                        return (
                          <button
                            key={slot.startTime}
                            onClick={() =>
                              setSlot(slot.startTime, slot.endTime)
                            }
                            className={`p-4 border-2 font-black uppercase text-xs tracking-wider transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                              isSlotSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                : "bg-[#fcfcfc] text-zinc-800 border-zinc-200 hover:border-black"
                            }`}
                          >
                            <Clock size={13} />
                            {slot.startTime} - {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-gray-200 text-center mb-12">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        All sessions have been occupied for this date.
                      </p>
                    </div>
                  )}
                </>
              )}

              {selectedSlot && (
                <div className="bg-[#fcfcfc] border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-xl animate-fade-in">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-blue-600" size={20} /> Booking
                    Summary
                  </h4>

                  <div className="space-y-3 mb-6 border-b border-gray-200 pb-6 text-xs uppercase font-bold tracking-wider text-zinc-600">
                    <p>
                      <span className="text-gray-400">Consultation Date:</span>{" "}
                      <span className="text-black ml-1">{selectedDate}</span>
                    </p>
                    <p>
                      <span className="text-gray-400">Reserved Window:</span>{" "}
                      <span className="text-black ml-1">
                        {selectedSlot.startTime} to {selectedSlot.endTime}
                      </span>
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-gray-400">Delivery Channels:</span>
                      <select
                        value={sessionType ?? ""}
                        onChange={(e) => setSessionType(e.target.value)}
                        className="border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase cursor-pointer outline-none focus:border-blue-600"
                      >
                        {mentor.consultationTypes.video && (
                          <option value="video">Video Call Session</option>
                        )}
                        {mentor.consultationTypes.audio && (
                          <option value="audio">Audio Strategy Session</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-6">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 border-2 border-black rounded-none text-black accent-black cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-[11px] font-bold uppercase tracking-tight text-gray-500 cursor-pointer select-none leading-tight"
                    >
                      By confirming, you agree that this structured session is
                      final, contractual, and non-refundable.
                    </label>
                  </div>

                  <button
                    onClick={confirmBooking}
                    disabled={!termsAccepted}
                    className={`w-full py-4 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                      termsAccepted
                        ? "bg-black border-black text-white hover:bg-blue-600 hover:border-blue-600 cursor-pointer shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]"
                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Finalize & Confirm Appointment
                  </button>
                </div>
              )}
            </section>
          </div>
        </article>

        <aside className="w-full lg:w-[450px] p-8 lg:p-12 bg-[#fcfcfc] lg:sticky lg:top-[65px] h-fit">
          <div className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
              Service Menu
            </h3>

            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Video size={24} />
                </div>
                <span className="text-3xl font-black">
                  ₹{mentor.pricing.video}
                </span>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter">
                Video Consultation
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">
                Per 60 Minute Session
              </p>
              <button
                onClick={() => getAvailability("video")}
                className="w-full bg-black text-white py-4 font-black uppercase text-xs flex items-center justify-center gap-2 tracking-widest group-hover:bg-blue-600 transition-colors"
              >
                <Zap size={14} fill="currentColor" /> Book Video Call
              </button>
            </div>

            <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Mic size={24} />
                </div>
                <span className="text-3xl font-black">
                  ₹{mentor.pricing.audio}
                </span>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter">
                Audio Strategy
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">
                Per 30 Minute Session
              </p>
              <button
                onClick={() => getAvailability("audio")}
                className="w-full border-2 border-black text-black py-4 font-black uppercase text-xs flex items-center justify-center gap-2 tracking-widest group-hover:bg-black group-hover:text-white transition-all"
              >
                Reserve Audio Slot
              </button>
            </div>

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
