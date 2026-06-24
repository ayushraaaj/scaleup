"use client";
import { getUser } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Settings = () => {
  let user = getUser();

  console.log("User ", user);

  const router = useRouter();

  return (
    <div>
      <h1>Settings</h1>

      {user?.role === "user" && (
        <button onClick={() => router.push("/dashboard/become-mentor")}>
          Become a Mentor
        </button>
      )}
    </div>
  );
};

export default Settings;
