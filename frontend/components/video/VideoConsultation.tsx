import { socket } from "@/services/socket";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const VideoConsultaton = (props: any) => {
  const { id } = props;

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const remoteStream = useRef(new MediaStream());

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { id, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      console.log("Remote track received");
      console.log("Remote video ref: ", remoteVideoRef.current);
      console.log(event.streams[0]);

      const [stream] = event.streams;

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
  };

  const startLocalVideo = async () => {
    console.log("Creating offer");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      const offer = await peerConnection.current?.createOffer();

      await peerConnection.current?.setLocalDescription(offer);

      socket.emit("offer", { id, offer });
    } catch (error) {
      toast.error("Failed video consultation");
      console.log("Failed video consultation ", error);
    }
  };

  const listenForOffer = () => {
    // console.log("Offer listener registered");

    socket.on("receive-offer", async (offer) => {
      console.log("Creating answer");
      console.log("Offer received", offer);

      createPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      await peerConnection.current?.setRemoteDescription(offer);

      const answer = await peerConnection.current?.createAnswer();

      await peerConnection.current?.setLocalDescription(answer);

      socket.emit("answer", { id, answer });
    });
  };

  const listenForAnswer = () => {
    socket.on("receive-answer", async (answer) => {
      console.log("Answer received", answer);

      console.trace("receive-offer fired");

      await peerConnection.current?.setRemoteDescription(answer);
    });
  };

  const listenForIceCandidate = () => {
    socket.on("receive-ice-candidate", async (candidate) => {
      if (peerConnection.current?.remoteDescription) {
        await peerConnection.current?.addIceCandidate(candidate);
      }
    });
  };

  useEffect(() => {
    listenForOffer();

    listenForAnswer();

    listenForIceCandidate();

    // socket.emit("join-room", id);
    // console.log("ROOM:", id);

    return () => {
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
    };
  }, []);

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

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-[300px] border"
      />
    </div>
  );
};

export default VideoConsultaton;
