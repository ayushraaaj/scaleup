"use client";

import VideoConsultaton from "@/components/video/VideoConsultation";
import useMessages from "@/hooks/useMessages";
import { socket } from "@/services/socket";
import { getUser } from "@/utils/auth";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const SessionDetails = () => {
  const { sessionId } = useParams();

  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

  if (!id) {
    return null;
  }

  const url = "/mentor/my-sessions";

  const clientID = getUser()?._id;

  const {
    message,
    sendMessage,
    loading,
    setMessage,
    messages,
    details,
    detailsLoading,
    typing,
  } = useMessages(id, url);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (detailsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8 font-black uppercase text-sm tracking-widest text-gray-400 animate-pulse">
        Loading session details...
      </div>
    );
  }

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

          <VideoConsultaton />
        </aside>

        {/* Messages Thread */}
        <main className="flex-1 w-full space-y-6 flex flex-col h-[calc(100vh-200px)] lg:min-h-[600px]">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2">
            Messages Thread
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-[400px]">
            {messages.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider italic text-center py-10 border border-dashed border-gray-100 bg-[#fcfcfc]">
                No message data logs generated yet.
              </p>
            ) : (
              messages.map((m: any) => {
                const senderID = m.senderId?._id || m.senderId;
                const isMyMessage = senderID === clientID;

                console.log("CLIENT:", clientID);
                console.log("SENDER:", senderID);

                return (
                  <div
                    key={m._id}
                    className={`flex flex-col max-w-[75%] ${isMyMessage ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      {/* <span className="text-[11px] font-black uppercase tracking-tight text-black">
                        {isMyMessage ? "You" : m.senderId.fullname}
                      </span> */}
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`p-4 border text-sm font-medium leading-relaxed whitespace-pre-wrap transition-colors ${
                        isMyMessage
                          ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,0.3)]"
                          : "bg-[#fcfcfc] text-gray-800 border-gray-200"
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}

            {/* 4. This hidden marker always stays at the bottom to hold the scroll focus */}
            <div ref={messagesEndRef} />
          </div>

          {typing && (
            <p className="text-xs text-gray-400 italic">
              {typing} is typing...
            </p>
          )}

          <div className="flex gap-2 items-center border border-gray-300 focus-within:border-black p-2 transition-colors bg-white mt-auto shrink-0">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);

                socket.emit("typing", {
                  bookingId: id,
                  name: getUser()?.fullname,
                });
              }}
              className="flex-1 p-2 text-sm outline-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading && message.trim()) {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              className="bg-black text-white px-6 py-2 font-black uppercase text-[11px] tracking-wider hover:bg-blue-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 shrink-0"
            >
              {loading ? "Sending" : "Send"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SessionDetails;
