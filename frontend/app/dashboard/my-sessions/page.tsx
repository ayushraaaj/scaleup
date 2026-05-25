"use client";
import { api } from "@/services/axios";
import { getUser } from "@/utils/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";

const MySessions = () => {
  const user = getUser();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/mentor/my-sessions`);

      setUpcomingSessions(res.data.data.upcoming);
      setPastSessions(res.data.data.past);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 font-black uppercase text-sm tracking-widest text-gray-400 animate-pulse">
        Syncing Session Records...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-white min-h-screen">
      {user?.role === "mentor" ? (
        <div>
          <header className="border-b-4 border-black pb-6 mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">
              Mentor Dashboard
            </p>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
              My Sessions
            </h1>
          </header>

          {/* Upcoming Sessions */}
          <section className="mb-16">
            <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
              <span>●</span> Upcoming Sessions
            </h2>

            {upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingSessions.map((s: any) => (
                  <Link
                    key={s._id}
                    href={`/dashboard/my-sessions/${s._id}`}
                    className="group block border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                          Client
                        </span>
                        <p className="text-black font-black uppercase tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                          {s.userId.fullname}
                          <ArrowUpRight
                            size={14}
                            className="text-gray-300 group-hover:text-blue-600 transition-colors"
                          />
                        </p>
                        <p className="text-[11px] font-medium text-gray-400 italic">
                          @{s.userId.username}
                        </p>
                      </div>
                      <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        {s.sessionType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs font-medium text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{s.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-baseline">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Price
                      </span>
                      <span className="text-base font-black text-black">
                        ₹{s.totalPrice}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 p-8 text-center bg-[#fcfcfc]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
                  No upcoming client consultations found in your queue.
                </p>
              </div>
            )}
          </section>

          {/* Past Sessions */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
              <span>○</span> Past Sessions
            </h2>

            {pastSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastSessions.map((s: any) => (
                  <Link
                    key={s._id}
                    href={`/dashboard/my-sessions/${s._id}`}
                    className="group block border border-gray-200 p-6 bg-[#fcfcfc] hover:border-black transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                          Client
                        </span>
                        <p className="text-gray-700 font-bold uppercase tracking-tight group-hover:text-black transition-colors">
                          {s.userId.fullname}
                        </p>
                        <p className="text-[11px] font-medium text-gray-400 italic">
                          @{s.userId.username}
                        </p>
                      </div>
                      <span className="bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                        <CheckCircle2 size={10} /> {s.sessionType}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{s.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-baseline">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                        Price
                      </span>
                      <span className="text-base font-black text-gray-600">
                        ₹{s.totalPrice}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 p-8 text-center bg-[#fcfcfc]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
                  No historical consultation logs registered yet.
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="h-[80vh] flex items-center justify-center p-8">
          <div className="max-w-md text-center border-4 border-black p-12 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
              Mentor Profile Required
            </h1>
            <p className="text-gray-500 font-medium mb-8 uppercase text-xs tracking-widest leading-relaxed">
              Upgrade your account configuration parameters to open consulting
              channels and start accepting client pipeline sessions.
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

export default MySessions;
