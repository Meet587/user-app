import User from "@/models/user.model";
import connectToDB from "@/db/config";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {
    await connectToDB();

    const { userId } = await req.json();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ status: 404, message: "User not found" });
    }

    const secret = speakeasy.generateSecret({ name: "UserApp" });
    user.twoFactorSecret = secret.base32; // Save the 2FA secret
    user.twoFactorEnabled = true;
    await user.save();

    const otpAuthUrl = secret.otpauth_url as string;

    // Generate QR code to display to the user
    const qrCodeImage = await qrcode.toDataURL(otpAuthUrl);

    return NextResponse.json({ status: 200, qrCodeImage, secret: secret.base32 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ status: 500, message: "Failed to generate 2FA setup" });
  }

}
