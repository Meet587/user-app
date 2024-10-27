import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDB from "@/db/config";
import User, { UserRole } from "@/models/user.model";
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
        console.log("credentials", credentials)
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
          name: user.name,
          imageUrl: user.imageUrl,
          twoFactorEnabled: false,
          role: UserRole.user
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
              imageUrl: user.imageUrl,
              password: hashedPassword,
              twoFactorEnabled: false,
              role: UserRole.user
            });
          }
          token.id = dbUser._id.toString();
          token.twoFactorEnabled = dbUser.twoFactorEnabled;
          token.imageUrl = dbUser.imageUrl;
          token.role = dbUser.role;
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        await connectToDB();
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          session.user.id = user._id.toString();
          session.user.imageUrl = user.imageUrl;
          session.user.twoFactorEnabled = user.twoFactorEnabled;
          session.user.twoFactorVerified = user.twoFactorVerified;
          session.user.role = user.role;
        }
      }
      return session;
    },
    async signIn({ user, profile }) {
      console.log(profile, user)
      const userData = profile || user;
      if (!userData || !userData.email) {
        console.log("Invalid user data");
        return false;
      }
      try {
        await connectToDB();
        const existingUser = await User.findOne({ email: userData.email });

        if (!existingUser) {
          await User.create({
            email: userData.email,
            name: userData.name?.replace(" ", "").toLowerCase() || userData.email?.split('@')[0] || '',
            //@ts-ignore
            imageUrl: 'image' in userData ? userData.image : (userData as typeof User).imageUrl,
            twoFactorEnabled: false
          });
        }

        const userWith2FA = await User.findOne({ email: userData.email });
        if (userWith2FA?.twoFactorEnabled) {
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
