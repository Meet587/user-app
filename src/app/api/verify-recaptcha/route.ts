import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`);

        if (response.data.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: "reCAPTCHA verification failed" });
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return NextResponse.json({ success: false, message: "Error verifying reCAPTCHA" });
    }
}
