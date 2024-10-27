import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDB from "@/db/config";
import User from "@/models/user.model";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const imageUrl = `/uploads/${file.name}`;

        await connectToDB();
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { imageUrl } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Profile photo updated successfully", imageUrl });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
