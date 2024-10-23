import connectToDB from "@/db/config";
import User from "@/models/user.model";
import { verifyEmail } from "@/utils/mailer";
import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    await connectToDB();
    const user = await User.findOne({ email });

    if (user) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashePassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashePassword });

    //send verification email
    await verifyEmail({ email, emailType: "VERIFY", userId: newUser._id });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
