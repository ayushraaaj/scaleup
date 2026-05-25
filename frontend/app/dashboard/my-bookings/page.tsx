"use client";
import { api } from "@/services/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const MyBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<any>([]);
  const [pastBookings, setPastBookings] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const getBookings = async () => {
    try {
      const res = await api.get("/booking/my-bookings");

      setUpcomingBookings(res.data.data.upcoming);
      setPastBookings(res.data.data.past);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 font-black uppercase text-sm tracking-widest text-gray-400 animate-pulse">
        Syncing Booking Records...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-white min-h-screen">
      <header className="border-b-4 border-black pb-6 mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">
          User Dashboard
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
          My Bookings
        </h1>
      </header>

      {/* Upcoming Bookings */}
      <section className="mb-16">
        <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
          <span>●</span> Upcoming Bookings
        </h2>

        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((b: any) => (
              <Link
                href={`/dashboard/my-bookings/${b._id}`}
                key={b._id}
                className="group block border-2 border-black p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                      Mentor
                    </span>
                    <p className="text-black font-black uppercase tracking-tight group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {b.mentorId.userId.fullname}
                      <ArrowUpRight
                        size={14}
                        className="text-gray-300 group-hover:text-blue-600 transition-colors"
                      />
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 italic">
                      @{b.mentorId.userId.username}
                    </p>
                  </div>
                  <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                    {b.sessionType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-baseline">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Price
                  </span>
                  <span className="text-base font-black text-black">
                    ₹{b.totalPrice}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 p-8 text-center bg-[#fcfcfc]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
              There are no upcoming bookings scheduled.
            </p>
          </div>
        )}
      </section>

      {/* Past Bookings */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-6 flex items-center gap-2">
          <span>○</span> Past Bookings
        </h2>

        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((b: any) => (
              <Link
                href={`/dashboard/my-bookings/${b._id}`}
                key={b._id}
                className="group block border border-gray-200 p-6 bg-[#fcfcfc] hover:border-black transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">
                      Mentor
                    </span>
                    <p className="text-gray-700 font-bold uppercase tracking-tight group-hover:text-black transition-colors">
                      {b.mentorId.userId.fullname}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 italic">
                      @{b.mentorId.userId.username}
                    </p>
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 size={10} /> {b.sessionType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>
                      {b.startTime} - {b.endTime}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-baseline">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                    Price
                  </span>
                  <span className="text-base font-black text-gray-600">
                    ${b.totalPrice}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 p-8 text-center bg-[#fcfcfc]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic">
              No historical booking data records found.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MyBookings;
