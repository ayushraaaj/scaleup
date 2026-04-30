"use client";
import { api } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState<any>([]);

  const getBookings = async () => {
    try {
      const res = await api.get("/booking/my-bookings");
      setBookings(res.data.data);
      console.log(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  return (
    <div>
      <h1>My Bookings</h1>

      <hr />

      {bookings.length > 0 &&
        bookings.map((b: any) => (
          <div key={b._id}>
            <p>
              Mentor:{" "}
              {`${b.mentorId.userId.fullname} (@${b.mentorId.userId.username})`}
            </p>
            <p>Session Type: {b.sessionType}</p>
            <p>Total Price: {b.totalPrice}</p>

            <p>Date: {b.date}</p>
            <p>Time: {`${b.startTime} - ${b.endTime}`}</p>

            <hr />
          </div>
        ))}
    </div>
  );
};

export default MyBookings;
