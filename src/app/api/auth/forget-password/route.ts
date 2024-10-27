import connectToDB from "@/db/config";
import User from "@/models/user.model";
import { verifyEmail } from "@/utils/mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email } = reqBody;

    await connectToDB();
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        { message: "User with this email not found." },
        { status: 400 }
      );
    }

    await verifyEmail({ email, emailType: "RESET", userId: user._id });

    return NextResponse.json(
      { message: "Email sent for reset password", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
