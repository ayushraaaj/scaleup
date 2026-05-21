"use client";

import { api } from "@/services/axios";
import { socket } from "@/services/socket";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const BookingDetails = () => {
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

      socket.emit("send-message", res.data.data);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });
  };

  const disconnectSocket = () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.disconnect();
  };

  const joinRoom = () => {
    socket.emit("join-room", bookingId);
  };

  const listenForMessages = () => {
    socket.on("receive-message", (message) => {
      setMessages((prev: any) => [...prev, message]);
    });
  };

  useEffect(() => {
    fetchMessages();

    connectSocket();

    joinRoom();

    listenForMessages();

    return () => {
      disconnectSocket();
    };
  }, []);

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
