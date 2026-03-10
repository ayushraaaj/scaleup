// "use client";
import { getUserRole } from "@/utils/auth";

const CreatePost = () => {
    const userRole = getUserRole();

    return (
        <div>
            {userRole == "mentor" ? (
                <h1>Create Post</h1>
            ) : (
                <h1>Upgrade to mentor profile to publish your post</h1>
            )}
        </div>
    );
};

export default CreatePost;
