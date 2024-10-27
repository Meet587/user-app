import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import connectToDB from '@/db/config';
import User from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const db = await connectToDB();
        const userProfile = await User.findOne({ _id: new ObjectId(id) });

        if (!userProfile) {
            return NextResponse.json({ message: 'User not found', status: 404, success: false });
        }

        return NextResponse.json({ user: userProfile, message: 'User found', status: 200, success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch user profile', status: 500, success: false });
    }
}
