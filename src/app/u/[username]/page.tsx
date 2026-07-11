import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import SendMessageClient from "./SendMessageClient";
import { Ghost, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  let user;
  try {
    await dbConnect();

    // Directly verify user status via Server Component logic
    user = await UserModel.findOne({ username: params.username });
  } catch (error) {
    console.error("Error fetching user profile:");
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
        <ShieldAlert className="w-12 h-12 text-[#A85252] mb-6" />
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-3">
          Service Unavailable
        </h1>
        <p className="text-[#828896] text-sm md:text-base text-center max-w-md font-light">
          We are currently unable to process your request. Please try again
          later.
        </p>
      </div>
    );
  }

  // Handle Edge Case 1: User doesn't exist
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
        <Ghost className="w-12 h-12 text-[#5C616E] mb-6" />
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-3">
          Ghost Town
        </h1>
        <p className="text-[#828896] text-sm md:text-base text-center max-w-md font-light">
          The user{" "}
          <span className="text-[#EBEAE6] font-medium">@{params.username}</span>{" "}
          does not exist in our records. They may have changed their alias or
          deleted their account.
        </p>
      </div>
    );
  }

  // Handle Edge Case 2: User has disabled their portal
  if (!user.isAcceptingMessage) {
    return (
      <div className="min-h-screen bg-[#0B0C0E] text-[#EBEAE6] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#B87B5C] selection:text-[#0B0C0E]">
        <ShieldAlert className="w-12 h-12 text-[#A85252] mb-6" />
        <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-3">
          Inbox Closed
        </h1>
        <p className="text-[#828896] text-sm md:text-base text-center max-w-md font-light">
          <span className="text-[#EBEAE6] font-medium">@{params.username}</span>{" "}
          is not accepting anonymous messages at this time.
        </p>
      </div>
    );
  }

  // Render the interactive Client Component for sending messages
  return <SendMessageClient username={params.username} />;
}
