"use client";
import VideoConsultaton from "@/components/video/VideoConsultation";
import { useParams } from "next/navigation";

const CallPage = () => {
  const { bookingId } = useParams();

  return (
    <div>
      <VideoConsultaton id={bookingId} />
    </div>
  );
};

export default CallPage;
