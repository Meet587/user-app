import connectToDB from "@/db/config";
import User from "@/models/user.model";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { newPassword, token } = reqBody;

    await connectToDB();

    const salt = await bcryptjs.genSalt(10);
    const hashePassword = await bcryptjs.hash(newPassword, salt);

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid Token" }, { status: 400 });
    }

    user.password = hashePassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;

    await user.save()

    return NextResponse.json(
      { message: "password change successfully.", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
