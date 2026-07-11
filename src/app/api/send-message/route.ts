export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";
import { messageSchema } from "@/schemas/messageSchema";
import { redis } from "@/lib/redis";
export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    (forwarded ? forwarded.split(",")[0].trim() : "unknown");
  const body = await request.json();
  const result = messageSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        success: false,
        message: "Invalid input.",
      },
      { status: 400 },
    );
  }
  const { username, content } = result.data;
  try {
    const key = `message:${ip}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, 60);
    }

    if (requests > 5) {
      return Response.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }
    await dbConnect();
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        {
          status: 403,
        },
      );
    }

    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error adding message(s)", err);
    return Response.json(
      { success: false, message: "Internal Server error" },
      { status: 500 },
    );
  }
}
