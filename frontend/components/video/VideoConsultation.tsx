import { socket } from "@/services/socket";
import { getUser } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CallChat from "../chat/CallChat";
import CameraPlaceholder from "./CameraPlaceholder";

const VideoConsultaton = (props: any) => {
  const { id } = props;

  const router = useRouter();

  const user = getUser();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenShareRef = useRef<MediaStreamTrack | null>(null);
  const previousCameraState = useRef(false);

  const [isMuted, setIsMuted] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [remoteCameraEnabled, setRemoteCameraEnabled] = useState(false);
  const [remoteUserFullname, setRemoteUserFullname] = useState("");

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

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;

      console.log("CONNECTION:", state);

      if (state === "connected") {
        setConnectionStatus("Connected");

        if (!callStarted) {
          setCallStarted(true);
        }
      } else if (state === "connecting") {
        setConnectionStatus("Connecting...");
      } else if (state === "disconnected" || state === "failed") {
        setConnectionStatus("Disconnected");
      }
    };

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

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
      }

      localStreamRef.current = stream;

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

      socket.emit("offer", { id, offer, fullname: user?.fullname });
    } catch (error) {
      toast.error("Failed video consultation");
      console.log("Failed video consultation ", error);
    }
  };

  const listenForOffer = () => {
    // console.log("Offer listener registered");

    socket.on("receive-offer", async ({ offer, fullname }) => {
      // console.log("Creating answer");
      // console.log("Offer received", offer);

      createPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
      }

      localStreamRef.current = stream;

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

      setRemoteUserFullname(fullname);
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

    router.back();
  };

  const listenForCallEnd = () => {
    socket.on("call-ended", () => {
      console.log("Remote user ended call");

      clearConnection();

      toast.success("Call ended");

      router.back();
    });
  };

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    audioTrack.enabled = !audioTrack.enabled;

    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;

    setCameraEnabled(videoTrack.enabled);

    socket.emit("camera-status", {
      id,
      enabled: videoTrack.enabled,
    });
  };

  const listenForUserJoin = () => {
    socket.on("user-joined-call", ({ fullname }) => {
      console.log("User joined call");

      setRemoteUserFullname(fullname);

      startLocalVideo();
    });
  };

  const listenForCallDecline = () => {
    socket.on("call-declined", () => {
      toast.error("User declined the call");

      router.back();
    });
  };

  const restoreCamera = async () => {
    console.log("SCREEN SHARE ENDED");

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    const sender = peerConnection.current
      ?.getSenders()
      .find((sender) => sender.track?.kind === "video");

    if (!videoTrack || !sender) {
      return;
    }

    await sender?.replaceTrack(videoTrack);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setCameraEnabled(previousCameraState.current);

    setIsScreenSharing(false);
  };

  const startScreenShare = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const screenTrack = screenStream.getVideoTracks()[0];

    screenShareRef.current = screenTrack;

    const sender = peerConnection.current
      ?.getSenders()
      .find((sender) => sender.track?.kind === "video");

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    previousCameraState.current = videoTrack?.enabled ?? false;

    console.log("Replacing track");

    await sender?.replaceTrack(screenTrack);

    console.log("Track replaced");

    setIsScreenSharing(true);

    screenTrack.onended = restoreCamera;
  };

  const stopScreenShare = async () => {
    await restoreCamera();

    screenShareRef.current?.stop();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const listenForRemoteCameraStatus = () => {
    socket.on("remote-camera-status", ({ enabled }) => {
      setRemoteCameraEnabled(enabled);
    });
  };

  useEffect(() => {
    console.log("CALL PAGE MOUNTED");

    socket.connect();

    listenForOffer();

    listenForAnswer();

    listenForIceCandidate();

    listenForCallEnd();

    listenForCallDecline();

    listenForRemoteCameraStatus();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("join-room", id);

      if (user?.role === "mentor") {
        listenForUserJoin();
      } else if (user?.role === "user") {
        socket.emit("user-joined-call", { id, fullname: user?.fullname });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("receive-offer");
      socket.off("receive-answer");
      socket.off("receive-ice-candidate");
      socket.off("call-ended");
      socket.off("user-joined-call");
      socket.off("call-declined");
      socket.off("remote-camera-status");
    };
  }, []);

  useEffect(() => {
    if (!callStarted) {
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStarted]);

  return (
    <div>
      <div className="flex-1 relative">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`
    absolute
    bottom-20
    right-0
    w-64
    rounded-lg
    border ${cameraEnabled ? "block" : "hidden"}
  `}
        />

        {!cameraEnabled && (
          <CameraPlaceholder
            className={
              "absolute bottom-20 right-0 w-64 h-38 rounded-lg border bg-gray-500"
            }
            fullname={user?.fullname}
          />
        )}

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-[650px] object-cover ${remoteCameraEnabled ? "block" : "hidden"}`}
        />

        {!remoteCameraEnabled && (
          <CameraPlaceholder
            className={"w-full h-[650px] object-cover bg-gray-600"}
            fullname={remoteUserFullname ? remoteUserFullname : "Connecting..."}
          />
        )}

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-black text-white px-3 py-1 rounded">
            {connectionStatus}
          </span>
        </div>

        <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded">
          {formatDuration(callDuration)}
        </div>

        <div className="h-20 flex justify-center items-center gap-4">
          <button onClick={toggleMute}> {isMuted ? "Unmute" : "Mute"} </button>

          <button onClick={toggleCamera}>
            {cameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          >
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </button>

          <button onClick={() => setShowChat(!showChat)}>Chat</button>

          <button onClick={endCall} className="bg-red-500 text-white px-4 py-2">
            End Call
          </button>
        </div>
      </div>
      {showChat && <CallChat id={id} url="" />}
    </div>
  );
};

export default VideoConsultaton;
