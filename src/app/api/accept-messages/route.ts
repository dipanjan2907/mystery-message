export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = user._id;
  const body = await request.json();

  const result = acceptMessageSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        success: false,
        message: "Invalid input.",
      },
      { status: 400 },
    );
  }

  const { acceptMessages } = result.data;

  try {
    await dbConnect();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept messages",
        },
        {
          status: 401,
        },
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error("Error updating message acceptance status:", err);
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept messages",
      },
      {
        status: 500,
      },
    );
  }
}
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = user?._id;
  try {
    await dbConnect();
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    return Response.json(
      { success: true, isAcceptingMessages: foundUser.isAcceptingMessage },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { success: false, message: "Error in getting message acceptance status" },
      { status: 500 },
    );
  }
}
