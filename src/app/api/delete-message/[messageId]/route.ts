export const dynamic = "force-dynamic";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { messageId: string } },
) {
  const messageId = params.messageId;
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }
  try {
    await dbConnect();
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } },
    );
    if (updateResult.modifiedCount == 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or was already deleted.",
        },
        { status: 404 },
      );
    }
    return Response.json(
      { success: true, message: "Message Deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting message", error);

    return Response.json(
      { success: false, message: "Error deleting message" },
      { status: 500 },
    );
  }
}
