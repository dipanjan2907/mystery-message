export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { verifySchema } from "@/schemas/verifySchema";
import { redis } from "@/lib/redis";
export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    (forwarded ? forwarded.split(",")[0].trim() : "unknown");
  try {
    const key = `verify:${ip}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, 900);
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
    const body = await request.json();

    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid input.",
        },
        { status: 400 },
      );
    }
    const { username, code } = result.data;
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 },
      );
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account verified successfully!!",
        },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification Code has expired. Please signup again to get a new code",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification Code.",
        },
        { status: 401 },
      );
    }
  } catch (err) {
    console.error("Error verifying user", err);
    return Response.json(
      {
        success: false,
        message: "Error verifying user",
      },
      { status: 500 },
    );
  }
}
