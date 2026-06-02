import { socket } from "@/services/socket";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const VideoConsultaton = (props: any) => {
  const { id } = props;

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const createPeerConnection = () => {
    if (peerConnection.current) {
      return;
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
        {
          urls: [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:443?transport=tcp",
          ],
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // console.log("candidate event ", event.candidate);

        // console.log("candidate event ", event.candidate?.candidate);

        socket.emit("ice-candidate", {
          id,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      // console.log("Remote track received");
      // console.log("Remote video ref: ", remoteVideoRef.current);

      // console.log(event.streams[0]);

      // const stream1 = event.streams[0];

      // console.log("Video tracks:", stream1.getVideoTracks());
      // console.log("Audio tracks:", stream1.getAudioTracks());
      // console.log("Active:", stream1.active);

      const [stream] = event.streams;

      // const videoTrack = stream.getVideoTracks()[0];

      // const videoTrack = stream.getVideoTracks()[0];

      // videoTrack.onunmute = () => {
      //   console.log("VIDEO TRACK UNMUTED");
      // };

      // videoTrack.onmute = () => {
      //   console.log("VIDEO TRACK MUTED");
      // };

      // console.log("track muted:", videoTrack?.muted);
      // console.log("track enabled:", videoTrack?.enabled);
      // console.log("track readyState:", videoTrack?.readyState);

      if (
        remoteVideoRef.current &&
        remoteVideoRef.current.srcObject !== stream
      ) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // peerConnection.current.onconnectionstatechange = () => {
    //   console.log("CONNECTION:", peerConnection.current?.connectionState);
    // };

    // peerConnection.current.oniceconnectionstatechange = () => {
    //   console.log("ICE:", peerConnection.current?.iceConnectionState);
    // };

    // peerConnection.current.onicegatheringstatechange = () => {
    //   console.log("GATHERING:", peerConnection.current?.iceGatheringState);
    // };
  };

  const startLocalVideo = async () => {
    // console.log("Creating offer");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      createPeerConnection();

      // const videoTrack = stream.getVideoTracks()[0];

      // console.log("LOCAL VIDEO TRACK");
      // console.log("enabled:", videoTrack.enabled);
      // console.log("readyState:", videoTrack.readyState);
      // console.log("muted:", videoTrack.muted);

      stream.getTracks().forEach((track) => {
        // const videoTrack = stream.getVideoTracks()[0];

        // console.log("LOCAL VIDEO TRACK");
        // console.log("enabled:", videoTrack.enabled);
        // console.log("readyState:", videoTrack.readyState);
        // console.log("muted:", videoTrack.muted);

        peerConnection.current?.addTrack(track, stream);
      });

      const offer = await peerConnection.current?.createOffer();

      // console.log("========== OFFER SDP ==========");
      // console.log(offer.sdp);

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
      // console.log("Creating answer");
      // console.log("Offer received", offer);

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

      // console.log(
      //   "Remote description set:",
      //   peerConnection.current!.remoteDescription?.type,
      // );

      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();

        if (candidate) {
          await peerConnection.current?.addIceCandidate(candidate);
        }
      }

      const answer = await peerConnection.current?.createAnswer();

      // console.log("========== ANSWER SDP ==========");
      // console.log(answer.sdp);

      await peerConnection.current?.setLocalDescription(answer);

      socket.emit("answer", { id, answer });
    });
  };

  const listenForAnswer = () => {
    socket.on("receive-answer", async (answer) => {
      // console.log("Answer received", answer);

      // console.trace("receive-offer fired");

      await peerConnection.current?.setRemoteDescription(answer);

      // console.log(
      //   "Remote description set:",
      //   peerConnection.current!.remoteDescription?.type,
      // );

      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();

        if (candidate) {
          await peerConnection.current?.addIceCandidate(candidate);
        }
      }
    });
  };

  const listenForIceCandidate = () => {
    socket.on("receive-ice-candidate", async (candidate) => {
      if (peerConnection.current?.remoteDescription) {
        await peerConnection.current.addIceCandidate(candidate);
      } else {
        pendingCandidates.current.push(candidate);
      }
    });
  };

  const clearConnection = () => {
    peerConnection.current?.close();

    const localStream = localVideoRef.current?.srcObject as MediaStream;

    localStream?.getTracks().forEach((track) => {
      track.stop();
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    const remoteStream = remoteVideoRef.current?.srcObject as MediaStream;

    remoteStream?.getTracks().forEach((track) => {
      track.stop();
    });

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    peerConnection.current = null;

    pendingCandidates.current = [];
  };

  const endCall = () => {
    socket.emit("end-call", { id });

    clearConnection();
  };

  const listenForCallEnd = () => {
    socket.on("call-ended", () => {
      console.log("Remote user ended call");

      clearConnection();

      toast.success("Call ended");
    });
  };

  useEffect(() => {
    listenForOffer();

    listenForAnswer();

    listenForIceCandidate();

    listenForCallEnd();

    socket.emit("join-room", id);
    // console.log("ROOM:", id);

    return () => {
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
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

      <button onClick={endCall} className="bg-red-500 text-white px-4 py-2">
        End Call
      </button>
    </div>
  );
};

export default VideoConsultaton;
