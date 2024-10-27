import User from "@/models/user.model";
import connectToDB from "@/db/config";
import speakeasy from "speakeasy";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {

    try {
        await connectToDB();

        const token = await getToken({ req });
        if (!token) {
            return NextResponse.json({ status: 401, message: "Unauthorized" });
        }

        const reqBody = await req.json();
        const { userId, twoFactorToken } = reqBody;

        const user = await User.findById(userId);

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ status: 400, message: "User not found or 2FA not enabled" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: twoFactorToken,
        });

        if (verified) {
            token.twoFactorVerified = true;
            return NextResponse.json({ status: 200, message: "2FA verified successfully", success: true });
        } else {
            return NextResponse.json({ status: 401, message: "Invalid 2FA token", success: false });
        }
    } catch (err) {
        console.log(err);
        return NextResponse.json({ status: 500, message: "Failed to verify 2FA", success: false });
    }
}
