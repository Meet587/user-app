import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDB from "@/db/config";
import User from "@/models/user.model";
import bcryptjs from "bcryptjs";

const authHandler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectToDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          return null;
        }

        const isPasswordCorrect = await bcryptjs.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          // name: user.name,
          image: user.image,
        };
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        try {
          await connectToDB();
          let dbUser = await User.findOne({ email: user.email });
          if (!dbUser) {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(Math.random().toString(36).slice(-8), salt);
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              password: hashedPassword,
              twoFactorEnabled: false
            });
          }
          token.id = dbUser._id.toString();
          token.twoFactorEnabled = dbUser.twoFactorEnabled;
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      // console.log("dbUser in token", token)
      return token;
    },

    async session({ session }) {
      // Connect to DB and find the user
      await connectToDB();
      if (!session.user?.email) throw new Error("User email not found in session");
      const sessionUser = await User.findOne({ email: session.user.email });

      if (!sessionUser) throw new Error("User not found");

      session.user.id = sessionUser._id.toString();
      session.user.twoFactorEnabled = sessionUser.twoFactorEnabled;
      session.user.twoFactorVerified = sessionUser.twoFactorVerified;

      return session;
    },
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
