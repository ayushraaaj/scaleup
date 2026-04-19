"use client";
import {
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  User,
  Star,
} from "lucide-react";

interface MentorCardProps {
  mentor: any;
}

const MentorCard = (props: MentorCardProps) => {
  const { mentor } = props;

  const formattedDate = new Date(mentor.createdAt)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 hover:border-black transition-colors duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fcfcfc] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
            <User size={16} className="text-gray-400" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-tighter leading-none">
              {mentor.userId.fullname}
            </p>
            <p className="text-[10px] text-blue-600 font-bold tracking-tight italic">
              @{mentor.userId.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
              mentor.visibility === "free"
                ? "border-green-200 text-green-600"
                : "border-purple-200 text-purple-600"
            }`}
          >
            {post.visibility}
          </span> */}
          <button className="text-gray-400 hover:text-black">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-gray-400 mb-2 tracking-[0.2em]">
          {formattedDate}
        </p>

        {/* <h3 className="text-2xl font-black tracking-tighter text-black uppercase mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {mentor.bio}
        </h3> */}

        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 font-medium flex-1">
          {mentor.bio}
        </p>

        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 font-medium flex-1">
          Expertise:{" "}
          {mentor.expertise.map((exp: string) => (
            <span key={exp}>{exp}</span>
          ))}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-6 pt-6 border-t border-gray-100 mt-auto">
          {/* <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
            <Heart size={18} strokeWidth={2.5} />
            <span className="text-xs font-black">{post.likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
            <MessageSquare size={18} strokeWidth={2.5} />
            <span className="text-xs font-black">{post.commentsCount}</span>
          </button> */}
          <p>
            <Star /> {mentor.ratings} ({mentor.totalSessions} sessions)
          </p>
          <button className="ml-auto text-gray-400 hover:text-black transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="h-1 w-0 bg-black group-hover:w-full transition-all duration-500" />
    </div>
  );
};

export default MentorCard;
