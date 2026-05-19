"use client";

import { api } from "@/services/axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SessionDetails = () => {
  const { bookingId } = useParams();

  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/message/show/${bookingId}`);

      setMessages(res.data.data);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      setLoading(true);

      const res = await api.post(`/message/create/${bookingId}`, {
        content: message,
      });

      setMessage("");
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [bookingId]);

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

      {messages.length &&
        messages.map((m: any) => (
          <div key={m._id}>
            <h1>{m.content}</h1>
          </div>
        ))}
    </div>
  );
};

export default SessionDetails;
