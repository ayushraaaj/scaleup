"use client";
import { api } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<any>([]);
  const [pastBookings, setPastBookings] = useState<any>([]);

  const getBookings = async () => {
    try {
      const res = await api.get("/booking/my-bookings");

      setUpcomingBookings(res.data.data.upcoming);
      setPastBookings(res.data.data.past);

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

      <h1>Upcoming</h1>

      <hr />

      {upcomingBookings.length > 0 ? (
        upcomingBookings.map((b: any) => (
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
        ))
      ) : (
        <p>There is not any upcoming bookings</p>
      )}

      <hr />

      <h1>Past</h1>

      {pastBookings.length > 0 ? (
        pastBookings.map((b: any) => (
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
        ))
      ) : (
        <p>There is not any past bookings</p>
      )}
    </div>
  );
};

export default MyBookings;
