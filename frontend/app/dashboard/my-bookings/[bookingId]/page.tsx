"use client";

import CallChat from "@/components/chat/CallChat";
import IncomingCall from "@/components/modals/IncomingCall";
import useMessages from "@/hooks/useMessages";
import { socket } from "@/services/socket";
import { getUser } from "@/utils/auth";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BookingDetails = () => {
  const { bookingId } = useParams();

  const [incomingCall, setIncomingCall] = useState(false);

  const user = getUser();

  const id = Array.isArray(bookingId) ? bookingId[0] : bookingId;

  if (!id) {
    return null;
  }

  const url = "/booking/my-bookings";

  const listenForIncomingCall = () => {
    socket.on("incoming-call", () => {
      console.log("Incoming call");

      setIncomingCall(true);
    });
  };

  const declineCall = () => {
    setIncomingCall(false);

    socket.emit("call-declined", { id, fullname: user?.fullname });
  };

  const { details } = useMessages(id, url);

  useEffect(() => {
    listenForIncomingCall();

    return () => {
      socket.off("incoming-call");
    };
  }, []);

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
                  Mentor
                </span>
                <p className="text-black font-bold">
                  {details.mentorId.userId.fullname}{" "}
                  <span className="text-blue-600 font-medium italic block text-xs">
                    @{details.mentorId.userId.username}
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

          {incomingCall && <IncomingCall id={id} decline={declineCall} />}
        </aside>

        <CallChat id={id} url={url} />
      </div>
    </div>
  );
};

export default BookingDetails;
