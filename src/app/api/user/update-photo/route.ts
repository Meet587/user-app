import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDB from "@/db/config";
import User from "@/models/user.model";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'public/uploads')); // Specify the public uploads directory
    },
    filename: (req, file, cb) => {
        const { id } = req.params; // Get the id from request params
        const ext = path.extname(file.originalname); // Get the file extension
        cb(null, `${id}${ext}`); // Rename the file using the id
    },
});

const upload = multer({ storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // Convert file to base64
        const fileBuffer = await file.arrayBuffer();
        const base64File = Buffer.from(fileBuffer).toString("base64");
        const dataURI = `data:${file.type};base64,${base64File}`;

        // Upload to Cloudinary
        const uploadResponse = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload(
                dataURI,
                {
                    folder: "profile-pictures",
                    transformation: [
                        { width: 500, height: 500, crop: "fill" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else if (!result) {

                        throw new Error("Upload failed");
                    }
                    else resolve(result);
                }
            );
        });

        if (!uploadResponse) {
            return NextResponse.json({ message: "error while uploading photo." }, { status: 500 });
        }

        await connectToDB();
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { imageUrl: uploadResponse?.secure_url as string },
            { new: true }
        );

        return NextResponse.json({
            message: "Profile picture updated successfully",
            imageUrl: uploadResponse.secure_url,
            user: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
