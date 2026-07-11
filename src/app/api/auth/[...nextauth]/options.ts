export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { signInSchema } from "@/schemas/signInSchema";
import { getRedis } from "@/lib/redis";
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: any, req): Promise<any> {
        try {
          const redis = getRedis();
          // Get client IP
          const forwarded = req?.headers?.["x-forwarded-for"];
          const ip =
            req?.headers?.["x-real-ip"] ??
            (typeof forwarded === "string"
              ? forwarded.split(",")[0].trim()
              : "unknown");

          // Rate limiting
          const key = `signin:${ip}`;
          const requests = await redis.incr(key);

          if (requests === 1) {
            await redis.expire(key, 900);
          }

          if (requests > 10) {
            throw new Error("Too many requests. Please try again later.");
          }

          await dbConnect();

          const result = signInSchema.safeParse(credentials);

          if (!result.success) {
            throw new Error("Authentication failed.");
          }

          const { identifier, password } = result.data;

          const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account first");
          }

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password,
          );

          if (isPasswordCorrect) {
            return user;
          }

          throw new Error("Incorrect username or password");
        } catch (err) {
          console.error("Auth error:", err);
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
