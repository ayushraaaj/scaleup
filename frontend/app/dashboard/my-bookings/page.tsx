"use client";
import { api } from "@/services/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState();

  const getBookings = async () => {
    try {
      const res = await api.get("/booking/my-bookings");
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

      <hr className="mt-10" />

      <h1 className="mt-10">Past</h1>
    </div>
  );
};

export default MyBookings;
