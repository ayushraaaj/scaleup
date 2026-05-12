"use client";
import { api } from "@/services/axios";
import { getUserRole } from "@/utils/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MySessions = () => {
  const userRole = getUserRole();

  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/mentor/my-sessions`);

      setUpcomingSessions(res.data.data.upcoming);
      setPastSessions(res.data.data.past);
    } catch (error: any) {
      toast.error(error.response.data.message ?? "Failed to fetch sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div>
      {userRole === "mentor" ? (
        <div>
          <h1>My Sessions</h1>

          <h1>Upcoming</h1>

          <hr />

          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((s: any) => (
              <div key={s._id}>
                <p>Mentor: {`${s.userId.fullname} (@${s.userId.username})`}</p>
                <p>Session Type: {s.sessionType}</p>
                <p>Total Price: {s.totalPrice}</p>

                <p>Date: {s.date}</p>
                <p>Time: {`${s.startTime} - ${s.endTime}`}</p>

                <hr />
              </div>
            ))
          ) : (
            <p>There is not any upcoming sessions</p>
          )}

          <hr />

          <h1>Past</h1>

          {pastSessions.length > 0 ? (
            pastSessions.map((s: any) => (
              <div key={s._id}>
                <p>Mentor: {`${s.userId.fullname} (@${s.userId.username})`}</p>
                <p>Session Type: {s.sessionType}</p>
                <p>Total Price: {s.totalPrice}</p>

                <p>Date: {s.date}</p>
                <p>Time: {`${s.startTime} - ${s.endTime}`}</p>

                <hr />
              </div>
            ))
          ) : (
            <p>There is not any past sessions</p>
          )}
        </div>
      ) : (
        <div className="h-screen flex items-center justify-center p-8">
          <div className="max-w-md text-center border-4 border-black p-12 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">
              Mentor Profile Required
            </h1>
            <p className="text-gray-500 font-medium mb-8 uppercase text-xs tracking-widest">
              Upgrade your account to start publishing articles on the ScaleUp
              feed.
            </p>
            <button className="bg-black text-white px-10 py-4 font-black uppercase text-xs hover:bg-blue-600 transition-colors">
              Apply for Mentor Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
