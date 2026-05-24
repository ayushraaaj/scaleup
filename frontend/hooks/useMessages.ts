import { api } from "@/services/axios";
import { socket } from "@/services/socket";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useMessages = (id: string) => {
  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/message/show/${id}`);

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

      const res = await api.post(`/message/create/${id}`, {
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
    socket.off("receive-message");

    socket.disconnect();
  };

  const joinRoom = () => {
    socket.emit("join-room", id);
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

  return { message, sendMessage, loading, setMessage, messages };
};

export default useMessages;
