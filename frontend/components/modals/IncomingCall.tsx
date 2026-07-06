import { useRouter } from "next/navigation";

const IncomingCall = (props: any) => {
  const { id, decline, date, endTime } = props;

  const router = useRouter();

  return (
    <div>
      <h2>Incoming Call</h2>

      <button
        onClick={() =>
          router.push(`/call/${id}?date=${date}&endTime=${endTime}`)
        }
        className="bg-black text-white px-4 py-2"
      >
        Join Call
      </button>

      <button
        onClick={decline}
        className="bg-red-500 text-white px-4 py-2 ml-5"
      >
        Decline
      </button>
    </div>
  );
};

export default IncomingCall;
