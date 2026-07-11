export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import { signUpSchema } from "@/schemas/signUpSchema";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { getRedis } from "@/lib/redis";

export async function POST(request: Request) {
  const redis = getRedis();
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("x-real-ip") ??
    (forwarded ? forwarded.split(",")[0].trim() : "unknown");

  try {
    const key = `signup:${ip}`;
    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, 60); // 60-second window
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
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message: "Invalid input.",
        },
        { status: 400 },
      );
    }

    const { username, email, password } = result.data;
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = crypto.randomInt(100000, 1000000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: "User already exists with this email" },
          { status: 400 },
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        const ONE_MINUTE = 60 * 1000;
        const ONE_HOUR = 60 * ONE_MINUTE;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + ONE_HOUR);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    //send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: "Failed to send verification email",
        },
        { status: 500 },
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successgfully. Please verify your email.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Error registering user", err);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      },
    );
  }
}
