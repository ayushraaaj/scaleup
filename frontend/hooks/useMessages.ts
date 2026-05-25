import { api } from "@/services/axios";
import { socket } from "@/services/socket";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useMessages = (id: string, url: string) => {
  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [typing, setTyping] = useState("");

  const fetchDetails = async () => {
    try {
      setDetailsLoading(true);

      const res = await api.get(`${url}/${id}`);

      setDetails(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Failed to fetch details");
    } finally {
      setDetailsLoading(false);
    }
  };

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

      socket.emit("message-delivered", { messageId: message._id });
    });
  };

  const listenForTyping = () => {
    socket.on("user-typing", (name) => {
      setTyping(name);

      setTimeout(() => {
        setTyping("");
      }, 2000);
    });
  };

  // const listenForDeliveredMessage = () => {
  //   socket.on("message-delivered-updated", (updatedMessage) => {
  //     setMessages((prev: any) =>
  //       prev.map((m: any) =>
  //         m._id === updatedMessage._id ? updatedMessage : m,
  //       ),
  //     );
  //   });
  // };

  useEffect(() => {
    fetchDetails();

    fetchMessages();

    connectSocket();

    joinRoom();

    listenForMessages();

    listenForTyping();

    // listenForDeliveredMessage();

    return () => {
      disconnectSocket();
    };
  }, []);

  return {
    message,
    sendMessage,
    loading,
    setMessage,
    messages,
    details,
    detailsLoading,
    typing,
  };
};

export default useMessages;
