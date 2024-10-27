import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import connectToDB from '@/db/config';
import User from '@/models/user.model';

export async function POST(request: NextRequest) {
    const { userId } = await request.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        await connectToDB();
        const user = await User.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return NextResponse.json({ message: 'User not found', status: 404, success: false });
        }

        const updatedUser = await User.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { twoFactorEnabled: !user.twoFactorEnabled } }
        );

        return NextResponse.json({ success: true, message: "user updated successfully.", status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
    }
}
