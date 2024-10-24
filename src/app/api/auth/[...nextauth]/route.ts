import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import connectToDB from "@/db/config";
import User from "@/models/user.model";

const authHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        try {
          await connectToDB();
          let dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              twoFactorEnabled: false // Set default value
            });
          }
          token.id = dbUser._id.toString();
          token.twoFactorEnabled = dbUser.twoFactorEnabled;

          console.log("dbUser in token", dbUser, token)
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      // console.log("dbUser in token", token)
      return token;
    },
    async session({ session, token }) {
      // console.log("session", session)
      if (token && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.twoFactorVerified = token.twoFactorVerified as boolean;
      }
      return session;
    },
    // async session({ session }) {
    //   // Connect to DB and find the user
    //   await connectToDB();
    //   if (!session.user?.email) throw new Error("User email not found in session");
    //   const sessionUser = await User.findOne({ email: session.user.email });

    //   if (!sessionUser) throw new Error("User not found");

    //   // Attach user ID and 2FA status to session
    //   session.user.id = sessionUser._id.toString();
    //   session.user.twoFactorEnabled = sessionUser.twoFactorEnabled;

    //   return session;
    // },
    async signIn({ user, profile }) {
      if (!profile || !profile.email) {
        console.log("Invalid profile data");
        return false;
      }
      try {
        await connectToDB();
        const existingUser = await User.findOne({ email: profile.email });

        if (!existingUser) {
          await User.create({
            email: profile.email,
            name: profile.name?.replace(" ", "").toLowerCase() || profile.email?.split('@')[0] || '',
            image: profile.image,
            twoFactorEnabled: true
          });
        }

        const userWith2FA = await User.findOne({ email: profile.email });
        if (userWith2FA?.twoFactorEnabled) {
          // Require 2FA if enabled
          // return `/twofactor-authenticate?userId=${userWith2FA._id}`;
          return true;
        }

        return true;
      } catch (err) {
        console.log("Error during sign-in", err);
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    // newUser: "/register",
  },
});

export async function GET(request: Request, { params }: { params: { nextauth: string[] } }) {
  const response = await authHandler(request, { params });
  return response;
}

export async function POST(request: Request, { params }: { params: { nextauth: string[] } }) {
  const response = await authHandler(request, { params });
  return response;
}
