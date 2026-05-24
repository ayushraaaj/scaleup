"use client";

import useMessages from "@/hooks/useMessages";
import { useParams } from "next/navigation";

const SessionDetails = () => {
  const { sessionId } = useParams();

  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;

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

export default SessionDetails;
