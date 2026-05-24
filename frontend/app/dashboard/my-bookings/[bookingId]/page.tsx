"use client";

import useMessages from "@/hooks/useMessages";
import { api } from "@/services/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BookingDetails = () => {
  const { bookingId } = useParams();

  const id = Array.isArray(bookingId) ? bookingId[0] : bookingId;

  if (!id) {
    return null;
  }

  const { message, sendMessage, loading, setMessage, messages } =
    useMessages(id);

  return (
    <div>
      <h1>Messages</h1>

      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>{loading ? "Sending" : "Send"}</button>

      {messages.length > 0 &&
        messages.map((m: any) => (
          <div key={m._id}>
            <h1>{m.content}</h1>
          </div>
        ))}
    </div>
  );
};

export default BookingDetails;
