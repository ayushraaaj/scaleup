"use client";

import CallChat from "@/components/chat/CallChat";
import useMessages from "@/hooks/useMessages";
import { socket } from "@/services/socket";
import { getUser } from "@/utils/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const SessionDetails = () => {
  const { sessionId } = useParams();

  const router = useRouter();

  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  if (!id) {
    return null;
  }

  const url = "/mentor/my-sessions";

  const { details } = useMessages(id, url);

  const startCall = () => {
    socket.emit("call-request", {
      id,
    });

    router.push(`/call/${id}?caller=true`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-5 bg-white min-h-screen">
      <header className="border-b border-gray-200 pb-6 mb-8">
        <p className="text-xl font-black uppercase tracking-widest text-blue-600 mb-1">
          ScaleUp Dashboard
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Booking Details */}
        <aside className="w-full lg:w-[360px] lg:sticky lg:top-6 space-y-6 shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
            Booking Details
          </h2>

          {details && (
            <div className="border border-black p-6 bg-[#fcfcfc] space-y-5 text-sm font-medium text-gray-700">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Client
                </span>
                <p className="text-black font-bold">
                  {details.userId.fullname}{" "}
                  <span className="text-blue-600 font-medium italic block text-xs">
                    @{details.userId.username}
                  </span>
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Session Type
                </span>
                <p className="text-black uppercase font-bold">
                  {details.sessionType}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Schedule Timeline
                </span>
                <p className="text-black font-bold leading-snug">
                  {details.date}{" "}
                  <span className="text-gray-500 block text-xs font-normal">
                    {details.startTime} - {details.endTime}
                  </span>
                </p>
              </div>

              <div className="space-y-1 pt-3 border-t-2 border-black">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
                  Total Price
                </span>
                <p className="text-2xl font-black text-black tracking-tight">
                  ₹{details.totalPrice}
                </p>
              </div>
            </div>
          )}

          <button onClick={startCall} className="bg-black text-white px-4 py-2">
            Start Call
          </button>
        </aside>

        <CallChat id={id} url={url} />
      </div>
    </div>
  );
};

export default SessionDetails;
