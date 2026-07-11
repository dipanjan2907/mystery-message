export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    await dbConnect();
    //Aggregation Pipeline
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 401 },
      );
    }

    return Response.json(
      { success: true, messages: user[0].messages },
      { status: 200 },
    );
  } catch (err) {
    console.error("An unexpected error occured: ", err);
    return Response.json(
      { success: false, message: "could not fetch messages" },
      { status: 500 },
    );
  }
}
