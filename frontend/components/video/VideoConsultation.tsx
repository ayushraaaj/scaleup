import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const VideoConsultaton = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();
    } catch (error) {
      toast.error("Failed video consultation");
    }
  };

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection();
  };

  //   useEffect(() => {
  //     startLocalVideo();
  //   }, []);

  return (
    <div>
      <button
        onClick={startLocalVideo}
        className="bg-black text-white px-4 py-2"
      >
        Start Consultation
      </button>

      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-[300px] border"
      />
    </div>
  );
};

export default VideoConsultaton;
