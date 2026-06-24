import { getUser } from "@/utils/auth";

const Settings = () => {
  const user = getUser();

  console.log("User ", user);

  return (
    <div>
      <h1>Settings</h1>

      {user?.role === "mentor" && <button>Become a Mentor</button>}
    </div>
  );
};

export default Settings;
