"use client";
import { api } from "@/services/axios";
import { setAccessToken, setUser } from "@/utils/auth";
import { useEffect, useState } from "react";

const ClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.post("/auth/refresh-token");

      setAccessToken(res.data.data.newAccessToken);
      setUser(res.data.data.user);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  if (loading) {
    return null;
  }

  return <>{children}</>;
};

export default ClientWrapper;
