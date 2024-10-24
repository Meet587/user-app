import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import connectToDB from "@/db/config";
import { signJWT } from "@/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    await connectToDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const validatePasswor = await bcryptjs.compare(password, user.password);

    if (!validatePasswor) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { stratus: 200, success: true, twoFactorRequired: true, userId: user._id }
      );
    }

    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    const token = signJWT(userData);

    const response = NextResponse.json(
      { status: 200, message: "Login Successfull", success: true, twoFactorRequired: false, token: token },
    );

    return response;
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
